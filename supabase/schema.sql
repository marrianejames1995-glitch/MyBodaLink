-- =============================================================================
-- MyBodaLink — Supabase schema, Row-Level Security & storage policies
-- =============================================================================
-- Run this in the Supabase SQL editor for your project.
-- It is idempotent: safe to re-run.
--
-- NOTES
--   * Authentication is email + password, where the "email" is derived from the
--     user's phone number (see src/lib/phone.ts). Users only ever type a phone.
--   * For instant login after sign-up, disable "Confirm email" in
--     Authentication → Settings (Auth → Providers → Email). Otherwise the
--     `supabase.auth.signUp` call returns no session and the profile insert
--     that follows will be blocked by RLS.
-- =============================================================================

-- Required extensions --------------------------------------------------------
create extension if not exists "pgcrypto";

-- =============================================================================
-- profiles
-- =============================================================================
create table if not exists public.profiles (
  id                                uuid primary key references auth.users(id) on delete cascade,
  full_name                         text not null,
  phone_number                      text not null,
  role                              text not null check (role in ('client', 'rider', 'taxi_driver')),
  profile_photo_url                 text,
  motorcycle_registration_number    text,
  vehicle_registration_number       text,
  vehicle_type                      text check (vehicle_type in ('Sedan', 'SUV', 'Van', 'Pickup', 'Taxi', 'Minibus')),
  county                            text,
  town                              text,
  area                              text,
  created_at                        timestamptz not null default now(),
  updated_at                        timestamptz not null default now()
);

create index if not exists profiles_role_idx        on public.profiles (role);
create index if not exists profiles_county_idx      on public.profiles (county);
create index if not exists profiles_location_idx    on public.profiles (county, town);
create index if not exists profiles_updated_at_idx  on public.profiles (updated_at desc);

-- Keep updated_at fresh on every update.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;

-- Enable realtime broadcasts for the profiles table so the client search page
-- auto-updates when new riders/taxi drivers register. (Supabase default doesn't
-- broadcast table changes unless you add them to the publication.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

-- Everyone who is signed in can read profiles (clients search for riders/taxis).
drop policy if exists "profiles are readable by authenticated users" on public.profiles;
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- A user can create / update / delete only their own profile row.
drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "users delete their own profile" on public.profiles;
create policy "users delete their own profile"
  on public.profiles for delete
  to authenticated
  using (id = auth.uid());

-- =============================================================================
-- connection_history
-- =============================================================================
create table if not exists public.connection_history (
  id                              uuid primary key default gen_random_uuid(),
  client_id                       uuid not null references auth.users(id) on delete cascade,
  provider_id                     uuid not null,
  provider_role                   text not null check (provider_role in ('client', 'rider', 'taxi_driver')),
  provider_name                   text not null,
  provider_phone                  text not null,
  provider_photo_url              text,
  vehicle_type                    text check (vehicle_type in ('Sedan', 'SUV', 'Van', 'Pickup', 'Taxi', 'Minibus')),
  vehicle_registration_number     text,
  county                          text,
  town                            text,
  area                            text,
  action                          text not null check (action in ('call', 'text')),
  created_at                      timestamptz not null default now()
);

create index if not exists connection_history_client_idx     on public.connection_history (client_id, created_at desc);
create index if not exists connection_history_provider_idx   on public.connection_history (provider_id);

alter table public.connection_history enable row level security;

drop policy if exists "users read their own history" on public.connection_history;
create policy "users read their own history"
  on public.connection_history for select
  to authenticated
  using (client_id = auth.uid());

drop policy if exists "users insert their own history" on public.connection_history;
create policy "users insert their own history"
  on public.connection_history for insert
  to authenticated
  with check (client_id = auth.uid());

drop policy if exists "users update their own history" on public.connection_history;
create policy "users update their own history"
  on public.connection_history for update
  to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

drop policy if exists "users delete their own history" on public.connection_history;
create policy "users delete their own history"
  on public.connection_history for delete
  to authenticated
  using (client_id = auth.uid());

-- =============================================================================
-- Account deletion RPC
-- =============================================================================
-- Supabase does not expose auth.users to the anon/authenticated roles, so a
-- user cannot DELETE their own auth row directly. This SECURITY DEFINER
-- function lets a signed-in user delete their own account; the on-delete
-- cascades above clean up profiles + history automatically.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- =============================================================================
-- Storage bucket: profile_photos
-- =============================================================================
-- Public bucket so avatars render without signed URLs. Uploads are restricted
-- to the owner's own folder (`<user-id>/avatar-*`) by RLS.
insert into storage.buckets (id, name, public)
values ('profile_photos', 'profile_photos', true)
on conflict (id) do update set public = true;

-- Anyone can read (public bucket).
drop policy if exists "profile_photos are publicly readable" on storage.objects;
create policy "profile_photos are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'profile_photos');

-- An authenticated user may upload/update only inside their own folder.
drop policy if exists "users manage their own profile_photos" on storage.objects;
create policy "users manage their own profile_photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile_photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update their own profile_photos" on storage.objects;
create policy "users update their own profile_photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile_photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete their own profile_photos" on storage.objects;
create policy "users delete their own profile_photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile_photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
