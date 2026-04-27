import { useCallback, useRef, useState } from 'react';
import PanelCard from './PanelCard.jsx';
import Field from './Field.jsx';
import StatusBanner from './StatusBanner.jsx';
import SubmitButton from './SubmitButton.jsx';
import { allocate } from '../api/allocations.js';
import { PLATFORMS, validateAdId, validatePlatform } from '../utils/validation.js';
import { formatDateTime } from '../utils/format.js';
import useAutoDismiss from '../hooks/useAutoDismiss.js';

const inputClasses =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

const initialForm = { adId: '', platform: '' };

export default function AllocatePanel({ onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);

  const adIdRef = useRef(null);
  const platformRef = useRef(null);

  useAutoDismiss(result, useCallback(() => setResult(null), []));

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    // Clear field error as user edits; server error stays until next submit.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);

    const adIdCheck = validateAdId(form.adId);
    const platformCheck = validatePlatform(form.platform);
    const localErrors = {
      adId: adIdCheck.valid ? null : adIdCheck.message,
      platform: platformCheck.valid ? null : platformCheck.message,
    };
    setErrors(localErrors);

    if (localErrors.adId) {
      adIdRef.current?.focus();
      return;
    }
    if (localErrors.platform) {
      platformRef.current?.focus();
      return;
    }

    setPending(true);
    try {
      const response = await allocate({
        adId: form.adId.trim(),
        platform: form.platform,
      });
      setResult(response);
      setForm(initialForm);
      onSuccess?.();
    } catch (caught) {
      setServerError(caught);
      // Map FastAPI 422 field errors back onto our form fields.
      if (caught.fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          adId: caught.fieldErrors.ad_id ?? prev.adId,
          platform: caught.fieldErrors.platform ?? prev.platform,
        }));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <PanelCard
      title="Allocate channel"
      description="Assign an available channel to an ad on a platform."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Field label="Ad ID" error={errors.adId} required>
          <input
            ref={adIdRef}
            type="text"
            value={form.adId}
            onChange={update('adId')}
            placeholder="e.g. ad-1234"
            className={inputClasses}
            autoComplete="off"
          />
        </Field>

        <Field label="Platform" error={errors.platform} required>
          <select
            ref={platformRef}
            value={form.platform}
            onChange={update('platform')}
            className={inputClasses}
          >
            <option value="">Select a platform</option>
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </Field>

        <SubmitButton pending={pending} pendingLabel="Allocating...">
          Allocate
        </SubmitButton>
      </form>

      {result && !serverError && (
        <StatusBanner
          tone="success"
          title={`Channel ${result.channel} assigned`}
        >
          <p>
            <span className="font-medium">Ad:</span> {result.ad_id}
            {' · '}
            <span className="font-medium">Platform:</span> {result.platform}
          </p>
          <p>
            <span className="font-medium">Allocated at:</span>{' '}
            {formatDateTime(result.allocated_at)}
          </p>
        </StatusBanner>
      )}

      {serverError && (
        <StatusBanner tone="error" title="Allocation failed.">
          {serverError.message}
        </StatusBanner>
      )}
    </PanelCard>
  );
}
