import AllocatePanel from './components/AllocatePanel.jsx';
import FreePanel from './components/FreePanel.jsx';
import CancelPanel from './components/CancelPanel.jsx';
import AllocationsTable from './components/AllocationsTable.jsx';
import useAllocations from './hooks/useAllocations.js';

export default function App() {
  const { data, status, error, refresh } = useAllocations();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">
            Channel Allocation Service
          </h1>
          <p className="text-sm text-slate-500">
            Allocate, free, and cancel channel assignments for ads across
            platforms.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <AllocatePanel onSuccess={refresh} />
          <FreePanel onSuccess={refresh} />
          <CancelPanel onSuccess={refresh} />
        </div>

        <AllocationsTable
          data={data}
          status={status}
          error={error}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
