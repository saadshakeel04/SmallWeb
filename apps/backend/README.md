# Small Web backend

The backend is a NestJS API that uses MongoDB through Mongoose.

## Requirements

- Node.js 22 or later
- npm
- MongoDB running locally or a MongoDB connection URI

## Configure MongoDB

From `apps/backend`, create a local `.env` file using `.env.example` as a
template:

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI` in `.env` to your MongoDB connection string. The example uses
the local database `small-web` at `mongodb://127.0.0.1:27017/small-web`.
The backend requires `MONGODB_URI` and will fail startup if it is missing or
the database cannot be reached. Do not commit `.env`.

Optional settings:

- `PORT` — API port (default `3001`)
- `FRONTEND_URL` — allowed frontend origin for CORS (default
  `http://localhost:3000`)

## Install and run

```powershell
npm install
npm run start:dev
```

The API listens at `http://localhost:3001/api/v1`. The database-backed health
endpoint is `GET http://localhost:3001/api/v1/health`; it returns
`{"status":"ok","database":"connected"}` when MongoDB is connected.

## Seed deterministic sample data

With MongoDB running and the backend `.env` configured, run this from
`apps/backend`:

```powershell
npm run seed
```

The command upserts three predefined people, ten linked websites, and eighteen
visits with fixed IDs and timestamps. It is safe to run repeatedly; the same
records are updated instead of duplicated. The seed includes a broken link to
`glassgarden.zz` for not-found handling.

Seeded HTML is sanitized before it is written. Site documents are sanitized and
have searchable plain text regenerated when Mongoose validates them, and site
responses are sanitized again before they are returned.

After seeding, these endpoints should return data:

- `GET http://localhost:3001/api/v1/people` — three people.
- `GET http://localhost:3001/api/v1/sites/tidepool.zz` — the Tidepool site.
- `GET http://localhost:3001/api/v1/sites/search?q=unusual%20birds` — sites matching title or body text, including Quiet Forest by its seeded page text.
- `GET http://localhost:3001/api/v1/visits?personId=650000000000000000000001` — the first seeded visitor's visits, newest first.

## Validate

```powershell
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint
npm run build
```

Run the focused HTML security checks with:

```powershell
npm test -- --runInBand src/common/html-sanitizer.spec.ts
```
