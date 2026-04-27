import { useCallback, useEffect, useRef, useState } from 'react';
import { listActive } from '../api/allocations.js';

/**
 * Single source of truth for the active allocations list.
 * Returns a status machine so the table can render distinct loading/error/
 * empty/data states without juggling booleans.
 *
 * status: 'idle' | 'loading' | 'ready' | 'error'
 */
export default function useAllocations() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Tracks the latest in-flight request so out-of-order responses don't
  // overwrite a newer result with stale data.
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError(null);
    try {
      const rows = await listActive();
      if (requestId !== requestIdRef.current) return;
      setData(Array.isArray(rows) ? rows : []);
      setStatus('ready');
    } catch (caught) {
      if (requestId !== requestIdRef.current) return;
      setError(caught);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, status, error, refresh };
}
