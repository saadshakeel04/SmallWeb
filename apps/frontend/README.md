# Small Web frontend

The frontend is a Next.js App Router application. It provides the browser shell,
visitor selector, address bar, sandboxed website viewer, and loading, not-found,
and connection-error states.

## Configure and run

From `apps/frontend`, copy the example environment file and install dependencies:

```powershell
Copy-Item .env.example .env.local
npm install
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend API base URL. The local
default is `http://localhost:3001/api/v1`. Start MongoDB and the backend first,
then seed its sample data from `apps/backend` with `npm run seed`. Start the
frontend with:

```powershell
npm run dev
```

Open `http://localhost:3000`, select a visitor, and enter an address such as
`tidepool.zz`. The frontend requests people from `/people` and websites from
`/sites/:address` under the configured API base URL. Website HTML is sanitized
by the backend and displayed inside a sandboxed iframe with scripts and network
resources blocked. Internal `.zz` links are intercepted by the parent browser.

## Validate

From `apps/frontend`, run:

```powershell
npm run build
npm run lint
```

For a manual API integration check, keep MongoDB and the backend running, open
the frontend, select a visitor, and browse to `tidepool.zz`. Verify its links
stay inside the application by opening the paper boat journal link. Try
`glassgarden.zz` to see the not-found state. Stop the backend and reload the
frontend to see the connection error and people retry action.
