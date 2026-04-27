import PanelCard from './PanelCard.jsx';
import StatusBanner from './StatusBanner.jsx';
import { formatDateTime, formatPlatform } from '../utils/format.js';

const inputClasses =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

export default function AllocationsTable({ data, status, error, onRefresh }) {
  return (
    <PanelCard
      title="Active allocations"
      description="All channels currently allocated to an ad."
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {status === 'ready' && `${data.length} active`}
          {status === 'loading' && 'Loading...'}
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={status === 'loading'}
          className={`${inputClasses} cursor-pointer hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Refresh
        </button>
      </div>

      {status === 'error' && (
        <StatusBanner tone="error" title="Could not load allocations.">
          {error?.message ?? 'Unknown error.'}
        </StatusBanner>
      )}

      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-2">Ad ID</th>
              <th scope="col" className="px-4 py-2">Platform</th>
              <th scope="col" className="px-4 py-2">Channel</th>
              <th scope="col" className="px-4 py-2">Allocated at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {status === 'loading' && data.length === 0 && (
              <SkeletonRows rows={3} />
            )}
            {status === 'ready' && data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No active allocations.
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={`${row.channel}-${row.allocated_at}`}>
                <td className="px-4 py-2 font-mono text-slate-800">{row.ad_id}</td>
                <td className="px-4 py-2 text-slate-700">{formatPlatform(row.platform)}</td>
                <td className="px-4 py-2 font-mono text-slate-800">{row.channel}</td>
                <td className="px-4 py-2 text-slate-600">
                  {formatDateTime(row.allocated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

function SkeletonRows({ rows }) {
  return Array.from({ length: rows }).map((_, idx) => (
    <tr key={idx}>
      {Array.from({ length: 4 }).map((__, cellIdx) => (
        <td key={cellIdx} className="px-4 py-3">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}
