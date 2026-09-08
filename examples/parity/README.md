# Cross-framework parity fixture

The three Vite playgrounds consume the same `fixture.json` data and exercise
the same interaction contract: controlled input, tabs, table rows, pagination,
dialog state, and the application toast queue. The framework-specific syntax
is intentionally different, but the state transitions and displayed values
are the same.

`contractVersion` is bumped when a state or event mapping changes. The
`parityContract` object is the source of truth for controlled state names and
initial assertions; `bun run examples:check` validates that each playground
consumes the same contract markers.

This fixture is checked by `bun run examples:check` and built by the React,
Vue, and Svelte playgrounds.
