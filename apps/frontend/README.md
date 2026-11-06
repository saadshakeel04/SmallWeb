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

Navigation entries and the current index are held in Zustand separately from
persistent visit history. Back and Forward select cached entries without
fetching the site again. Each entry keeps its own iframe scroll position, and a
new successful navigation after Back truncates the forward entries.

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

To check browser navigation, first rerun `npm run seed` in `apps/backend` so
the long Tidepool page is available. Browse Tidepool, scroll well down, and
enter `paperboats.zz` in the address bar. Press Back and confirm Tidepool
returns at its previous scroll position. Then visit `quietforest.zz` and
`bluehour.zz`, press Back twice to Paperboats, then Forward once to Quiet
Forest. Finally go Back to Paperboats and enter `clockworkcafe.zz`; Forward
should now be disabled because the old forward entries were truncated.

## Persistent browsing history

Every successful typed or internal-link navigation is recorded for the visitor
who opened it. Opening an address from the History panel records a separate
`history` visit. Back and Forward only restore the in-memory browser stack and
do not create visits. The panel loads the selected visitor's server history in
pages of five entries.

To validate history, browse several sites as one visitor and confirm the newest
visits appear first. Use Back and Forward and confirm the list does not gain
entries. Select another visitor and confirm their visits are different. The
seeded first visitor has eleven visits, so the panel should offer three pages.
Refresh the app, reselect that visitor, and confirm the same history is still
available.

## Full-text search

Open the Search tab beside History and search for a word or phrase. Multiword
queries match as a phrase. Results include the site title, address, and an
excerpt from matching page content.
Selecting a result opens that site and records the visit with source `search`.

To validate content search, rerun `npm run seed` in `apps/backend`, then search
for `unusual birds`. Quiet Forest should appear even though those words are not
in its title. Search for a phrase such as `no matching small web content` to
check the empty state. Stop the backend and submit a search to check the error
state; restore it and confirm another search succeeds.
