# react-livorno

This repo now has a clean, three-folder layout at the root:

- static-website: React app (Create React App) and all static assets
- shared: Shared UI/logic for reuse across apps
- ordering-system: Ordering system project (frontend + backend)

The original React app has been moved from the root into `static-website/` to keep the root uncluttered.

## Frontend (static-website)

- Dev: `cd static-website && npm install && npm start`
- Build: `cd static-website && npm run build` (outputs to `static-website/build`)

Note: The root `node_modules/` was relocated to `.trash/node_modules` during cleanup. You can delete `.trash` at any time.

## Shared

Place shared components and utilities in `shared/`. Import them into the app(s) as needed. If you want to consume `shared/` from `static-website/` without additional tooling, put the shared files under `static-website/src/shared/`. If you keep `shared/` at the root, you will need custom tooling (e.g., CRACO or Vite) to import outside `src/`.

## Ordering System

Contains the ordering system (backend and potentially a separate frontend). Refer to any READMEs inside that folder for setup and run instructions.

