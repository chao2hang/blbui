# BLBUI Web host migration example

This is a runnable framework-neutral host fixture. It registers Custom Elements
once at the application entry, imports the semantic theme stylesheet, passes
rows through DOM properties, and cleans no framework listeners because the
page owns the listeners directly.

Run `bun run build` from this directory or use `bun run dev` for a local
preview. The same setup can be copied into an existing Vite, Astro, or plain
Web Components application; see `docs/migration.md` for SSR and teardown
guidance.
The host also exercises the shared async data contract: error/retry,
permission-denied and a named permission slot.
