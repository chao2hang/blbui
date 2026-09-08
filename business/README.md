# @chaos_team/blbui-business

Optional framework-neutral business components for enterprise systems (15 components).

Fifteen composable building blocks:

- `aui-crud-page` — page shell with actions/filters/toolbar/pagination slots
- `aui-crud-toolbar` — selection-aware toolbar with search and refresh
- `aui-advanced-table` — sortable, selectable, loading/empty-aware table
- `aui-form-builder` — schema-driven forms with submit/change events
- `aui-approval-timeline` — step-by-step approval flow
- `aui-metric-card` / `aui-metric-grid` — KPI cards with trend tone
- `aui-bar-chart` / `aui-sparkline` — lightweight data visualization
- `aui-form-wizard` — linear or non-linear multi-step workflow with slotted steps
- `aui-permission-matrix` — editable role/resource permission grid
- `aui-audit-log` — filterable audit stream with loading/error/pagination contracts
- `aui-import-dialog` — CSV/JSON file validation and preview before submit
- `aui-export-button` — dependency-free CSV/JSON download with an export event
- `aui-bulk-actions-toolbar` — selected-row summary and guarded batch actions

The package also exports optional-dependency adapters: `fromTable(table)` maps a
TanStack Table-compatible instance to `AdminAdvancedTable` props, while
`virtualizeRows(rows, scrollTop, viewportHeight, rowHeight, overscan)` provides
the same bounded virtual-window contract without forcing a table runtime.

They depend on `@chaos_team/blbui-core` and register on top of it.

```ts
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
registerBusinessElements();
```
