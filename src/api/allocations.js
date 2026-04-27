import { request } from './client.js';

/**
 * Endpoint wrappers for the Channel Allocation Service.
 * Each function returns a promise that resolves to the parsed JSON payload
 * or rejects with an ApiError (see ./client.js).
 */

export function allocate({ adId, platform }) {
  return request('/allocations', {
    method: 'POST',
    body: { ad_id: adId, platform },
  });
}

export function freeChannel({ channel }) {
  return request('/allocations/free', {
    method: 'POST',
    body: { channel },
  });
}

// The backend chose the cancel input shape; we accept either { channel } or
// { ad_id, platform } and forward as-is so the UI can flex without changes
// to this module.
export function cancelAllocation(payload) {
  const body = {};
  if (payload.channel) body.channel = payload.channel;
  if (payload.adId) body.ad_id = payload.adId;
  if (payload.platform) body.platform = payload.platform;

  return request('/allocations/cancel', {
    method: 'POST',
    body,
  });
}

export function listActive() {
  return request('/allocations');
}
