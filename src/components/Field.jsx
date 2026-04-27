import { Children, cloneElement, isValidElement, useId } from 'react';

/**
 * Labeled input/select with a consistent error slot. Keeps form markup
 * declarative and accessible (label + aria-invalid + aria-describedby).
 */
export default function Field({
  label,
  error,
  hint,
  children,
  required = false,
}) {
  const errorId = useId();
  const hintId = useId();

  // Clone the single child so callers don't have to repeat the aria wiring.
  const child = Children.only(children);
  const enhanced = isValidElement(child)
    ? cloneElement(child, {
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })
    : child;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </span>
      {enhanced}
      {hint && !error && (
        <span id={hintId} className="text-xs text-slate-500">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}
