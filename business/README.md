# @chaos_team/blbui-business

Optional framework-neutral business components for enterprise systems.

Nine composable building blocks:

- `aui-crud-page` — page shell with actions/filters/toolbar/pagination slots
- `aui-crud-toolbar` — selection-aware toolbar with search and refresh
- `aui-advanced-table` — sortable, selectable, loading/empty-aware table
- `aui-form-builder` — schema-driven forms with submit/change events
- `aui-approval-timeline` — step-by-step approval flow
- `aui-metric-card` / `aui-metric-grid` — KPI cards with trend tone
- `aui-bar-chart` / `aui-sparkline` — lightweight data visualization

They depend on `@chaos_team/blbui-core` and register on top of it.

```ts
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
registerBusinessElements();
```
