import { addHistoryEntry } from '@/lib/api'
import { normalizePhone } from '@/lib/phone'
import type { ConnectionAction, Profile } from '@/lib/types'

/** Build a tel: or sms: link for a phone number. */
export function contactLink(action: ConnectionAction, phone: string): string {
  const tel = normalizePhone(phone)
  return action === 'call' ? `tel:${tel}` : `sms:${tel}`
}

/** Open the dialer/SMS app and (best-effort) log the connection to history. */
export function connectAndLog(
  action: ConnectionAction,
  provider: Profile,
  clientId: string | undefined,
): void {
  // Open the dialer / SMS app.
  window.location.href = contactLink(action, provider.phone_number)

  // Fire-and-forget history logging (only clients have meaningful history).
  if (clientId) {
    addHistoryEntry({ clientId, provider, action }).catch((e) =>
      console.warn('[MyBodaLink] Could not log history:', e),
    )
  }
}
