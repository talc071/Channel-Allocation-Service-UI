import { useEffect } from 'react';

/**
 * Auto-clear a piece of state after `ms` milliseconds whenever it becomes
 * truthy. Errors should usually persist until the next attempt; only
 * success banners use this so they don't linger and clutter the UI.
 */
export default function useAutoDismiss(value, clear, ms = 4000) {
  useEffect(() => {
    if (!value) return undefined;
    const id = window.setTimeout(clear, ms);
    return () => window.clearTimeout(id);
  }, [value, clear, ms]);
}
