# BLBUI 组件矩阵与路线图

## 组件分层

### Core / Framework-neutral

当前 Core 使用 Lit + Web Components，目标是让同一个组件可以被原生 Web、React、Vue、Svelte、Angular、Solid、Astro 和任意 Custom Elements 宿主消费。

- Primitives：Button、IconButton、Badge、StatusTag、Avatar、Progress、ProgressRing、Rating、Kbd、ColorTag
- Forms：Input、Textarea、Select、Combobox、MultiSelect、Checkbox、RadioGroup、Switch、Slider、NumberInput、PasswordInput、FileUpload、TagInput、Field、InputGroup、Search、ColorPicker、DatePicker、TimePicker、PinInput、Cascader、Transfer、UploadList、Form、FormItem、SchemaForm
- Navigation：Breadcrumb、Nav、Tabs、Pagination、Accordion、Collapsible、Stepper、Segmented、List、Tree、Timeline、Toggle、ToggleGroup
- Feedback：Alert、Result、EmptyState、ErrorState、Spinner、Skeleton、Toast、NotificationCenter、Separator、CopyableText、TruncatedText、LoadingOverlay
- Overlay：Tooltip、Popover、Dropdown、Command、Dialog、ConfirmDialog、Drawer
- Data：Table、DataGrid、DataList、Calendar、CalendarGrid、DateRange、JSONViewer、LogViewer、ChartContainer、Kanban、CodeBlock、Descriptions、FilePreview、ColumnSettings、TreeTable、ListView
- Layout：Shell、Page、PageHeader、FilterBar、Stat、Container、Stack、Grid、Splitter、AspectRatio、ScrollArea、Sidebar、Navbar

### Business / Domain packages

当前已落地单一 `@chaos_team/blbui-business`（25 组件：CrudPage、CrudToolbar、AdvancedTable、FormBuilder、ApprovalTimeline、MetricCard、MetricGrid、BarChart、LineChart、AreaChart、PieChart、Gauge、Sparkline、Heatmap、FunnelChart、GanttChart、FormWizard、PermissionMatrix、AuditLog、ImportDialog、ExportButton、BulkActionsToolbar、MarkdownEditor、MarkdownViewer、RichTextEditor），并配 `@chaos_team/blbui-business-react` 适配。参考 `chaos-ui` 中的企业系统能力，后续可独立拆分为可选包，不让 Core 绑定大型业务依赖：

- `@chaos_team/blbui-business-crud`
    - CrudPage
    - CrudToolbar
    - AdvancedDataTable
    - BrowseDialog
    - ImportDialog
    - ExportButton
    - BulkActionsToolbar
- `@chaos_team/blbui-business-charts`
    - LineChart
    - BarChart
    - AreaChart
    - PieChart
    - Gauge
    - Heatmap
    - FunnelChart
    - GanttChart
- `@chaos_team/blbui-business-workflow`
    - FormWizard
    - FormBuilder
    - ApprovalFlow
    - ApprovalTimeline
    - KanbanBoard
    - FlowTracker
- `@chaos_team/blbui-business-content`
    - MarkdownEditor
    - MarkdownViewer
    - CodeEditor
    - JsonEditor
    - DiffViewer
    - ImageGallery
    - FileManager
- `@chaos_team/blbui-business-communication`
    - ChatShell
    - ChatConversation
    - MessageCenter
    - NotificationCenter
    - ActivityFeed
- `@chaos_team/blbui-business-enterprise`
    - OrgChart
    - PermissionMatrix
    - AuditLog
    - OperationLog
    - Timeline
    - EmployeePicker
    - DepartmentPicker

## 当前状态

当前已注册 104 个 Core Custom Elements。React 与 Vue 均提供 104:1 的完整 Core 同构绑定（`Admin*` 命名），Svelte 提供核心注册入口（`registerAdminElements` / `adminUi`）、29 个常用组件封装，共 31 个公开导出，已覆盖 PageHeader/Shell 布局挂载。Business 已有 25 个组件和 React 绑定，Vue/Svelte 可通过直接注册 Custom Elements 消费，并新增覆盖全部 25 个元素的直接用法指南与 catalog 门禁。文档站 `docs-site/` 覆盖全部 129 个组件（含 25 个 Business）的实时预览与四框架用法。主题基础设施已包含 9 套主题和 light/dark 模式；DataGrid、组合式表单、移动端 Drawer、Breadcrumb 溢出、通知持久化、TreeTable/ListView/FilterBuilder/QueryBuilder、Business workflow/权限/审计/导入导出、TanStack-compatible adapter contract、chart adapter contract、Area/Pie/Gauge/Heatmap/Funnel/Gantt 图表、DateRange 快捷范围、Line/AreaChart 多系列、键盘 tooltip/点位事件、异步状态统一契约、Business AdvancedTable 四框架 parity、编辑器安全渲染、外部宿主迁移指南和 Playwright/a11y/pixelmatch/visual-matrix/golden 矩阵已落地。0.0.20 已加入四套 playground 共享真实 `AdminDataResource` 生命周期、Business React 图表行为测试、pagehide dispose 清理和完整 format release gate；0.0.21 增加有限重试/指数退避、可取消等待、请求缓存和 stale-while-revalidate；0.0.22 增加缓存观测统计、完整 visual golden manifest 提升、Business 事件契约和 Vue/Svelte 窄屏回归；0.0.23 将缓存观测接入四框架 parity playground，锁定缓存事件顺序和清空缓存行为；0.0.24 完成编辑器安全渲染、Popover/Dropdown 键盘与焦点语义、129 组件目录和人工视觉复核；0.0.25 增加隐私安全的请求 telemetry、四框架观测面板和 TagInput Backspace 交互。下一步聚焦真实外部业务宿主逐页迁移、旧兼容层清理、更多复杂交互和长期视觉证据维护。

## 依赖边界

以下能力不直接进入 Core：

- TanStack Table / Virtual
- CodeMirror
- Recharts / VChart
- TipTap
- React Hook Form
- DnD Kit
- PDF / Media / QR 专用运行时
- 业务 API、权限模型、i18n 状态管理

它们应在 Business 包中作为 peer dependency 或可选依赖处理。

## 发布策略

```text
@chaos_team/blbui-core
@chaos_team/blbui-react
@chaos_team/blbui-vue
@chaos_team/blbui-svelte
@chaos_team/blbui-business-crud
@chaos_team/blbui-business-charts
...
```

这样既可以作为轻量通用组件库使用，也可以按 ERP、CRM、数据平台等系统按需安装能力。当前发布门禁还会由 `governance:check` 审计注册表、catalog、主题 token、utility 作用域、版本和文档状态；后续复杂业务能力仍以可选 Business adapter 方式扩展。
