# Changelog

## Unreleased

后续变更记录从这里开始。

## 0.0.13 — 2026-09-08

- 新增 CodeMirror 6、TipTap、Monaco 的 `AdminEditorAdapter` 接入示例，并补充 Web Components、React、Vue、Svelte 的订阅清理生命周期说明。
- 将 docs playground 的 DOMContentLoaded、渲染节点数和目录卡片数量纳入 Playwright 性能预算门禁。
- 在同一 `0.0.13` commit 上完成两次 Windows/Ubuntu 固定 runner 视觉证据复核，启用 864 张 profile-specific PNG golden 的同 profile pixelmatch 门禁。

## 0.0.12 — 2026-09-08

- 为 DateRange 增加快捷范围、清空操作、动态日期边界、严格格式校验和完整 validation/preset 事件；同步 React/Vue 绑定、目录与文档契约。
- 完成嵌套浮层 Escape 焦点栈、shadow DOM/slot 感知的 Drawer focus trap，并覆盖 Dialog、Popover、Dropdown、Drawer、FilePreview、Command 等浮层的顶层关闭行为。
- LineChart 支持多系列共享坐标域、图例、系列颜色和带 seriesId/seriesLabel 的键盘与指针点位事件，同时保持单系列 API 兼容。
- Business 新增无运行时依赖的 `AdminEditorAdapter` contract，统一文本、半开区间选区、受控更新和订阅桥接，便于接入 CodeMirror/TipTap/Monaco。
- AreaChart 复用 LineChart 多系列 contract，增加共享坐标域、系列图例、系列点位事件和颜色隔离；补充外部宿主迁移示例与 profile-aware fixed-runner visual golden contract。

## 0.0.11 — 2026-09-08

- 为 Bar/Line/Area/Pie 图表增加主题化 hover 与键盘 tooltip，新增 `aui-chart-point` 事件和 React `onPoint` 回调；关闭 tooltip 时仍保持静态可访问语义与 null telemetry gap。
- 收口 Popover/Dropdown 的 Escape、outside-dismiss 和触发器焦点恢复，补充焦点行为回归测试。
- 同步 123 个组件的目录/API 文档、三框架示例版本和长期计划；保留 Enterprise/FormBuilder 的 select 自定义箭头视觉修复。

## 0.0.10 — 2026-09-08

- 新增 Business `AreaChart`、`PieChart`、`Gauge`，并补齐 React 绑定、主题 token、API/目录文档与 adapter contract。
- AreaChart 支持 null telemetry gap，PieChart 支持 donut/legend，Gauge 提供可访问 meter 语义与范围钳制。
- 完成新增图表在 Obsidian、Rounded、Glass、light/dark 与 320px 窄屏下的人工视觉验收，并将场景纳入跨平台视觉矩阵。

## 0.0.9 — 2026-09-08

- 新增 Business `LineChart` 与无依赖 chart adapter contract，统一 `{label, value}` / `{x, y}` 数据、稳定 domain 计算和 null telemetry gap 语义。
- 补齐 `AdminLineChart` React 绑定、目录/API/示例/测试，并修复 SVG 图表在浏览器中错误使用 HTML 命名空间导致的空白渲染。
- 完成 Obsidian、Rounded、Glass 主题及 320px 窄屏的人工视觉验收；继续保留 9 × 2 跨平台视觉矩阵和长期图表/宿主迁移计划。

## 0.0.8 — 2026-09-08

- 完善 Business 数据 adapter contract：支持当前页/总数、排序、分页、跨页选择映射，并新增纯函数 selection 与虚拟窗口边界测试；TanStack Table / Virtual 仍为可选依赖。
- 将 React/Vue/Svelte parity playground 升级为 versioned controlled-state fixture，统一 tab、input、pagination、dialog、toast 状态并由 examples 门禁校验实际事件映射。
- 新增跨平台 visual matrix manifest，固定 Windows/Ubuntu Chromium、desktop/390px/320px 视口、9 套主题 × light/dark 与代表性业务场景；发布门禁读取并校验该矩阵。
- 同步公共 API 文档、Business React adapter re-export、长期路线图和视觉验收记录。

## 0.0.7 — 2026-09-08

- 扩展 Business 套件至 15 个组件，新增 FormWizard、PermissionMatrix、AuditLog、ImportDialog、ExportButton 和 BulkActionsToolbar，并补齐 React 绑定、目录预览与跨框架使用示例。
- 增强 ToastManager 的持久化、最大数量、跨标签页同步和 Vue `v-model:items` 接入；FilterBuilder/QueryBuilder 支持嵌套 ALL/ANY 分组、深度限制和异步选项状态。
- 增加业务数据适配器、可选虚拟行窗口、公共 API 检查与 API 文档生成；发布门禁覆盖 119 组件目录、SSR、三框架 playground、主题/token、320px/forced-colors/reduced-motion 和像素稳定性。
- 完成 9 套主题 × light/dark 代表状态的人工视觉复核，修正 QueryBuilder 重复入口和 API 文档生成器对多行属性数组的解析。

## 0.0.6 — 2026-09-08

- 新增 TreeTable、ListView、FilterBuilder、QueryBuilder，并同步 React/Vue/Svelte 绑定、目录预览和跨框架事件契约。
- 增强 DateRange 边界校验、ChartContainer legend/tooltip 主题 token，新增 HTTP 状态语义 helper。
- 增加 React/Vue/Svelte 最小 Vite playground、Testing Library 挂载测试和 SSR/hydration 注册等待 API。
- 发布门禁加入三框架 playground 构建、SSR 检查、跨平台 Chromium 配置及 pixelmatch 重复渲染稳定性检查；目录扩展至 112 个组件。

## 0.0.5 — 2026-09-08

- 新增 Form、FormItem、SchemaForm、ProgressRing、TruncatedText、LoadingOverlay、ColumnSettings，并补齐 React/Vue/Svelte 适配与文档示例。
- DataGrid 增强排序、筛选、行选择、批量操作、服务端分页、移动端卡片模式和轻量虚拟窗口能力。
- 增强 Drawer 移动端全宽模式、Breadcrumb 溢出菜单、NotificationCenter 历史持久化与跨框架事件绑定一致性。
- 建立 9 套主题 × light/dark 的自动化覆盖、token 检查、Playwright/a11y/视觉冒烟矩阵；文档目录扩展至 108 个组件。
- 发布前通过 catalog、主题与 token 检查、类型检查、构建、Svelte 检查、文档 smoke、Vitest（49/49）和 E2E（4/4）。

## 0.0.4 — 2026-09-08

- 新增 UploadList、FilePreview、Cascader、Transfer、NotificationCenter、ContextMenu、HoverCard 等常用组件。
- 新增 9 套主题及 Light/Dark 模式，补充语义化 tokens、CSS utilities 和运行时主题切换 API。
- 完善 React、Vue、Svelte 绑定、文档站组件目录和长期演进计划。
- 完成窄屏溢出修复、UploadList 预览弹层接入及真实浏览器视觉验收。
- 发布前通过类型检查、构建、Svelte 检查、文档构建和 Vitest 测试（43/43）。
