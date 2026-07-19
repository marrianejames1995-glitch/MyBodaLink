/**
 * Phone number utilities.
 *
 * Authentication is phone + password. Because Supabase email/password auth is
 * free and works without an SMS provider, we derive a stable "auth email" from
 * each phone number (e.g. +254712345678 -> 254712345678@mybodalink.app).
 *
 * Users only ever type their phone number; the email is an internal detail.
 * To switch to real emails instead, change the two functions below.
 */

export const AUTH_EMAIL_DOMAIN = 'mybodalink.app'

/** Normalize a Kenyan phone number to a +254XXXXXXXXX form. */
export function normalizePhone(input: string): string {
  let digits = (input || '').replace(/[^\d+]/g, '')

  if (digits.startsWith('+')) {
    digits = digits.slice(1)
  }
  // Local format starting with 0 -> international
  if (digits.startsWith('0')) {
    digits = '254' + digits.slice(1)
  }
  // Already 254 -> keep
  if (!digits.startsWith('254')) {
    // Assume user typed a number without country code
    digits = '254' + digits
  }
  // Trim to a sane length (Kenyan mobiles are 12 digits incl. 254)
  digits = digits.replace(/\D/g, '').slice(0, 15)
  return '+' + digits
}

/** Digits-only phone (used as the email local part). */
export function phoneDigits(input: string): string {
  return normalizePhone(input).replace(/\D/g, '')
}

/** Convert a phone number to the internal auth email. */
export function phoneToEmail(input: string): string {
  return `${phoneDigits(input)}@${AUTH_EMAIL_DOMAIN}`
}

/** Pretty-print a normalized phone for display. */
export function formatPhone(input: string): string {
  const digits = phoneDigits(input)
  // 254712345678 -> +254 712 345 678
  if (digits.length === 12 && digits.startsWith('254')) {
    return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  return input
}

/** Validate that a phone number looks like a Kenyan mobile number. */
export function isValidKenyanPhone(input: string): boolean {
  const digits = phoneDigits(input)
  // 2547XXXXXXXX or 2541XXXXXXXX (12 digits total)
  return digits.length === 12 && digits.startsWith('254') && /^[791]/.test(digits.slice(3))
}
