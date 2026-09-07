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

当前已落地基础版本，后续持续收紧合同：

- 固化 surface、text、border、focus、status、overlay、shadow、radius、motion、form color-scheme 等 token。
- 9 套主题均维护 light/dark 两套值；新增主题必须提供同一份 token 清单。
- `bun run theme:check` 已纳入发布检查，验证 9 × 2 选择器和核心语义 token 不缺失。
- CSS utilities 只使用 AUI 命名空间，禁止把业务页面的硬编码颜色复制进组件样式。
- 增加 token lint：扫描组件源码中的颜色字面量、固定圆角和固定阴影。
- 对 glass、atmospheric 主题提供 backdrop-filter 不可用时的实色降级。

### P1：常用组件补齐

已补齐第一批 Menu、Sidebar、Navbar、DatePicker、TimePicker、PinInput、Descriptions；第二批已补齐 Cascader、Transfer、ContextMenu、HoverCard、NotificationCenter。下一批优先级：

1. 交互基础：Popover、Dropdown、Command 与已新增浮层组件的键盘、焦点和 outside-dismiss 合同统一。
2. 表单高级：DateRangePicker 增强、FormItem、SchemaForm。（UploadList、FilePreview 已完成。）
3. 数据展示：DataGrid 排序/筛选/选择/批量操作、TreeTable、ListView、ColumnSettings。
4. 系统布局：AppShell 移动端抽屉、Breadcrumb overflow、PageHeader responsive actions。
5. 反馈与状态：ProgressRing、Result action slots、全局 toast manager、通知历史持久化。

每新增一个组件，必须同步：

- Core class、register、Custom Elements 类型和 index export。
- React/Vue 绑定；若属于 Svelte 常用层则补 Svelte wrapper。
- catalog、preview、四框架 usage snippet。
- 行为测试、a11y 检查、theme coverage 记录。

### P2：React/Vue/Svelte API parity

- 为属性名、事件名、受控/非受控行为建立映射表。
- React 统一 value/change、checked/change、open/change、select 等回调签名。
- Vue 统一 update:modelValue 或 update:value 的命名策略，避免同类组件各自为政。
- Svelte 补充常用输入、overlay、data 组件封装和事件类型。
- 维护一个跨框架 parity 示例页面，任何 breaking change 先在示例中暴露。

### P3：复杂业务能力

- DataGrid 采用可选的 TanStack Table / Virtual adapter，不把大型依赖带入 Core。
- CRUD、导入导出、批量操作、权限矩阵、审计日志继续放在 Business 包。
- 图表、富文本、代码编辑器、文件管理以 peer dependency 或 adapter 方式接入。
- 为异步业务组件统一 loading、empty、error、permission denied 和 retry 插槽。

### P4：SSR、无障碍与性能

- 覆盖 SSR/静态 HTML 注册顺序、hydration 和无 DOM 环境的 theme API。
- 用 Playwright 建立 keyboard、focus trap、escape、outside click、form validation 测试。
- 用 axe 做组件目录级扫描，修复名称、描述、对比度、tab order 和 aria 状态问题。
- 对 DataGrid、长列表和 docs playground 做性能预算：首屏、渲染节点数、主题切换耗时。
- 验证 prefers-reduced-motion、forced-colors、键盘-only 和移动端 320px 宽度。

### P5：视觉回归与发布治理

- 每个组件至少保存四张基准：默认 dark、默认 light、代表性圆角主题、glass/atmospheric 主题。
- 主题矩阵按 9 × 2 运行，重点组件再覆盖 hover、focus、disabled、loading、empty、error。
- 发布前执行 catalog、typecheck、build、Svelte、docs smoke、unit、a11y、visual regression。
- 组件状态发生变化时更新 changelog、migration note 和截图基准。
- 每季度清理一次重复组件、过期 token、未使用 utility 和文档示例漂移。

## 组件主题验收矩阵

| 维度 | 必检内容 |
| --- | --- |
| 结构 | 默认尺寸、窄屏、slot 内容溢出、长文本、RTL 预留 |
| 状态 | hover、focus-visible、active、selected、disabled、loading、empty、error |
| 语义 | 原生元素、role、label、description、aria-selected、aria-expanded、aria-busy |
| 主题 | 9 套 preset × light/dark；surface、text、border、focus、status 均可读 |
| 动效 | 默认 transition、reduced-motion、backdrop-filter 降级 |
| 框架 | Web Components、React、Vue、Svelte 的属性与事件行为一致 |
| 文档 | catalog 条目、预览、props/events、四框架 usage、截图和已知限制 |

## 当前组件缺口

短期缺口集中在可复用的复杂交互，而不是继续堆叠展示型组件：

- DateRangePicker 增强 / FormItem / SchemaForm。
- Drawer mobile mode / Toast manager / Notification history persistence。
- DataGrid 的列配置、虚拟滚动、服务端分页和批量操作。
- TreeTable、ColumnSettings、FilterBuilder、QueryBuilder。
- FormWizard、SchemaForm、PermissionMatrix、AuditLog。
- 更完整的 Svelte 常用封装和跨框架 parity 示例。

## 每次迭代的完成定义

一个组件只有在“实现完成”而不是“文件存在”时才算完成：

1. 注册与类型可用。
2. 受控属性和事件经过行为测试。
3. 默认主题与全部主题 token 无硬编码泄漏。
4. 文档实时预览可操作，代码示例能通过 catalog 检查。
5. 人工逐一查看桌面、窄屏、light/dark 和关键状态。
6. 记录已知限制，并进入下一阶段 backlog。
