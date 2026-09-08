# Cross-framework parity fixture

The three Vite playgrounds consume the same `fixture.json` data and exercise
the same interaction contract: controlled input, tabs, table rows, pagination,
dialog state, and the application toast queue. The framework-specific syntax
is intentionally different, but the state transitions and displayed values
are the same.

This fixture is checked by `bun run examples:check` and built by the React,
Vue, and Svelte playgrounds.
