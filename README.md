# GriefGrid++ Frontend

Next.js crisis-operations frontend for the GriefGrid++ project. It visualizes the live backend graph with a dashboard, analytics deck, command center, search flow, tactical map, graph intelligence screen, person profile, and admin review console.

## Routes

- `/` mission + live overview
- `/dashboard` responder operations console
- `/command-center` expanded live crisis room with notes, notifications, readiness, and actions
- `/search` ranked missing-person search and manual report intake
- `/person/[id]` explainable person profile
- `/map` tactical crisis map
- `/graph` graph intelligence view
- `/analytics` operational analytics and readiness deck
- `/admin` review queue, security, notifications, and audit console

## Run

Start the backend first:

```powershell
cd C:\gridgrief_back
node server.js
```

Then start the frontend:

```powershell
cd C:\griefgrid
npm.cmd run dev
```

Open `http://localhost:3000`.

## Build Checks

```powershell
cd C:\griefgrid
npm.cmd run lint
npm.cmd run build
```

## Configuration

Set `NEXT_PUBLIC_API_URL` if your backend is not running on `http://localhost:4000`.

## Documentation

- `docs/IMPLEMENTATION_MATRIX.md` maps the original document to current implementation status
- `docs/UNIQUE_FEATURES_AND_EXTRAS.md` lists the extra features added beyond the original spec

