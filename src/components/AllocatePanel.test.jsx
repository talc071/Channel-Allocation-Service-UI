import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllocatePanel from './AllocatePanel.jsx';
import { allocate } from '../api/allocations.js';
import { ApiError } from '../api/client.js';

vi.mock('../api/allocations.js', () => ({
  allocate: vi.fn(),
}));

beforeEach(() => {
  allocate.mockReset();
});

describe('AllocatePanel', () => {
  it('submits valid input and shows the assigned channel on success', async () => {
    const user = userEvent.setup();
    allocate.mockResolvedValueOnce({
      ad_id: 'ad-1',
      platform: 'fb',
      channel: 'ono42',
      allocated_at: '2026-04-27T10:00:00Z',
    });
    const onSuccess = vi.fn();

    render(<AllocatePanel onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/ad id/i), 'ad-1');
    await user.selectOptions(screen.getByLabelText(/platform/i), 'fb');
    await user.click(screen.getByRole('button', { name: /allocate/i }));

    expect(allocate).toHaveBeenCalledWith({ adId: 'ad-1', platform: 'fb' });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(/channel ono42 assigned/i),
    ).toBeInTheDocument();
  });

  it('blocks submit when fields are missing and shows inline errors', async () => {
    const user = userEvent.setup();
    render(<AllocatePanel />);

    await user.click(screen.getByRole('button', { name: /allocate/i }));

    expect(allocate).not.toHaveBeenCalled();
    expect(await screen.findByText(/ad id is required/i)).toBeInTheDocument();
  });

  it('surfaces server-side validation errors as field errors', async () => {
    const user = userEvent.setup();
    allocate.mockRejectedValueOnce(
      new ApiError({
        status: 422,
        message: 'Invalid platform',
        fieldErrors: { platform: 'Invalid platform' },
      }),
    );

    render(<AllocatePanel />);

    await user.type(screen.getByLabelText(/ad id/i), 'ad-1');
    await user.selectOptions(screen.getByLabelText(/platform/i), 'fb');
    await user.click(screen.getByRole('button', { name: /allocate/i }));

    expect(
      await screen.findByText(/allocation failed/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/invalid platform/i).length).toBeGreaterThan(0);
  });
});
