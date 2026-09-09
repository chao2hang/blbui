# BLBUI 长期完善计划

这份计划把“组件补齐、主题覆盖、跨框架一致性、人工视觉验收”变成可持续的发布流程。每个阶段都应保留可运行的主分支，新增能力必须同时进入 Core、目录、示例、绑定层和验收矩阵。

## 目标状态

- Core 提供框架无关、可访问、可主题化的常用系统组件。
- React、Vue、Svelte 的公开 API 与事件语义保持可预测的一致。
- 所有组件只依赖语义化 AUI token；主题切换不需要修改组件业务代码。
- 每个组件都有 light/dark、交互状态、窄屏和 reduced-motion 的可复核证据。
- 文档站是组件目录、实时 playground、主题实验室和视觉回归入口。

## 阶段计划

### 0.0.20 质量收口

- [x] 四套 playground 共用真实 `AdminDataResource` fixture，验证 ready/loading、503 retryable、403 permission-denied、恢复和生命周期清理。
- [x] 为 Business React Heatmap/Funnel/Gantt 增加 DOM property、事件 detail、回调更新和卸载清理测试。
- [x] 将 `format:check` 接入 `release:check`，并用源码 alias 防止测试依赖陈旧 Business dist。
- [x] 通过 16 条浏览器 E2E（1 条按既有条件跳过）、全量 101 条测试和五个入口的人工视觉检查；记录见 `docs/visual-audit.md`。
- [x] 为 `AdminDataResource` 增加可配置有限重试/指数退避、AbortSignal 可取消等待、按请求身份缓存、stale-while-revalidate 与显式缓存失效，并补四框架文档契约。
- [ ] 真实外部 `web/` 宿主逐页迁移仍需宿主源码进入工作区；在此之前只维护可运行的迁移 fixture，不宣称 Users、Channels、Usage Logs 已迁移。

### 0.0.21 数据能力收口

0.0.21 已在 0.0.20 基础上完成数据资源能力收口：

- [x] `AdminDataResource` 支持可配置有限重试、指数退避，以及由 `AbortSignal` 取消等待中的退避。
- [x] `AdminDataResource` 支持按请求身份缓存、stale-while-revalidate、显式 `clearCache()`，并由 `retry()` 强制绕过缓存。
- [x] 数据缓存提供 `subscribeCache()`、`getCacheStats()`、`resetCacheStats()` 和可选 `cache.onEvent` 观测钩子；观测失败不会改变请求状态。
- [x] 补充数据源行为测试、四框架资源契约文档、CHANGELOG、API 文档和发布门禁记录。
- [ ] 真实外部 `web/` 宿主逐页迁移仍需宿主源码进入工作区；在此之前只维护可运行的迁移 fixture，不宣称 Users、Channels、Usage Logs 已迁移。

### 0.0.22 发布收口

0.0.22 已在 0.0.21 基础上完成缓存可观测性、跨宿主事件回归和视觉基线治理：

- [x] `AdminDataResource` 暴露缓存命中、stale-hit、绕过、写入、失效事件，以及可重置的缓存统计；telemetry 回调失败不会影响请求状态。
- [x] 固定 runner 的 Windows/Ubuntu visual golden 按完整 432 文件 manifest 提升，并提供 `bun run visual:promote` 审计入口；同 profile 继续使用严格 pixelmatch。
- [x] 补齐 Business Custom Elements 事件契约、Vue/Svelte 320px 窄屏无页面溢出和 ImportDialog 原生 dialog 缺失时的降级回归。
- [x] 完成版本、CHANGELOG、peer dependency、文档站、发布门禁和人工视觉复核同步。
- [ ] 真实外部 `web/` 宿主逐页迁移仍需宿主源码进入工作区；在此之前只维护可运行的迁移 fixture，不宣称 Users、Channels、Usage Logs 已迁移。

### 0.0.23 跨框架缓存观测收口

0.0.23 已在 0.0.22 基础上继续推进仓库内可验证的长期项，真实外部 `web/` 宿主迁移仍保持
blocker 事实边界：

- [x] 共享 parity fixture 开启真实缓存和 stale-while-revalidate，并通过请求 key 区分 ready/error/permission-denied 场景。
- [x] React、Vue、Svelte、Web Components playground 统一展示最近缓存事件和完整缓存统计，并提供刷新缓存、清空缓存操作。
- [x] 增加 parity fixture 单元测试、四框架浏览器 E2E 和 `examples:check` contract 门禁，锁定 `miss/write → hit → bypass/write → invalidate` 序列。
- [x] 更新数据源、Business framework、parity fixture 文档；视觉复核覆盖缓存面板窄屏换行、主题 surface 和状态可读性。
- [ ] 真实外部 `web/` 宿主逐页迁移、Users/Channels/Usage Logs 接入和旧兼容层清理仍等待宿主源码进入工作区。

### 0.0.24 编辑器安全与交互质量收口

0.0.24 已在 0.0.23 基础上完成编辑器能力、覆盖层键盘语义和目录视觉证据收口：

- [x] 新增 Markdown Editor、Markdown Viewer、Rich Text Editor，提供受控值、表单关联、只读/空态/错误状态和 light/dark 预览。
- [x] Markdown 使用受限序列化，Rich Text 使用白名单 sanitizer，移除脚本、事件属性和不允许的协议；行为测试验证恶意输入不会进入预览。
- [x] Popover/Dropdown 支持 Enter/Space/Arrow 打开、Escape/outside 关闭、ARIA controls/expanded/haspopup 关联、真实内部控件焦点恢复和菜单导航。
- [x] 文档目录更新为 104 Core + 25 Business = 129，并由 catalog、API、docs smoke、a11y、320px 和编辑器安全 E2E 门禁保护。
- [x] 人工视觉复核覆盖三类编辑器的空内容、只读、错误、light/dark、Rounded/Glass/Atmospheric 和 320px 窄屏；历史固定 runner golden 保持 profile-aware 严格比较。
- [ ] 真实外部 `web/` 宿主逐页迁移、Users/Channels/Usage Logs 接入和旧兼容层清理仍等待宿主源码进入工作区。

### 0.0.25 生产观测与输入交互收口

0.0.25 已在 0.0.24 基础上继续推进仓库内可验证项；真实外部宿主迁移仍保持
blocker 事实边界：

- [x] `AdminDataResource` 增加隐私安全的请求生命周期 telemetry：开始、重试、成功、错误和取消事件，提供耗时、attempt、来源、状态、行数和脱敏错误字段。
- [x] 提供 `subscribeTelemetry()`、`getTelemetryStats()`、`resetTelemetryStats()` 与 `telemetry.onEvent`；默认不发送 query/cache key，`includeRequest` 需要宿主显式选择。
- [x] telemetry listener 异常、缓存 telemetry 异常均不会改变请求状态；补充错误、重试、缓存命中、竞态取消和统计重置测试。
- [x] React、Vue、Svelte、Web Components parity playground 展示最近 telemetry event 与 loads/retries/successes/errors/aborts 统计；fixture、E2E 和跨框架文档同步。
- [x] TagInput 支持空输入 Backspace 删除最后一个标签，删除后保留输入焦点并补行为测试。
- [ ] 真实外部 `web/` 宿主逐页迁移、Users/Channels/Usage Logs 接入和旧兼容层清理仍等待宿主源码进入工作区。

### 0.0.26 数据源生命周期与证据收口

0.0.26 已在 0.0.25 基础上继续推进可在当前仓库独立验证的质量项；真实外部宿主迁移仍保持 blocker 事实边界：

- [x] 普通 snapshot subscriber 的初始回调和后续发布均隔离异常，避免一个框架视图阻断其他订阅者或请求状态。
- [x] `dispose()` 取消活动请求时发出 `load-abort` 且携带 `reason: "dispose"`；显式 `abort()`、新请求替换仍保留独立原因。
- [x] 补充数据源回归测试、API/数据源生命周期文档和 320×720 视觉验收记录校正。
- [x] 统一六个可发布包、示例依赖、文档站版本标识和 npm 发布门禁，发布 `0.0.26`。
- [ ] 真实外部 `web/` 宿主逐页迁移、Users/Channels/Usage Logs 接入和旧兼容层清理仍等待宿主源码进入工作区。

### P0：语义 Token 与主题合同

0.0.20 已在 0.0.19 基础上继续收紧：

- 固化 surface、text、border、focus、status、overlay、shadow、radius、motion、form color-scheme 等 token。
- 9 套主题均维护 light/dark 两套值；新增主题必须提供同一份 token 清单。
- `bun run theme:check` 已纳入发布检查，验证 9 × 2 选择器和核心语义 token 不缺失。
- CSS utilities 只使用 AUI 命名空间，禁止把业务页面的硬编码颜色复制进组件样式。
- [x] Business 图表统一支持 hover/键盘 tooltip、`aui-chart-point` 事件和 React `onPoint` 回调；关闭 tooltip 时仍保留 null gap 与静态可访问图形。
- [x] 增加 token lint：扫描组件源码中的颜色字面量、固定圆角和固定阴影。
- [x] 对 glass、atmospheric 主题提供 backdrop-filter 不可用时的实色降级。

### P1：常用组件补齐

已补齐 Menu、Sidebar、Navbar、DatePicker、TimePicker、PinInput、Descriptions、Cascader、Transfer、ContextMenu、HoverCard、NotificationCenter、UploadList、FilePreview、Form、FormItem、SchemaForm、ProgressRing、TruncatedText、LoadingOverlay、ColumnSettings。DataGrid 已补齐排序、筛选、选择、批量操作、服务端分页、移动端卡片和轻量虚拟窗口；Business 已覆盖图表、workflow、权限、审计、导入导出和编辑器 adapter contract。下一阶段优先级：

1. [x] 外部宿主：新增可运行的 `examples/web` 业务宿主，按迁移指南接入 tokens、Page、FilterBar、DataGrid 和状态标签；真实业务仓库接入后继续逐页迁移。
2. [x] 表单体验：Date/Time picker 增加 `picker="custom"` 主题化弹出面板，同时保留原生默认路径和既有事件契约。
3. [x] 性能：新增 10,000 行虚拟 DataGrid 的渲染、滚动、主题切换和 FPS Playwright 预算；真实长列表宿主接入后用业务列渲染器复核。
4. [x] 治理：通过 `governance:check` 和季度 GitHub Actions 审计重复注册、catalog 漂移、过期 token、utility 作用域、版本与文档状态；清理动作仍需在每季度审计结果基础上提交变更。

每新增一个组件，必须同步：

- Core class、register、Custom Elements 类型和 index export。
- React/Vue 绑定；若属于 Svelte 常用层则补 Svelte wrapper。
- catalog、preview、四框架 usage snippet。
- 行为测试、a11y 检查、theme coverage 记录。

### P2：React/Vue/Svelte API parity

- 为属性名、事件名、受控/非受控行为建立映射表。
- React 统一 value/change、checked/change、open/change、select 等回调签名。
- Vue 统一 update:modelValue 或 update:value 的命名策略，避免同类组件各自为政。
- [x] Svelte 已补充常用输入、overlay、data 组件封装和事件类型；parity playground 现在覆盖受控 tab、input、pagination、dialog、toast 状态。
- [x] 维护一个跨框架 parity 示例页面，并由 `examples:check` 校验 versioned fixture、状态标记和框架事件映射。
- [x] 通过 Playwright 实际启动四套 playground，验证受控查询、Tab、分页、Dialog、DOM property 与事件链路，而不只检查构建产物。

### P3：复杂业务能力

- [x] DataGrid 采用可选的 TanStack Table / Virtual adapter，不把大型依赖带入 Core；Business 暴露 `fromTable`、`getAdapterSelection`、`virtualizeRows` contract 和测试。
- [x] Business 图表补充 `normalizeChartSeries`、`getChartDomain`、`fromChartData` contract，兼容常见 `{label, value}` / `{x, y}` 数据与 null telemetry gaps；Recharts/VChart 仍为可选集成。
- CRUD、导入导出、批量操作、权限矩阵、审计日志继续放在 Business 包。
- 图表、富文本、代码编辑器、文件管理以 peer dependency 或 adapter 方式接入。
- [x] 为异步业务组件统一 loading、empty、error、permission denied、`aui-retry` 事件和 retry/permission 插槽；覆盖 Core Table/DataGrid/ListView 与 Business AdvancedTable/AuditLog，并同步 React/Vue/Svelte 绑定。
- [x] 增加 framework-neutral `AdminDataResource`：统一分页请求、Abort、stale response 防护、HTTP 401/403 与 retryable 状态归一化；保留 fetch mapper 为可选能力。

### P4：SSR、无障碍与性能

- [x] 覆盖 SSR/静态 HTML 注册顺序、hydration 和无 DOM 环境的 theme API。
- [x] 用 Playwright 建立 keyboard、focus trap、escape、outside click、form validation 测试矩阵。
- [x] 用 axe 做目录重点组件扫描，修复名称、描述、tab order 和 aria 状态问题。
- [x] 对 docs playground 建立首屏和渲染节点数预算（DOMContentLoaded < 5s、节点 < 20,000、目录卡片数固定）；DataGrid/长列表的滚动性能预算继续由真实业务宿主接入后补充。
- [x] 验证 prefers-reduced-motion、forced-colors、键盘-only 和移动端 320px 宽度。
- [x] 0.0.18 后续收口：Vue/Svelte Business 直连元素在 320px 视口下通过真实浏览器无页面级溢出检查，内部 PermissionMatrix/AuditLog 表格保留局部横向滚动。

### P5：视觉回归与发布治理

- 每个组件至少保存四张基准：默认 dark、默认 light、代表性圆角主题、glass/atmospheric 主题。
- 主题矩阵按 9 × 2 运行，重点组件再覆盖 hover、focus、disabled、loading、empty、error。
- [x] 发布前执行 catalog、public API/docs、typecheck、build、Svelte、docs smoke、unit、a11y、320px/forced-colors 和视觉冒烟；新增 `tests/e2e/visual-matrix.json` 作为跨平台 golden screenshot 的版本化范围合同。
- 0.0.9 保留 0.0.7 的 pixelmatch 重复渲染门禁，并将 Windows/Ubuntu Chromium、视口、9 × 2 主题和代表场景写入可检查 manifest；真实截图按 CI runner 分平台保存，避免字体和系统控件差异造成误报。
- [x] 增加 `.github/workflows/visual-regression.yml`，在 Windows/Ubuntu 固定 runner 上生成 9 × 2 × 3 × 8 的 PNG 视觉证据并保留 14 天；两次同 commit、同 profile 的 432 张证据逐张一致后，已将 profile-specific golden 切换为 active，并在 CI 启用 pixelmatch 比较。
- 组件状态发生变化时更新 changelog、migration note 和截图基准。
- [x] 0.0.18 后续收口：npm registry 传播超时时仍写入缺失包列表的 GitHub job summary，并由失败路径单测保护。
- 每季度清理一次重复组件、过期 token、未使用 utility 和文档示例漂移。

## 组件主题验收矩阵

| 维度 | 必检内容                                                                    |
| ---- | --------------------------------------------------------------------------- |
| 结构 | 默认尺寸、窄屏、slot 内容溢出、长文本、RTL 预留                             |
| 状态 | hover、focus-visible、active、selected、disabled、loading、empty、error     |
| 语义 | 原生元素、role、label、description、aria-selected、aria-expanded、aria-busy |
| 主题 | 9 套 preset × light/dark；surface、text、border、focus、status 均可读       |
| 动效 | 默认 transition、reduced-motion、backdrop-filter 降级                       |
| 框架 | Web Components、React、Vue、Svelte 的属性与事件行为一致                     |
| 文档 | catalog 条目、预览、props/events、四框架 usage、截图和已知限制              |

## 当前组件缺口（0.0.25 后）

短期缺口集中在可复用的复杂交互，而不是继续堆叠展示型组件：

- FormWizard，以及 FilterBuilder/QueryBuilder 的嵌套分组和异步选项适配已落地。
- Combobox 已补齐受控 `query`/`value`/`selected-label`、可取消异步搜索、loading/error/empty 文案、outside/Escape 关闭和原生表单关联。
- Toast manager、通知跨标签页同步、Result action slots 已落地。
- TreeTable、ListView 已提供首版；TanStack-compatible adapter contract、分页/排序/选择映射和虚拟窗口边界测试已落地。
- PermissionMatrix、AuditLog、ImportDialog、ExportButton、BulkActionsToolbar 和更完整的 workflow 业务组件已落地。
- React/Vue/Svelte parity playground、SSR/hydration 验证、`docs/migration.md` 外部宿主迁移示例和 `docs/editor-adapters.md` 编辑器宿主示例已落地；跨平台截图矩阵与 profile-aware PNG golden 策略已版本化。
- LineChart 已完成 SVG 命名空间人工验收；AreaChart、PieChart、Gauge 已按同一 adapter contract 落地，并覆盖 null/empty、donut/legend 与 meter 可访问语义。
- 0.0.10 的图表视觉矩阵新增 AreaChart、PieChart、Gauge 场景；0.0.11 增加图表 tooltip 与键盘点位事件，`fromPieData` / `normalizeGaugeValue` 保持外部图表运行时可选。
- 0.0.12 增加 LineChart 与 AreaChart 多系列共享坐标域、图例和 series-aware 点位事件；AreaChart 多系列已补充文档站预览、React 类型、行为测试和主题/窄屏人工复核。编辑器 adapter 已补充 CodeMirror/TipTap/Monaco 和四种宿主生命周期示例。
- 0.0.18 在 0.0.17 的基础上补齐 docs-site 异步状态实验台、错误重试与权限恢复回归，并修复 Table permission-denied 可见性；0.0.16 的移动端 SchemaForm 控件尺寸和 Windows/Ubuntu profile-specific visual golden 继续作为稳定基线；原生 picker 仍保留为默认兼容模式。
- 0.0.19 新增 Heatmap、FunnelChart、GanttChart：三者均保持 framework-neutral、只依赖 `--aui-*` 语义 token，支持可访问焦点/点位或任务事件；docs-site 已提供预览、主题切换和 320px 组件内部滚动回归。
- 0.0.20 完成四框架真实资源生命周期 parity、Business React 图表行为回归、Web Components pagehide 清理和全量 format release gate。
- 0.0.21 补齐资源 contract 的取消退避、有限重试、指数退避、按请求身份缓存、stale-while-revalidate、`clearCache()` 和 retry 绕过缓存语义；后续继续围绕真实宿主接入、缓存观测和复杂业务组件推进。
- 0.0.22 补齐缓存事件/统计观测、固定 runner golden 提升工具、Business 事件契约和窄屏发布回归；下一阶段继续围绕真实宿主接入、旧兼容层清理、缓存指标接入和复杂业务组件推进。
- 0.0.23 将缓存观测从底层 API 接入四框架 parity playground，并以单元测试和真实浏览器 E2E 固化事件顺序；0.0.25 进一步提供独立的隐私安全请求 telemetry，生产导出仍由宿主通过 `subscribeTelemetry()` 或 `telemetry.onEvent` 接入。
- 真实外部业务仓库的逐页迁移仍需宿主仓库配合；仓库内四套 fixture 已先落地 AdminButton、AdminPage/AdminPageHeader、AdminStatusTag 和 AdminLayout/AdminConsoleShell 的唯一挂载职责。下一轮宿主源码进入工作区后，再迁移 Users、Channels、Usage Logs 页面并清理旧兼容层。
- [x] 补齐 Business Vue/Svelte 直接 Custom Elements 示例，覆盖 25 个元素，并让 catalog/发布门禁检查示例不会回退为未导出的 `Admin*` 标签。
- [x] 将六个包的 npm 可见性检查结果保存为发布 job summary；外部 `web/` 页面迁移仍以宿主源码进入工作区为前提。

## 每次迭代的完成定义

一个组件只有在“实现完成”而不是“文件存在”时才算完成：

1. 注册与类型可用。
2. 受控属性和事件经过行为测试。
3. 默认主题与全部主题 token 无硬编码泄漏。
4. 文档实时预览可操作，代码示例能通过 catalog 检查。
5. 人工逐一查看桌面、窄屏、light/dark 和关键状态。
6. 记录已知限制，并进入下一阶段 backlog。
