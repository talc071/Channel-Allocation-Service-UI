# Channel Allocation Service - Frontend

A small React + Vite UI for the Channel Allocation Service. It lets you
allocate channels to ads, free them, cancel recent allocations, and view the
list of currently active allocations.

The backend (FastAPI) lives in a separate repo and exposes the
`/allocations` endpoints documented in [Instructions.txt](Instructions.txt).

## Tech stack

- React 19 + Vite 6 (JavaScript)
- Tailwind CSS v4
- Vitest + React Testing Library

## Getting started

Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

### Pointing the UI at the backend

By default the Vite dev server proxies any `/allocations*` request to
`http://localhost:8000`. Two ways to change that:

1. Run the backend on `localhost:8000` and you're done.
2. Set `VITE_API_BASE_URL` in `.env` (see `.env.example`):

   ```
   VITE_API_BASE_URL=https://your-backend.example.com
   ```

   When `VITE_API_BASE_URL` is set the proxy is bypassed and requests go
   directly to that origin (CORS must be configured server-side).

## Scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Start Vite dev server with HMR.           |
| `npm run build`  | Production build into `dist/`.            |
| `npm run preview`| Preview the production build locally.     |
| `npm test`       | Run the Vitest suite (unit + component).  |
| `npm run test:watch` | Re-run tests on file change.          |

## Project layout

```text
src/
  api/
    client.js          # fetch wrapper, base URL, ApiError
    allocations.js     # endpoint wrappers
  components/
    AllocatePanel.jsx  # POST /allocations
    FreePanel.jsx      # POST /allocations/free
    CancelPanel.jsx    # POST /allocations/cancel
    AllocationsTable.jsx # GET /allocations
    Field.jsx          # labeled input with a11y wiring
    PanelCard.jsx      # consistent panel shell
    StatusBanner.jsx   # success/error/info banner
    SubmitButton.jsx   # primary button with pending state
  hooks/
    useAllocations.js  # list state machine + race-safe refresh
    useAutoDismiss.js  # auto-clear success banners
  utils/
    validation.js      # ad_id / platform / channel rules
    format.js          # date + platform formatting
  App.jsx              # layout
  main.jsx             # entry
  index.css            # tailwind import
  test/setup.js        # vitest setup
```

## Design notes

- **Single API wrapper.** All HTTP calls go through `src/api/client.js`,
  which normalizes FastAPI error shapes (string `detail` and `[{loc,
  msg}]` 422 lists) into a single `ApiError` with a flat `fieldErrors`
  map. Components map those back to inline form errors.
- **Status machine for the list.** `useAllocations` exposes
  `'idle' | 'loading' | 'ready' | 'error'` and tracks the latest request
  id so an out-of-order response can't overwrite newer data.
- **Race-aware refresh.** Every successful allocate / free / cancel
  triggers `refresh()` on the shared hook, so the table always reflects
  the latest state without optimistic updates that could drift from the
  server.
- **No state library.** A single screen with three forms doesn't need
  Redux/Zustand; props plus one hook keep the data flow obvious.

## Assumptions

- `Cancel` accepts `{ channel }`. If the backend ended up with
  `{ ad_id, platform }`, swap the field in `CancelPanel.jsx`. The API
  wrapper in `src/api/allocations.js` already forwards whichever keys
  are present.
- `AllocationResponse` is `{ ad_id, platform, channel, allocated_at }`.
- `FreeResponse` is `{ channel, freed_at, available_at }`.
- Channel format `^ono([1-9]\d{0,4})$` with index <= 99999.

## Tests

Run once:

```bash
npm test
```

What's covered today:

- `validation.js` - ad id / platform / channel rules (unit).
- `AllocatePanel` - happy path, missing-field block, server-side 422
  surfaced as a field error (component, with mocked API).


