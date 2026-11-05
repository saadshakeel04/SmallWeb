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

## Validate

```powershell
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint
npm run build
```
