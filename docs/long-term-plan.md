# BLBUI 长期完善计划

这份计划把“组件补齐、主题覆盖、跨框架一致性、人工视觉验收”变成可持续的发布流程。每个阶段都应保留可运行的主分支，新增能力必须同时进入 Core、目录、示例、绑定层和验收矩阵。

## 目标状态

- Core 提供框架无关、可访问、可主题化的常用系统组件。
- React、Vue、Svelte 的公开 API 与事件语义保持可预测的一致。
- 所有组件只依赖语义化 AUI token；主题切换不需要修改组件业务代码。
- 每个组件都有 light/dark、交互状态、窄屏和 reduced-motion 的可复核证据。
- 文档站是组件目录、实时 playground、主题实验室和视觉回归入口。

## 阶段计划

### P0：语义 Token 与主题合同

0.0.15 已在 0.0.14 基础上继续收紧：

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
- 为异步业务组件统一 loading、empty、error、permission denied 和 retry 插槽。

### P4：SSR、无障碍与性能

- 覆盖 SSR/静态 HTML 注册顺序、hydration 和无 DOM 环境的 theme API。
- [x] 用 Playwright 建立 keyboard、focus trap、escape、outside click、form validation 测试矩阵。
- [x] 用 axe 做目录重点组件扫描，修复名称、描述、tab order 和 aria 状态问题。
- [x] 对 docs playground 建立首屏和渲染节点数预算（DOMContentLoaded < 5s、节点 < 20,000、目录卡片数固定）；DataGrid/长列表的滚动性能预算继续由真实业务宿主接入后补充。
- 验证 prefers-reduced-motion、forced-colors、键盘-only 和移动端 320px 宽度。

### P5：视觉回归与发布治理

- 每个组件至少保存四张基准：默认 dark、默认 light、代表性圆角主题、glass/atmospheric 主题。
- 主题矩阵按 9 × 2 运行，重点组件再覆盖 hover、focus、disabled、loading、empty、error。
- [x] 发布前执行 catalog、public API/docs、typecheck、build、Svelte、docs smoke、unit、a11y、320px/forced-colors 和视觉冒烟；新增 `tests/e2e/visual-matrix.json` 作为跨平台 golden screenshot 的版本化范围合同。
- 0.0.9 保留 0.0.7 的 pixelmatch 重复渲染门禁，并将 Windows/Ubuntu Chromium、视口、9 × 2 主题和代表场景写入可检查 manifest；真实截图按 CI runner 分平台保存，避免字体和系统控件差异造成误报。
- [x] 增加 `.github/workflows/visual-regression.yml`，在 Windows/Ubuntu 固定 runner 上生成 9 × 2 × 3 × 8 的 PNG 视觉证据并保留 14 天；两次同 commit、同 profile 的 432 张证据逐张一致后，已将 profile-specific golden 切换为 active，并在 CI 启用 pixelmatch 比较。
- 组件状态发生变化时更新 changelog、migration note 和截图基准。
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

## 当前组件缺口（0.0.15 后）

短期缺口集中在可复用的复杂交互，而不是继续堆叠展示型组件：

- FormWizard，以及 FilterBuilder/QueryBuilder 的嵌套分组和异步选项适配已落地。
- Toast manager、通知跨标签页同步、Result action slots 已落地。
- TreeTable、ListView 已提供首版；TanStack-compatible adapter contract、分页/排序/选择映射和虚拟窗口边界测试已落地。
- PermissionMatrix、AuditLog、ImportDialog、ExportButton、BulkActionsToolbar 和更完整的 workflow 业务组件已落地。
- React/Vue/Svelte parity playground、SSR/hydration 验证、`docs/migration.md` 外部宿主迁移示例和 `docs/editor-adapters.md` 编辑器宿主示例已落地；跨平台截图矩阵与 profile-aware PNG golden 策略已版本化。
- LineChart 已完成 SVG 命名空间人工验收；AreaChart、PieChart、Gauge 已按同一 adapter contract 落地，并覆盖 null/empty、donut/legend 与 meter 可访问语义。
- 0.0.10 的图表视觉矩阵新增 AreaChart、PieChart、Gauge 场景；0.0.11 增加图表 tooltip 与键盘点位事件，`fromPieData` / `normalizeGaugeValue` 保持外部图表运行时可选。
- 0.0.12 增加 LineChart 与 AreaChart 多系列共享坐标域、图例和 series-aware 点位事件；AreaChart 多系列已补充文档站预览、React 类型、行为测试和主题/窄屏人工复核。编辑器 adapter 已补充 CodeMirror/TipTap/Monaco 和四种宿主生命周期示例。
- 0.0.15 已在四套 playground 的真实浏览器 parity、治理审计和跨框架受控属性修复上收口；0.0.14 的 Web 宿主、主题化 Date/Time picker、长列表性能合同继续作为稳定基线；原生 picker 仍保留为默认兼容模式。
- 真实外部业务仓库的逐页迁移仍需宿主仓库配合，下一轮应优先落地 AdminButton、AdminPage/AdminPageHeader、AdminStatusTag 和 AdminLayout/AdminConsoleShell 的唯一挂载职责，再迁移 Users、Channels、Usage Logs 页面并清理旧兼容层。

## 每次迭代的完成定义

一个组件只有在“实现完成”而不是“文件存在”时才算完成：

1. 注册与类型可用。
2. 受控属性和事件经过行为测试。
3. 默认主题与全部主题 token 无硬编码泄漏。
4. 文档实时预览可操作，代码示例能通过 catalog 检查。
5. 人工逐一查看桌面、窄屏、light/dark 和关键状态。
6. 记录已知限制，并进入下一阶段 backlog。
