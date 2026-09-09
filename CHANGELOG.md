# Changelog

## 0.0.27 — 2026-09-09

- 将 `examples/web` 完善为可运行的迁移宿主：新增 Operations、Users、Channels、Usage Logs 四个内部页面，覆盖筛选、状态、选择、分页、日志和主题切换。
- 为 Users、Channels、Usage Logs 增加 loading、empty、error、permission-denied、retry、选中行和分页状态，并以 Web Components E2E 固化交互契约。
- 新增 320px 移动导航，修复 Shell 隐藏 sidebar 后迁移宿主无法切页的问题；补充 Glass light/dark、状态和窄屏人工视觉检查。
- 六个可发布包及示例依赖统一升级到 `0.0.27`。

## 0.0.26 — 2026-09-09

- `AdminDataResource` 现在隔离普通 snapshot subscriber 异常：一个框架视图崩溃不会阻断其他订阅者、状态存储或后续请求。
- `dispose()` 取消活动请求时发出明确的 `load-abort` telemetry `reason: "dispose"`，与显式 `abort` 和被新请求替换的语义区分开。
- 补充数据源回归测试、API/数据源文档，并修正视觉验收记录中与实际 320×720 检查一致的窄屏视口说明。
- 六个可发布包及示例依赖统一升级到 `0.0.26`。

## 0.0.25 — 2026-09-09

- `AdminDataResource` 新增隐私安全的请求生命周期 telemetry：开始、重试、成功、错误和取消事件，包含耗时、attempt、来源、状态、行数和脱敏错误字段；默认不携带 query/cache key。
- 新增 `subscribeTelemetry()`、`getTelemetryStats()`、`resetTelemetryStats()` 和 `telemetry.onEvent`，并验证观测回调异常不会改变请求状态。
- React、Vue、Svelte、Web Components parity playground 展示最近 telemetry event 与 loads/retries/successes/errors/aborts 统计，补充跨框架 E2E contract。
- TagInput 支持空输入 Backspace 删除最后一个标签，删除后保留输入焦点并补行为回归。
- 六个可发布包统一升级到 `0.0.25`，同步 peer dependency、API/路线图/长期计划、示例与发布门禁。

## Unreleased

## 0.0.24 — 2026-09-09

- 新增 `MarkdownEditor`、`MarkdownViewer` 和 `RichTextEditor`，支持受控编辑、预览、表单关联、只读/空态/错误状态和跨框架文档示例。
- Markdown 与 Rich Text 预览采用受限序列化和白名单清洗，移除脚本、事件属性及不安全协议，并补充行为与真实浏览器安全回归。
- Popover/Dropdown 补齐键盘打开、Escape/outside 关闭、菜单导航、ARIA 关联和嵌套 Custom Element 内部真实焦点恢复。
- 文档目录扩展为 104 个 Core + 25 个 Business，共 129 个组件；完成 9 套主题 light/dark、编辑器与 320px 窄屏人工视觉复核。
- 六个可发布包统一升级到 `0.0.24`，并同步 peer dependency、示例、docs-site、发布门禁和 npm tag。

## 0.0.22 — 2026-09-09

- `AdminDataResource` 新增缓存命中/过期命中/绕过/写入/失效事件、可读缓存统计和可选 telemetry hook；观测回调异常不会破坏请求状态。
- Business Custom Elements 新增真实 DOM 事件契约回归，覆盖 PermissionMatrix、AuditLog、ImportDialog、ExportButton 和 BulkActionsToolbar 的跨宿主事件细节。
- Vue/Svelte 直连 Business playground 新增 320px 窄屏 E2E，校验页面不溢出并保留组件内部表格滚动；npm 发布可见性校验新增 registry 传播超时摘要回归。
- ImportDialog 在缺少原生 `HTMLDialogElement.close()` 的宿主环境中补充安全降级，保持关闭事件和状态同步。
- 固定 runner 的 Windows/Ubuntu visual golden 已按完整 432 文件 manifest 提升，后续基准更新由 `bun run visual:promote` 审计。
- 修复 Windows 本地 release preflight 调用 npm CLI 的兼容性，`BLBUI_CHECK_NPM=1` 现在可正确识别版本未占用状态。

## 0.0.23 — 2026-09-09

- 共享 parity fixture 开启真实 `AdminDataResource` 缓存与 stale-while-revalidate，四个 playground 统一展示最近缓存事件和完整缓存统计。
- 新增缓存观测刷新/清空操作，并以单元测试和真实浏览器 E2E 固化 `miss/write → hit → bypass/write → invalidate` 事件顺序。
- 将缓存观测面板优化为 token 驱动的可换行指标网格，补充桌面、320px 窄屏、dark/light 和四框架人工视觉复核记录。
- 同步数据源、Business framework、parity fixture 文档与版本化 release gate；真实外部 `web/` 宿主逐页迁移仍等待宿主源码进入工作区。

## 0.0.21 — 2026-09-09

- `AdminDataResource` 新增可配置有限重试与指数退避，退避等待响应 `AbortSignal`，避免瞬态网络故障造成无限请求。
- 新增按 query/page/pageSize/cursor/sort/filters 请求身份缓存、stale-while-revalidate、`clearCache()`，并让 `retry()` 始终绕过缓存重新验证。
- 补充数据源 8 项行为测试、四框架数据能力文档和 API 文档，保持 React/Vue/Svelte/Web Components 共用同一资源语义。

## 0.0.20 — 2026-09-09

- 将四套 playground 的异步演示统一接入真实 `AdminDataResource` 生命周期，覆盖 ready/loading、503 可重试错误、403 permission-denied、retry、订阅清理和 `dispose()`。
- 新增 Business React 的 Heatmap、FunnelChart、GanttChart DOM property、事件 detail、回调更新和卸载清理回归测试。
- 发布门禁新增全 workspace `format:check`，并修正 Vitest Business 源码 alias，避免测试误用陈旧 dist；全量测试达到 101 项通过。
- 完成 React/Vue/Svelte/Web Components playground 的真实浏览器 parity 与 320px 窄屏检查，docs-site 主题、图表、异步状态、a11y 和视觉稳定性检查通过。
- 发布版本统一为 `0.0.20`；真实外部 `web/` 宿主逐页迁移仍保留为下一阶段 blocker。

## 0.0.19 — 2026-09-09

- 新增 Business `Heatmap`、`FunnelChart`、`GanttChart`，保持 framework-neutral、语义 token 驱动和无大型图表运行时依赖。
- 为三类图表补齐 React 绑定、Vue/Svelte/Web Components 示例、docs-site 预览、键盘焦点/点位或任务事件与空态渲染。
- 新增图表主题切换与 320px 窄屏 E2E，验证页面无级联横向溢出，Heatmap/Gantt 仅在组件内部保留滚动。
- 文档目录扩展至 126 个组件，Business 直连指南与跨框架示例更新至 22 个组件；发布版本统一为 0.0.19。

## 0.0.18 — 2026-09-09

- 新增 Business `AdminDataResource` 与 `createAdminFetchDataSource`：统一分页请求、Abort、stale response 防护、empty/error/permission-denied、retry 和 HTTP 状态归一化，不引入传输层依赖。
- 四套 playground parity fixture 升级到 v3，真实验证异步错误重试、权限拒绝插槽与恢复；修复 Svelte wrapper 在无自定义 slot 时错误渲染默认 slot 的问题。
- 发布 workflow 增加 npm metadata 发布后可见性轮询，避免 registry 传播延迟导致部分包未发布仍被误报成功。
- 刷新 Windows/Ubuntu fixed-runner 窄屏图表、Workflow 与 PermissionMatrix 基准，覆盖 Lit 子组件完成渲染后的稳定截图边界；继续保持严格 pixelmatch，不放宽全局视觉阈值。
- 记录 Obsidian 深色窄屏场景在 fixed runner 上的实际高度与 SVG 绘制基线，golden 按 profile 分离维护。
- 视觉矩阵继续作为 2 个平台 × 432 张 PNG 的发布前证据，新增基准须经过人工复核后再提交。
- docs-site 新增 Table、DataGrid、AdvancedTable、AuditLog 的异步状态实验台，并覆盖错误重试与权限恢复交互。
- 修复 Table permission-denied 状态未显示的问题；补充文档站异步状态 E2E 回归与人工视觉检查。

## 0.0.17 — 2026-09-09

- 统一 Core Table/DataGrid/ListView 与 Business AdvancedTable/AuditLog 的 permission denied、retry 事件和 retry/permission 插槽契约，并同步 React、Vue、Svelte 消费方式。
- 新增 Business AdvancedTable 的 React、Vue、Svelte、Web Components 跨框架 parity fixture 与真实浏览器选择事件门禁。
- 新增 release preflight：版本一致性、CHANGELOG、tag 命名和正式发布时的 npm 版本占用检查；发布 workflow 支持 token 与 npm Trusted Publishing/OIDC 路径。
- 完成文档路线图状态修正、异步状态迁移文档和本轮主题/窄屏人工视觉抽查。

## 0.0.16 — 2026-09-08

- 固定移动端 SchemaForm 的输入和 Select 控件尺寸、字段间距与文本行高，降低跨浏览器布局漂移。
- 完成人工复核并更新 Windows/Ubuntu fixed-runner 对应的 mobile SchemaForm visual golden；其余视觉基线保持不变。
- 同步六个可发布包、peer dependency、文档站和示例版本，延续治理、主题、跨框架 parity 与全量 release gate。

## 0.0.15 — 2026-09-08

- 新增治理审计脚本与季度 workflow，持续校验注册表/catalog、主题 token、utility 作用域、版本和文档状态。
- 新增 React、Vue、Svelte、Web Components 四套 playground 的真实浏览器 parity 门禁，覆盖筛选、Tab、分页、Dialog、DOM property 和事件链路。
- 修复 React/Vue/Svelte playground 的受控筛选与表格过滤；修复 Vue ToastManager payload 映射，以及 Svelte 自定义元素的布尔属性、按钮事件、Dialog 和分页同步。
- 发布门禁纳入 governance audit，并更新跨框架迁移、长期计划与视觉验收记录。

## 0.0.14 — 2026-09-08

- 新增可选的完全主题化 DatePicker / TimePicker 面板：`picker="custom"` 支持日期边界、时间步进、Escape/外部点击关闭，并保留原生默认模式和既有事件契约。
- 新增可运行的 `examples/web` 外部宿主迁移示例，覆盖注册、主题、Page、FilterBar、DataGrid、DOM property 和事件监听。
- 新增 10,000 行 DataGrid 虚拟窗口性能门禁，覆盖渲染、滚动、主题切换和 FPS 预算；虚拟模式不再额外渲染移动卡片列表。
- 更新迁移文档、公开 API、视觉验收记录与长期路线图。

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
