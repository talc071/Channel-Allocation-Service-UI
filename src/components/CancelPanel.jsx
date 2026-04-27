import { useCallback, useRef, useState } from 'react';
import PanelCard from './PanelCard.jsx';
import Field from './Field.jsx';
import StatusBanner from './StatusBanner.jsx';
import SubmitButton from './SubmitButton.jsx';
import { cancelAllocation } from '../api/allocations.js';
import { validateChannel } from '../utils/validation.js';
import useAutoDismiss from '../hooks/useAutoDismiss.js';

const inputClasses =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

// Map known backend error_codes to the exact wording we want users to see.
// Anything else falls back to the server-provided message (or a generic
// fallback if the response was empty).
const CANCEL_ERROR_MESSAGES = {
  cancel_window_expired: 'cancel window expired',
};

function describeCancelError(error) {
  if (error?.code && CANCEL_ERROR_MESSAGES[error.code]) {
    return CANCEL_ERROR_MESSAGES[error.code];
  }
  return error?.message || 'Cancel failed.';
}

/**
 * Cancels an active allocation. We accept the channel form per the
 * documented assumption; if the backend chose ad_id + platform, swap the
 * field here and the api wrapper will forward whichever keys are set.
 */
export default function CancelPanel({ onSuccess }) {
  const [channel, setChannel] = useState('');
  const [fieldError, setFieldError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef(null);

  useAutoDismiss(success, useCallback(() => setSuccess(null), []));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);
    setSuccess(null);

    const check = validateChannel(channel);
    if (!check.valid) {
      setFieldError(check.message);
      inputRef.current?.focus();
      return;
    }
    setFieldError(null);

    setPending(true);
    try {
      const response = await cancelAllocation({ channel: channel.trim() });
      setSuccess(response ?? { channel: channel.trim() });
      setChannel('');
      onSuccess?.();
    } catch (caught) {
      setServerError(caught);
      if (caught.fieldErrors?.channel) {
        setFieldError(caught.fieldErrors.channel);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <PanelCard
      title="Cancel allocation"
      description="Allowed within 5 minutes of allocation. Cancel does not trigger cooldown."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Field
          label="Channel"
          error={fieldError}
          hint="Cancel window is 5 minutes from allocated_at."
          required
        >
          <input
            ref={inputRef}
            type="text"
            value={channel}
            onChange={(event) => {
              setChannel(event.target.value);
              if (fieldError) setFieldError(null);
            }}
            placeholder="ono42"
            className={inputClasses}
            autoComplete="off"
          />
        </Field>

        <SubmitButton pending={pending} pendingLabel="Cancelling...">
          Cancel allocation
        </SubmitButton>
      </form>

      {success && !serverError && (
        <StatusBanner
          tone="success"
          title={`Allocation for ${success.channel ?? 'channel'} cancelled`}
        >
          The channel is immediately available again.
        </StatusBanner>
      )}

      {serverError && (
        <StatusBanner tone="error" title="Cancel failed.">
          {describeCancelError(serverError)}
        </StatusBanner>
      )}
    </PanelCard>
  );
}
