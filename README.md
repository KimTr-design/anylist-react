# A List of Anything

A Vite + React + TypeScript frontend for making and sharing simple lists.

## Backend

This repo is frontend-only. It talks to a separate Rails API:

https://github.com/kinoubenkyou/anylist-rails

Clone that repo and get it running locally (Ruby, PostgreSQL, `bundle install`,
`rails db:create db:migrate`, `rails s -p 3000`) before using this frontend —
without it, the app has no data to read or write.

## Setup

```bash
npm install
```

Create a `.env` file in the project root pointing at your running backend:

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Development

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:5173`.

## Build

```bash
npm run build
```

Type-checks with `tsc` and builds a production bundle via Vite.
