import { useCallback, useRef, useState } from 'react';
import PanelCard from './PanelCard.jsx';
import Field from './Field.jsx';
import StatusBanner from './StatusBanner.jsx';
import SubmitButton from './SubmitButton.jsx';
import { freeChannel } from '../api/allocations.js';
import { validateChannel } from '../utils/validation.js';
import { formatDateTime } from '../utils/format.js';
import useAutoDismiss from '../hooks/useAutoDismiss.js';

const inputClasses =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

export default function FreePanel({ onSuccess }) {
  const [channel, setChannel] = useState('');
  const [fieldError, setFieldError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef(null);

  useAutoDismiss(result, useCallback(() => setResult(null), []));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const check = validateChannel(channel);
    if (!check.valid) {
      setFieldError(check.message);
      inputRef.current?.focus();
      return;
    }
    setFieldError(null);

    setPending(true);
    try {
      const response = await freeChannel({ channel: channel.trim() });
      setResult(response);
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
      title="Free channel"
      description="Ends the active allocation and starts a 24h cooldown."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Field
          label="Channel"
          error={fieldError}
          hint='e.g. "ono42" — must be currently allocated.'
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

        <SubmitButton pending={pending} pendingLabel="Freeing...">
          Free
        </SubmitButton>
      </form>

      {result && !serverError && (
        <StatusBanner tone="success" title={`Channel ${result.channel} freed`}>
          <p>
            <span className="font-medium">Freed at:</span>{' '}
            {formatDateTime(result.freed_at)}
          </p>
          <p>
            <span className="font-medium">Available at:</span>{' '}
            {formatDateTime(result.available_at)}
          </p>
        </StatusBanner>
      )}

      {serverError && (
        <StatusBanner tone="error" title="Free failed.">
          {serverError.message}
        </StatusBanner>
      )}
    </PanelCard>
  );
}
