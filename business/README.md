# @chaos_team/blbui-business

Optional framework-neutral business components for enterprise systems (25 components).

Sixteen composable building blocks:

- `aui-crud-page` — page shell with actions/filters/toolbar/pagination slots
- `aui-crud-toolbar` — selection-aware toolbar with search and refresh
- `aui-advanced-table` — sortable, selectable, loading/empty-aware table
- `aui-form-builder` — schema-driven forms with submit/change events
- `aui-approval-timeline` — step-by-step approval flow
- `aui-metric-card` / `aui-metric-grid` — KPI cards with trend tone
- `aui-bar-chart` / `aui-line-chart` / `aui-area-chart` — lightweight trend visualization
- `aui-pie-chart` / `aui-gauge` / `aui-sparkline` — breakdown, range and inline visualization
- `aui-heatmap` / `aui-funnel-chart` / `aui-gantt-chart` — matrix density, conversion stages and task timelines
- `aui-form-wizard` — linear or non-linear multi-step workflow with slotted steps
- `aui-permission-matrix` — editable role/resource permission grid
- `aui-audit-log` — filterable audit stream with loading/error/pagination contracts
- `aui-import-dialog` — CSV/JSON file validation and preview before submit
- `aui-export-button` — dependency-free CSV/JSON download with an export event
- `aui-bulk-actions-toolbar` — selected-row summary and guarded batch actions
- `aui-markdown-editor` / `aui-markdown-viewer` — safe Markdown authoring and read-only preview
- `aui-rich-text-editor` — whitelist-sanitized rich-text authoring and preview

The package also exports optional-dependency adapters. `fromTable(table)` maps a
TanStack Table-compatible instance to `AdminAdvancedTable` props, including the
current page, filtered total, sorting and cross-page selection. The adapter only
requires the small `AdminTableLike` surface, so TanStack is never bundled into
Core or Business. `getAdapterSelection(rows, selectedKeys)` provides the shared
current-page `all` / `some` selection contract for any framework.

`virtualizeRows(rows, scrollTop, viewportHeight, rowHeight, overscan)` provides
a bounded virtual-window contract (`start`, `end`, `top`, `bottom`) without
forcing a virtualizer runtime. See `tests/adapters.test.ts` for the contract
examples and edge cases.

Chart integrations use the same dependency-free boundary: `normalizeChartSeries`
accepts common `{label, value}` and `{x, y}` data shapes, preserves null telemetry
gaps, and `fromChartData` returns normalized series plus stable X/Y domains. This
keeps Recharts, VChart and future SVG renderers optional.

Editor integrations use `AdminEditorAdapter` with `readEditorState`,
`writeEditorState` and `connectEditorAdapter`. The contract covers text,
half-open selections, controlled updates and optional subscriptions while
leaving CodeMirror, TipTap or Monaco as host-owned dependencies.
See [`docs/editor-adapters.md`](../docs/editor-adapters.md) for concrete
runtime mappings and cleanup patterns for all supported host lifecycles.

`AdminDataResource` provides the shared loading/empty/error/permission-denied
state machine, retry/backoff, request-identity cache and stale-while-revalidate
behavior. Cache metrics use `subscribeCache()` and `getCacheStats()`; production
request telemetry is opt-in through `subscribeTelemetry()`,
`getTelemetryStats()` and `telemetry.onEvent`. Telemetry is privacy-safe by
default and omits request/query data unless the host explicitly sets
`telemetry.includeRequest: true` after its own sensitivity review.

They depend on `@chaos_team/blbui-core` and register on top of it.

```ts
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
registerBusinessElements();
```
