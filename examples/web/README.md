# BLBUI Web host migration example

This is the canonical runnable framework-neutral migration host. It registers
Custom Elements once at the application entry, imports the semantic theme
stylesheet, passes rows through DOM properties, and owns page listeners directly.

The host contains four internal pages: Operations, Users, Channels and Usage
Logs. Users, Channels and Usage Logs demonstrate filtering, selection,
pagination, loading, empty, error, permission-denied and retry states. The
header also demonstrates all nine theme presets with light/dark switching;
the responsive navigation remains available when the Shell sidebar is hidden.

Run `bun run build` from this directory or use `bun run dev` for a local
preview. The same setup can be copied into an existing Vite, Astro, or plain
Web Components application; see `docs/migration.md` for SSR and teardown
guidance.
The host also exercises the shared async data contract: error/retry,
permission-denied and a named permission slot. `tests/e2e/web-host.spec.ts`
is the browser contract for navigation, filters, pagination, theme switching,
state recovery and 320px page-level overflow.
