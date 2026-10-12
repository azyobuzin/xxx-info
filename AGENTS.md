# Guideline for AI Agents

## Repository layout

pnpm + turbo monorepo. Tool versions are managed by `mise.toml`.

- `apps/api` — Hono on Node 24 (Cloud Run). Serves `/api/*`.
- `apps/website` — SvelteKit 2 / Svelte 5 (runes mode), `adapter-static`. Consumes the API via `@xxx-info/api/client`.

## Development workflow

After changing code, all of the following must pass (run from repo root):

```
pnpm check-types && pnpm test && pnpm fix
```

Running a single test: `pnpm --filter @xxx-info/api exec node --test src/path/to.test.ts`

## Architecture notes

### API — `apps/api`

- `createApiRoute` in `routes.ts` returns a chained Hono builder. Its return type feeds `hc<RouteType>` in `client.ts` — breaking the chain breaks the website's typed client.
- The middleware in `observability.ts` calls `traceExporter.forceFlush()` after every request. This is required because Cloud Run freezes the container between invocations — do not remove it.
- Imports use explicit `.ts` extensions (Node 24 native TS loader), not `.js`.

### Website — `apps/website`

- All pages are statically generated (`prerender = true`). API calls happen at runtime in the browser against `/api/*`.
- Svelte 5 runes mode is enforced. `.svx` files are supported via mdsvex.
