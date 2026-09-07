# BLBUI 组件矩阵与路线图

## 组件分层

### Core / Framework-neutral

当前 Core 使用 Lit + Web Components，目标是让同一个组件可以被原生 Web、React、Vue、Svelte、Angular、Solid、Astro 和任意 Custom Elements 宿主消费。

- Primitives：Button、IconButton、Badge、StatusTag、Avatar、Progress、Rating、Kbd、ColorTag
- Forms：Input、Textarea、Select、Combobox、MultiSelect、Checkbox、RadioGroup、Switch、Slider、NumberInput、PasswordInput、FileUpload、TagInput、Field、InputGroup、Search、ColorPicker
- Navigation：Breadcrumb、Nav、Tabs、Pagination、Accordion、Collapsible、Stepper、Segmented、List、Tree、Timeline、Toggle、ToggleGroup
- Feedback：Alert、Result、EmptyState、ErrorState、Spinner、Skeleton、Toast、Separator、CopyableText
- Overlay：Tooltip、Popover、Dropdown、Command、Dialog、ConfirmDialog、Drawer
- Data：Table、DataGrid、DataList、Calendar、CalendarGrid、DateRange、JSONViewer、LogViewer、ChartContainer、Kanban、CodeBlock
- Layout：Shell、Page、PageHeader、FilterBar、Stat、Container、Stack、Grid、Splitter、AspectRatio、ScrollArea

### Business / Domain packages

当前已落地单一 `@chaos_team/blbui-business`（9 组件：CrudPage、CrudToolbar、AdvancedTable、FormBuilder、ApprovalTimeline、MetricCard、MetricGrid、BarChart、Sparkline），并配 `@chaos_team/blbui-business-react` 适配。参考 `chaos-ui` 中的企业系统能力，后续可独立拆分为可选包，不让 Core 绑定大型业务依赖：

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

当前已注册 92 个 Core Custom Elements。React 与 Vue 均提供 92:1 的完整同构绑定（`Admin*` 命名），Svelte 提供核心注册入口（`registerAdminElements` / `adminUi`）、core 类型再导出和 14 个常用组件封装。文档站 `docs-site/` 覆盖全部 101 个组件（含 9 个 Business）的实时预览与四框架用法。主题基础设施已包含 9 套主题和 light/dark 模式。下一步：DataGrid 增强、三框架最小示例应用、Playwright 行为矩阵。

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

这样既可以作为轻量通用组件库使用，也可以按 ERP、CRM、数据平台等系统按需安装能力。
