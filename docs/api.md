# BLBUI Public API

> Generated from `docs-site/src/catalog.ts`. Run `bun run api:docs` after changing a component contract.

The catalog currently describes **126 components** across Core and Business packages.

| Component | Custom Element | Category | Properties | Events |
| --- | --- | --- | --- | --- |
| Button | `aui-button` | primitives | `variant`, `size`, `loading`, `disabled` | — |
| Card | `aui-card` | layout | `header`, `footer` | — |
| Icon Button | `aui-icon-button` | primitives | `label`, `icon`, `variant`, `size`, `disabled` | `aui-press` |
| Badge | `aui-badge` | primitives | `variant`, `dot` | — |
| Status Tag | `aui-status-tag` | primitives | `status` | — |
| Avatar | `aui-avatar` | primitives | `src`, `alt`, `initials`, `size` | — |
| Progress | `aui-progress` | primitives | `value`, `max`, `label`, `show-value` | — |
| Rating | `aui-rating` | primitives | `value`, `max`, `readonly` | `aui-rating-change` |
| Keyboard Key | `aui-kbd` | primitives | — | — |
| Color Tag | `aui-color-tag` | primitives | `color`, `label` | — |
| Number Input | `aui-number-input` | forms | `value`, `min`, `max`, `step` | `aui-number-change` |
| Input | `aui-input` | forms | `value`, `type`, `name`, `placeholder`, `invalid` | `aui-input`, `aui-change` |
| Textarea | `aui-textarea` | forms | `value`, `rows`, `placeholder`, `invalid` | `aui-input` |
| Select | `aui-select` | forms | `value`, `options`, `disabled`, `invalid` | `aui-change` |
| Combobox | `aui-combobox` | forms | `options`, `value`, `placeholder`, `open` | `aui-change` |
| Multi Select | `aui-multi-select` | forms | `options`, `values`, `placeholder` | `aui-change` |
| Password Input | `aui-password-input` | forms | `value`, `placeholder`, `reveal-label` | `aui-input` |
| Checkbox | `aui-checkbox` | forms | `checked`, `disabled`, `label` | `aui-checked-change` |
| Switch | `aui-switch` | forms | `checked`, `disabled`, `label` | `aui-checked-change` |
| Radio Group | `aui-radio-group` | forms | `options`, `value`, `orientation` | `aui-radio-change` |
| Slider | `aui-slider` | forms | `value`, `min`, `max`, `step` | `aui-slider-change` |
| Tag Input | `aui-tag-input` | forms | `values`, `placeholder` | `aui-tags-change` |
| Input Group | `aui-input-group` | forms | — | — |
| Field | `aui-field` | forms | `label`, `description`, `error`, `required` | — |
| File Upload | `aui-file-upload` | forms | `accept`, `multiple`, `label`, `hint` | `aui-files-change` |
| Search | `aui-search` | forms | `value`, `placeholder`, `debounce` | `aui-search` |
| Toggle | `aui-toggle` | navigation | `pressed`, `label` | `aui-toggle-change` |
| Toggle Group | `aui-toggle-group` | navigation | `items`, `value` | `aui-toggle-group-change` |
| Segmented Control | `aui-segmented` | navigation | `items`, `value` | `aui-segment-change` |
| Tabs | `aui-tabs` | navigation | `items`, `active` | `aui-tab-change` |
| Breadcrumb | `aui-breadcrumb` | navigation | `items` | — |
| Navigation | `aui-nav` | navigation | `items` | `aui-nav-change` |
| Pagination | `aui-pagination` | navigation | `page`, `total-pages`, `total`, `page-size` | `aui-page-change` |
| Accordion | `aui-accordion` | navigation | `items`, `multiple` | — |
| Collapsible | `aui-collapsible` | navigation | `open`, `title` | `aui-open-change` |
| Stepper | `aui-stepper` | navigation | `items`, `active`, `orientation` | — |
| List | `aui-list` | navigation | `items`, `selected`, `selectable` | `aui-list-change` |
| Tree | `aui-tree` | navigation | `nodes`, `selected`, `expanded` | `aui-tree-change` |
| Timeline | `aui-timeline` | navigation | `items` | — |
| Alert | `aui-alert` | feedback | `variant`, `title`, `description`, `closable` | `aui-close` |
| Result | `aui-result` | feedback | `status`, `title`, `description` | — |
| Empty State | `aui-empty-state` | feedback | `title`, `description` | — |
| Error State | `aui-error-state` | feedback | `title`, `description` | — |
| Spinner | `aui-spinner` | feedback | — | — |
| Skeleton | `aui-skeleton` | feedback | `width`, `height` | — |
| Toast | `aui-toast` | feedback | `open`, `title`, `message`, `variant`, `duration` | `aui-close` |
| Copyable Text | `aui-copyable-text` | feedback | `text`, `copy-label` | `aui-copy` |
| Separator | `aui-separator` | feedback | `vertical` | — |
| Tooltip | `aui-tooltip` | overlay | `content`, `side` | — |
| Popover | `aui-popover` | overlay | `open`, `title` | `aui-open-change` |
| Dropdown Menu | `aui-dropdown` | overlay | `items`, `open` | `aui-menu-select` |
| Command Palette | `aui-command` | overlay | `items`, `open`, `placeholder` | `aui-command` |
| Dialog | `aui-dialog` | overlay | `open`, `title`, `description`, `close-label` | `aui-close` |
| Confirm Dialog | `aui-confirm-dialog` | overlay | `open`, `title`, `description`, `danger`, `loading` | `aui-confirm`, `aui-cancel` |
| Drawer | `aui-drawer` | overlay | `open`, `title`, `side`, `width` | `aui-close` |
| Data List | `aui-data-list` | data | `items` | — |
| Table | `aui-table` | data | `loading`, `empty`, `error`, `permission-denied`, `loading-label`, `empty-label`, `error-label`, `permission-denied-label`, `retryable`, `retry-label` | `aui-retry` |
| Data Grid | `aui-data-grid` | data | `columns`, `rows`, `loading`, `error`, `permission-denied`, `empty-label`, `error-label`, `permission-denied-label`, `retryable`, `retry-label` | `aui-retry` |
| Date Input | `aui-calendar` | data | `value`, `min`, `max`, `label` | `aui-date-change` |
| Calendar Grid | `aui-calendar-grid` | data | `month`, `year`, `selected` | `aui-date-change` |
| Date Range | `aui-date-range` | data | `presets`, `start`, `end`, `start-label`, `end-label`, `min`, `max`, `preset-label`, `clearable`, `required`, `disabled` | `aui-range-change`, `aui-range-validation`, `aui-range-preset` |
| Color Picker | `aui-color-picker` | forms | `value`, `label` | `aui-color-change` |
| Chart Container | `aui-chart-container` | data | `title`, `description`, `height`, `legend`, `tooltip` | — |
| JSON Viewer | `aui-json-viewer` | data | `value`, `title`, `expanded` | — |
| Log Viewer | `aui-log-viewer` | data | `entries`, `follow` | — |
| Kanban Board | `aui-kanban` | data | `columns` | `aui-kanban-change` |
| Container | `aui-container` | layout | `max-width`, `centered` | — |
| Stack | `aui-stack` | layout | `direction`, `gap`, `align`, `justify` | — |
| Grid | `aui-grid` | layout | `columns`, `gap`, `min-width` | — |
| Splitter | `aui-splitter` | layout | `direction`, `initial`, `min` | — |
| Admin Shell | `aui-shell` | layout | `sidebar-width`, `header-height` | — |
| Admin Page | `aui-page` | layout | `title`, `description` | — |
| Page Header | `aui-page-header` | layout | `title`, `description` | — |
| Filter Bar | `aui-filter-bar` | layout | — | — |
| Stat | `aui-stat` | layout | `label`, `value`, `unit`, `trend`, `tone` | — |
| Aspect Ratio | `aui-aspect-ratio` | layout | `ratio` | — |
| Scroll Area | `aui-scroll-area` | layout | `orientation`, `max-height` | — |
| Code Block | `aui-code-block` | data | `code`, `language` | `aui-copy` |
| Menu | `aui-menu` | navigation | `items`, `value`, `orientation`, `compact` | `aui-menu-select` |
| Sidebar | `aui-sidebar` | layout | `open`, `title`, `width`, `close-label` | `aui-open-change` |
| Navbar | `aui-navbar` | layout | `title`, `sticky`, `bordered` | — |
| Date Picker | `aui-date-picker` | forms | `value`, `min`, `max`, `label`, `disabled`, `picker` | `aui-date-change`, `aui-change`, `aui-open-change` |
| Time Picker | `aui-time-picker` | forms | `value`, `min`, `max`, `step`, `label`, `disabled`, `picker` | `aui-time-change`, `aui-change`, `aui-open-change` |
| PIN Input | `aui-pin-input` | forms | `length`, `value`, `masked`, `label`, `disabled` | `aui-pin-change` |
| Descriptions | `aui-descriptions` | data | `items`, `columns`, `bordered`, `compact` | — |
| Cascader | `aui-cascader` | forms | `options`, `value`, `placeholder`, `disabled`, `open`, `searchable` | `aui-cascader-change`, `aui-open-change` |
| Transfer | `aui-transfer` | forms | `options`, `values`, `source-title`, `target-title`, `searchable`, `disabled` | `aui-transfer-change` |
| Context Menu | `aui-context-menu` | overlay | `items`, `open`, `x`, `y`, `label` | `aui-menu-select`, `aui-open-change` |
| Hover Card | `aui-hover-card` | overlay | `open`, `title`, `side`, `delay`, `close-delay` | `aui-open-change` |
| Notification Center | `aui-notification-center` | feedback | `notifications`, `position`, `max` | `aui-notification-close`, `aui-notification-action`, `aui-notifications-change` |
| Toast Manager | `aui-toast-manager` | feedback | `items`, `position`, `max`, `persist-key`, `sync-tabs`, `channel-name` | `aui-toast-manager-change` |
| Upload List | `aui-upload-list` | forms | `files`, `removable`, `retryable`, `previewable`, `compact`, `disabled`, `empty-label` | `aui-upload-change`, `aui-upload-remove`, `aui-upload-retry`, `aui-upload-preview` |
| File Preview | `aui-file-preview` | data | `file`, `open`, `title`, `close-label`, `download-label`, `downloadable` | `aui-file-preview-close`, `aui-file-download` |
| Tree Table | `aui-tree-table` | data | `columns`, `nodes`, `expanded`, `selected`, `selectable`, `empty-label` | `aui-tree-table-toggle`, `aui-tree-table-select` |
| List View | `aui-list-view` | data | `items`, `loading`, `error`, `permission-denied`, `selectable`, `selected-keys`, `permission-denied-label`, `retryable`, `retry-label` | `aui-list-view-select`, `aui-retry` |
| Filter Builder | `aui-filter-builder` | forms | `fields`, `filters`, `max-rules`, `max-depth`, `add-label`, `add-group-label`, `clear-label`, `apply-label` | `aui-filter-builder-change`, `aui-filter-builder-submit` |
| Query Builder | `aui-query-builder` | forms | `fields`, `rules`, `logic`, `max-depth`, `apply-label` | `aui-query-change`, `aui-query-submit` |
| Form | `aui-form` | forms | `layout`, `loading`, `submit-label`, `reset-label`, `show-actions`, `no-validate` | `aui-submit`, `aui-invalid`, `aui-reset` |
| Form Item | `aui-form-item` | forms | `label`, `description`, `error`, `required`, `name` | — |
| Schema Form | `aui-schema-form` | forms | `fields`, `values`, `layout`, `loading`, `submit-label`, `reset-label` | `aui-change`, `aui-submit`, `aui-reset` |
| Progress Ring | `aui-progress-ring` | primitives | `value`, `max`, `size`, `stroke-width`, `label`, `show-value` | — |
| Truncated Text | `aui-truncated-text` | feedback | `text`, `lines`, `label` | — |
| Loading Overlay | `aui-loading-overlay` | feedback | `open`, `label`, `fullscreen` | — |
| Column Settings | `aui-column-settings` | data | `columns`, `visible-keys`, `open`, `title`, `close-label` | `aui-column-settings-change`, `aui-open-change` |
| CRUD Page | `aui-crud-page` | business | `title`, `description`, `loading` | — |
| CRUD Toolbar | `aui-crud-toolbar` | business | `selected`, `search-placeholder`, `loading` | `aui-search`, `aui-refresh` |
| Advanced Table | `aui-advanced-table` | business | `columns`, `rows`, `selectable`, `loading`, `error`, `permission-denied`, `empty-label`, `error-label`, `permission-denied-label`, `retryable`, `retry-label` | `aui-selection-change`, `aui-sort-change`, `aui-retry` |
| Form Builder | `aui-form-builder` | business | `fields`, `submit-label`, `loading` | `aui-form-change`, `aui-form-submit` |
| Approval Timeline | `aui-approval-timeline` | business | `items`, `active` | — |
| Metric Card | `aui-metric-card` | business | `label`, `value`, `unit`, `trend`, `tone` | — |
| Metric Grid | `aui-metric-grid` | business | `items`, `columns` | — |
| Bar Chart | `aui-bar-chart` | business | `data`, `height`, `label`, `show-tooltip` | `aui-chart-point` |
| Line Chart | `aui-line-chart` | business | `data`, `series`, `height`, `label`, `color`, `show-points`, `show-tooltip` | `aui-chart-point` |
| Area Chart | `aui-area-chart` | business | `data`, `series`, `height`, `label`, `color`, `show-points`, `show-tooltip` | `aui-chart-point` |
| Pie Chart | `aui-pie-chart` | business | `data`, `height`, `label`, `donut`, `show-legend`, `show-tooltip` | `aui-chart-point` |
| Gauge | `aui-gauge` | business | `value`, `min`, `max`, `height`, `label`, `unit`, `color` | — |
| Sparkline | `aui-sparkline` | business | `values`, `label`, `color` | — |
| Form Wizard | `aui-form-wizard` | business | `steps`, `active`, `completed`, `linear`, `next-label`, `previous-label`, `finish-label` | `aui-wizard-before-change`, `aui-wizard-change`, `aui-wizard-complete` |
| Permission Matrix | `aui-permission-matrix` | business | `roles`, `resources`, `permissions`, `read-only`, `empty-label` | `aui-permission-change` |
| Audit Log | `aui-audit-log` | business | `entries`, `loading`, `error`, `permission-denied`, `query`, `status`, `has-more`, `permission-denied-label`, `retryable`, `retry-label` | `aui-audit-filter-change`, `aui-audit-load-more`, `aui-retry` |
| Import Dialog | `aui-import-dialog` | business | `open`, `title`, `accept`, `max-size`, `loading`, `rows`, `error` | `aui-import-parse`, `aui-import-submit`, `aui-import-cancel` |
| Export Button | `aui-export-button` | business | `data`, `format`, `filename`, `label`, `disabled`, `loading` | `aui-export` |
| Bulk Actions Toolbar | `aui-bulk-actions-toolbar` | business | `selected`, `actions`, `loading`, `clear-label` | `aui-bulk-action`, `aui-bulk-clear` |
| Heatmap | `aui-heatmap` | business | `data`, `height`, `label`, `show-tooltip` | `aui-chart-point` |
| Funnel Chart | `aui-funnel-chart` | business | `data`, `height`, `label`, `show-tooltip` | `aui-chart-point` |
| Gantt Chart | `aui-gantt-chart` | business | `tasks`, `min`, `max`, `height`, `label` | `aui-gantt-task` |

## Cross-framework contract

- Web Components receive object/array values through DOM properties and emit composed `aui-*` CustomEvents.
- React bindings map CustomEvents to typed callback props and keep object/array inputs as properties.
- Vue Core bindings expose the same properties and `v-model` mappings; Business-only elements can be registered with `registerBusinessElements()`.
- Svelte wrappers cover the most frequently used Core controls; all other components remain directly consumable as registered Custom Elements.
- Vue/Svelte Business direct usage, object-property binding and lifecycle cleanup are documented in `docs/business-frameworks.md`.
- Every component uses semantic `--aui-*` tokens, so the nine themes and both color modes share one API contract.

## Business data adapter contract

- `fromTable(table)` accepts the small `AdminTableLike` surface and maps columns, current-page rows, sorting, one-based pagination, filtered total, and selected keys.
- `getAdapterSelection(rows, selectedKeys)` returns current-page `keys`, `all`, and `some` state without requiring TanStack Table or any other runtime.
- `virtualizeRows(rows, scrollTop, viewportHeight, rowHeight, overscan)` returns bounded rows plus `start`, `end`, `top`, and `bottom` spacer values.
- TanStack Table / Virtual remain optional integrations; no large table dependency is bundled into Core or Business.
- `normalizeChartSeries` accepts `{label, value}` or `{x, y}` points, preserving null telemetry gaps; `fromChartData` returns normalized series and stable rendering domains.
- `fromPieData` / `normalizePieData` drop non-positive slices and calculate a stable total; `normalizeGaugeValue` clamps a meter value to its host domain.
- Recharts, VChart and other chart engines remain optional integrations; chart adapters do not add a runtime dependency.
- `readEditorState`, `writeEditorState` and `connectEditorAdapter` provide a small editor bridge for CodeMirror, TipTap, Monaco and compatible runtimes without bundling an editor dependency.
- `AdminDataResource` provides a transport-neutral loading/empty/error/permission-denied state machine with abort, stale-response protection, retry and subscriptions; `createAdminFetchDataSource` adds an optional fetch mapper without adding a runtime dependency.
