# BLBUI 组件库实施计划

> **状态（0.0.12 更新）**：Core 现有 **104 个组件**、Business 19 个、React/Vue 为 104:1 完整 Core 绑定、Svelte 提供注册入口、27 个常用封装（共 29 个公开导出）；9 套主题均支持 light/dark，并提供语义 CSS utilities。当前已接入 token lint、Vitest、Playwright/a11y/E2E、文档 smoke、SSR 检查、三框架 playground 构建、公共 API 文档检查、数据 adapter contract、chart adapter contract、Line/AreaChart 多系列、编辑器 adapter、外部宿主迁移示例、versioned parity fixture、visual matrix/golden 和人工视觉验收；文档站覆盖 123 个组件。
> 下文历史路径说明：`docs/admin-style-guide.md` 位于 `chaos-ui` 风格规范仓库（本仓库不复制全文，tokens 已提取进 `core/src/tokens.css`）；`packages/blbui` 与 `web/` 是规划阶段的占位命名，实际落地为仓库顶层的 `core/ react/ vue/ svelte/ business/ business-react/ docs-site/` workspace。

## 目标

基于 Obsidian Industrial Console 风格规范建立可独立消费的工业风后台组件库，统一支持 React、Vue 3、Svelte 5，并逐步替换宿主应用中重复的样式和交互实现。

## 已完成（Phase 0-4 与发布质量基线）

- [x] 盘点现有 React 后台外壳、`admin-theme.css`、`@chaos_team/chaos-ui` 使用情况。
- [x] 确认技术路线：Lit/Web Components 核心 + React/Vue/Svelte 绑定。
- [x] 创建 monorepo 包结构（顶层 `core/ react/ vue/ svelte/ business/ business-react/ docs-site/`）与独立 package metadata。
- [x] 从样式规范提取 tokens：背景、表面、边框、文字、状态色、字体、尺寸、动效。
- [x] 将核心样式限定在 `.aui-root` / `aui-*`，不复制当前全局 `* { border-radius: 0 !important }`。
- [x] 建立 `@chaos_team/blbui-core`（104 组件）。
- [x] 建立 `@chaos_team/blbui-react`（104 绑定）。
- [x] 建立 `@chaos_team/blbui-vue`（104 绑定）。
- [x] 建立 `@chaos_team/blbui-svelte` 注册/类型入口与 27 个常用封装（共 29 个公开导出）。
- [x] 建立 `@chaos_team/blbui-business`（19 组件）与 `@chaos_team/blbui-business-react`。
- [x] 统一 `aui-*` 事件和跨框架 API 文档（README 完整事件表）。
- [x] 完成架构说明、第三方交互设计借鉴边界和迁移策略。
- [x] core 行为测试 + a11y 契约测试（抽屉焦点、popover、dropdown 键盘、tabs 漫游、field 关联、rating 键盘、file-upload 键盘、tooltip ARIA）。
- [x] Playwright 主题矩阵、移动端无溢出、axe 扫描、Dialog ESC 和桌面/移动截图冒烟测试。
- [x] token lint、catalog 完整性、文档示例和 Svelte dist/source 同步检查纳入发布检查。
- [x] core/react/vue/business/business-react 类型检查、oxlint、oxfmt 检查通过。
- [x] Phase 3 常用业务组件：Field、Textarea/Checkbox/RadioGroup/Switch、Dropdown/Popover/Tooltip、Combobox/MultiSelect、Calendar/CalendarGrid/DateRange、ConfirmDialog/Toast、CopyableText、Skeleton。
- [x] Phase 4 数据密集能力：DataGrid（排序、筛选、选择、批量操作、服务端分页、移动端卡片、虚拟窗口）、Table（loading/empty/error）、ChartContainer、LogViewer、Kanban。

## Phase 2：质量基线

- [x] 增加 core DOM 行为测试：按钮、输入、分页、tabs、dialog、表格状态。
- [x] 增加 React Testing Library 适配器测试。
- [x] 安装并运行 Vue Test Utils、Svelte Testing Library 的最小绑定测试。
- [x] 增加键盘、焦点、ESC、禁用、加载、空数据和错误状态回归测试。
- [x] 增加 `axe` 或 Playwright accessibility 检查。
- [x] 解决 SSR/hydration 下 Custom Elements 注册时机问题（`whenAdminElementsDefined`，无 DOM 时安全返回）。

## Phase 3：常用业务组件

- [x] `Field` / `Textarea` / `Checkbox` / `RadioGroup` / `Switch`。
- [x] `Dropdown` / `Popover` / `Tooltip`。
- [x] `Combobox` / `MultiSelect`。
- [x] `DatePicker` / `TimePicker` / `PinInput`。
- [x] `ConfirmDialog` / `Toast` / `NotificationCenter`。
- [x] `CopyableText` / `Skeleton` / `Descriptions`。
- [x] `Form` / `FormItem` / `SchemaForm` / `TruncatedText` / `LoadingOverlay`。

## Phase 4：数据密集型能力

- [x] DataGrid 基础 column/row schema、加载和空态。
- [x] Table 的加载、空态、错误态和服务端分页字段。
- [x] DataGrid column schema 的排序、筛选、选择、批量操作。
- [x] 服务端分页交互、总数、页大小与 DataGrid 状态组合。
- [x] 响应式表格：横向滚动、移动端卡片降级。
- [x] 轻量虚拟窗口适配，保持核心包不绑定 TanStack Table。
- [x] Chart 容器、日志查看器与主题 token。
- [x] 图例、tooltip 主题 token 与 HTTP 状态语义增强。
- [x] DateRange 边界校验、TreeTable、ListView、FilterBuilder、QueryBuilder 与状态/事件契约。

## Phase 5：React 应用迁移

- [ ] 在外部 `web` 宿主中接入 core tokens（当前仓库不包含 `web/`，待宿主仓库进入工作区）。
- [ ] 用 `AdminButton` 替换新增后台页面里的工业按钮 class。
- [ ] 用 `AdminPage` / `AdminPageHeader` 替换 `web/src/components/admin/admin-page.tsx` 的重复结构。
- [ ] 用 `AdminStatusTag` 替换通用状态标签。
- [ ] 迁移 Users、Channels、Usage Logs 的 FilterBar/Table/Pagination。
- [ ] 保留旧组件兼容层，迁移完成后再删除重复样式。
- [ ] 明确 `AdminLayout` 与 `AdminConsoleShell` 唯一挂载职责，避免双外壳。

## Phase 6：三框架示例与发布

- [x] 创建 React/Vue/Svelte 三套最小 playground。
- [x] 示例统一展示后台页面、筛选、表格、分页、dialog、tabs。
- [x] 输出 ESM/CSS/types 构建产物。
- [x] 通过统一 package version、CHANGELOG、tag 与 GitHub Actions 实现版本管理。
- [ ] 生成 API 文档和 Storybook/Ladle 文档站。
- [x] 发布 0.0.6 小版本，三框架 playground 与绑定测试作为真实使用反馈入口。
- [x] 发布 0.0.7 小版本，业务组件、复杂查询、公共 API 文档和完整 release gate 纳入稳定发布流程。
- [x] 发布 0.0.8 小版本，数据 adapter contract、跨框架受控 parity 和跨平台视觉矩阵纳入稳定发布流程。
- [x] 发布 0.0.9 小版本，LineChart、chart adapter contract、SVG 视觉修复和人工主题验收纳入稳定发布流程。
- [x] 发布 0.0.10 小版本，AreaChart、PieChart、Gauge、图表视觉验收与 320px 窄屏证据纳入稳定发布流程。
- [x] 发布 0.0.12 小版本，AreaChart 多系列、外部宿主迁移示例、profile-aware visual golden contract、编辑器 adapter 和浮层焦点收口纳入稳定发布流程。

## 验收标准

- [x] 默认 Obsidian 视觉基线保持 `#0a0a0a`、`#0f0f0f`、`#262626`、零圆角，并提供圆角/玻璃等可选主题。
- [x] React、Vue、Svelte 的已覆盖组件 props/events API 语义一致。
- [x] 已覆盖复杂交互可键盘操作，焦点可见，状态有 ARIA 语义。
- [x] 已覆盖组件支持 loading/empty/error/disabled/focus/active 状态。
- [x] 小屏输入保持可用字号，表格支持横向滚动或移动端卡片降级。
- [x] 支持 `prefers-reduced-motion`。
- [x] 用户文案可以由宿主通过 props/slot/i18n 传入。
- [x] 不引入全局强制圆角、颜色或阴影覆写。
- [x] 三框架独立安装时不需要安装另外两个框架 runtime。
