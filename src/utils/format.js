/**
 * Display helpers. Centralized so date formatting stays consistent across
 * the table and result banners.
 */

// Pinned to en-US so the UI stays in English regardless of the user's
// system locale; timestamps still render in the local timezone.
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export function formatDateTime(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return DATE_FORMATTER.format(date);
}

export function formatPlatform(value) {
  // Backend uses lowercase codes; uppercase looks better in tables.
  return value ? value.toUpperCase() : '';
}
