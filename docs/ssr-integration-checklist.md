# SSR Integration Checklist (Vue + Hono)

Use this checklist when changing scaffold templates, dev server wiring, or runtime render behavior.

## Routing Boundaries

- Hono owns API routes under `/api/*`.
- Vue Router owns client page routes only.
- Dev server proxy/entry must route API traffic to Hono app entry.

## App Creation Rules

- Create fresh app instances per request on the server.
- Avoid shared mutable singletons across requests.
- Keep platform-specific APIs (`window`, `document`) out of universal server/client code.

## Hydration Rules

- Use hydration only when server rendered app HTML is actually injected.
- If server sends only shell markup, use normal client mount mode.
- Ensure server/client output structure matches to avoid hydration mismatch warnings.

## API-Only Rules

- API-only projects must not depend on Vite-only features like `import.meta.glob`.
- API-only scaffold must not include Vue/Vite dependencies.
- API-only scaffold should include baseline Hono routes (e.g. health).

## Docs Endpoints

- Ensure docs endpoints are exposed under API namespace:
  - `/api/openapi.json`
  - `/api/docs`
  - `/api/reference`
  - `/api/fp`
- Keep legacy aliases only for backward compatibility.

## Port Behavior

- Respect `PORT` from environment when available.
- If requested port is unavailable, auto-select the next available port.
- Log the fallback so developers can find the actual port quickly.

## Release Gate

Before publishing scaffold/runtime packages:

- Generate one fullstack project and verify page + API routes both work.
- Generate one API-only project and verify no Vite-only runtime usage.
- Verify docs endpoints return expected responses.
- Verify port fallback by occupying default port before startup.
