# Cross-framework parity fixture

The three Vite playgrounds consume the same `fixture.json` data and exercise
the same interaction contract: controlled input, tabs, table rows, pagination,
dialog state, the application toast queue, and the shared async data state
contract (error/retry and permission-denied slot). The framework-specific syntax
is intentionally different, but the state transitions and displayed values
are the same.

`contractVersion` is bumped when a state or event mapping changes. The
`parityContract` object is the source of truth for controlled state names and
initial assertions; `asyncStates.cacheStats` and `asyncStates.cacheEvents` define
the cache contract. `bun run examples:check` validates that each playground
consumes the same contract markers.

This fixture is checked by `bun run examples:check` and built by the React,
Vue, and Svelte playgrounds.

The cache panel is intentionally part of the fixture contract: it reads
`subscribeCache()` and `getCacheStats()` from the shared resource, so changes to
cache semantics must update the fixture version, unit test, browser assertions,
and the data-source documentation together.
