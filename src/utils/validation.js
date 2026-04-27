/**
 * Client-side validation that mirrors the backend rules so users get
 * immediate feedback without a round-trip. The backend remains the source
 * of truth - any mismatch shows up as a server-side ApiError.
 */

export const PLATFORMS = ['fb', 'ob', 'snp', 'gtag'];

const CHANNEL_REGEX = /^ono([1-9]\d{0,4})$/;
const MAX_CHANNEL_INDEX = 99999;

const ok = { valid: true, message: null };
const err = (message) => ({ valid: false, message });

export function validateAdId(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return err('Ad ID is required.');
  if (trimmed.length > 128) return err('Ad ID is too long.');
  return ok;
}

export function validatePlatform(value) {
  if (!value) return err('Platform is required.');
  if (!PLATFORMS.includes(value)) {
    return err(`Platform must be one of: ${PLATFORMS.join(', ')}.`);
  }
  return ok;
}

export function validateChannel(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return err('Channel is required.');

  const match = CHANNEL_REGEX.exec(trimmed);
  if (!match) return err('Channel must look like "ono1" through "ono99999".');

  const index = Number(match[1]);
  if (index > MAX_CHANNEL_INDEX) {
    return err('Channel index must be between 1 and 99999.');
  }
  return ok;
}
