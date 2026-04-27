/**
 * Primary submit button with built-in pending state. Disables itself and
 * shows a small spinner so callers don't reinvent the markup.
 */
export default function SubmitButton({
  pending = false,
  pendingLabel,
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      {...rest}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {pending ? (pendingLabel ?? 'Working...') : children}
    </button>
  );
}
