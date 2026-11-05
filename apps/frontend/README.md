# Small Web frontend

The frontend is a Next.js App Router application. It provides the browser shell,
visitor selector, address bar, and loading, not-found, and connection-error
states.

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
`/sites/:address` under the configured API base URL. Website text is shown as
plain text until the sandboxed renderer is implemented.

## Validate

From `apps/frontend`, run:

```powershell
npm run build
npm run lint
```

For a manual API integration check, keep MongoDB and the backend running, open
the frontend, select a visitor, and browse to `tidepool.zz`. Try
`glassgarden.zz` to see the not-found state. Stop the backend and reload the
frontend to see the connection error and people retry action.
