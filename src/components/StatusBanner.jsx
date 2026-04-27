/**
 * Inline status banner used by every action panel. Centralizing the colors
 * + accessibility (role=status / role=alert) keeps panels focused on logic.
 */

const TONE_CLASSES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function StatusBanner({ tone = 'info', title, children }) {
  if (!title && !children) return null;

  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <div
      role={role}
      className={`rounded-md border px-3 py-2 text-sm ${TONE_CLASSES[tone]}`}
    >
      {title && <p className="font-medium">{title}</p>}
      {children && <div className="mt-0.5 text-[13px]">{children}</div>}
    </div>
  );
}
