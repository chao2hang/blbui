# BLBUI 组件库实施计划

> **状态（0.0.3 更新）**：本计划 Phase 0–4 已全部落地——Core 现有 **78 个组件**、Business 9 个、React/Vue 为 78:1 完整绑定、Svelte 提供注册入口与 7 个封装；Phase 2 的测试基线（Vitest 行为测试 + a11y 契约测试）已就位；Phase 6 的文档站（`docs-site/`）已可构建。
> 下文历史路径说明：`docs/admin-style-guide.md` 位于 `chaos-ui` 风格规范仓库（本仓库不复制全文，tokens 已提取进 `core/src/tokens.css`）；`packages/blbui` 与 `web/` 是规划阶段的占位命名，实际落地为仓库顶层的 `core/ react/ vue/ svelte/ business/ business-react/ docs-site/` workspace。

## 目标

基于 Obsidian Industrial Console 风格规范建立可独立消费的工业风后台组件库，统一支持 React、Vue 3、Svelte 5，并逐步替换宿主应用中重复的样式和交互实现。

## 已完成（Phase 0-4 落地）

- [x] 盘点现有 React 后台外壳、`admin-theme.css`、`@chaos_team/chaos-ui` 使用情况。
- [x] 确认技术路线：Lit/Web Components 核心 + React/Vue/Svelte 绑定。
- [x] 创建 monorepo 包结构（顶层 `core/ react/ vue/ svelte/ business/ business-react/ docs-site/`）与独立 package metadata。
- [x] 从样式规范提取 tokens：背景、表面、边框、文字、状态色、字体、尺寸、动效。
- [x] 将核心样式限定在 `.aui-root` / `aui-*`，不复制当前全局 `* { border-radius: 0 !important }`。
- [x] 建立 `@chaos_team/blbui-core`（78 组件）。
- [x] 建立 `@chaos_team/blbui-react`（78 绑定）。
- [x] 建立 `@chaos_team/blbui-vue`（78 绑定）。
- [x] 建立 `@chaos_team/blbui-svelte` 注册/类型入口与 7 个封装。
- [x] 建立 `@chaos_team/blbui-business`（9 组件）与 `@chaos_team/blbui-business-react`。
- [x] 统一 `aui-*` 事件和跨框架 API 文档（README 完整事件表）。
- [x] 完成架构说明、第三方交互设计借鉴边界和迁移策略。
- [x] core 行为测试 + a11y 契约测试（抽屉焦点、popover、dropdown 键盘、tabs 漫游、field 关联、rating 键盘、file-upload 键盘、tooltip ARIA）。
- [x] core/react/vue/business/business-react 类型检查、oxlint、oxfmt 检查通过。
- [x] Phase 3 常用业务组件：Field、Textarea/Checkbox/RadioGroup/Switch、Dropdown/Popover/Tooltip、Combobox/MultiSelect、Calendar/CalendarGrid/DateRange、ConfirmDialog/Toast、CopyableText、Skeleton。
- [x] Phase 4 数据密集能力：DataGrid（列/行/加载/空态）、Table（loading/empty/error）、服务端分页字段、ChartContainer、LogViewer、Kanban。

## Phase 2：质量基线

- [ ] 增加 core DOM 行为测试：按钮、输入、分页、tabs、dialog、表格状态。
- [ ] 增加 React Testing Library 适配器测试。
- [ ] 安装并运行 Vue Test Utils、Svelte Testing Library 的最小绑定测试。
- [ ] 增加键盘、焦点、ESC、禁用、加载、空数据和错误状态回归测试。
- [ ] 增加 `axe` 或 Playwright accessibility 检查。
- [ ] 解决 SSR/hydration 下 Custom Elements 注册时机问题。

## Phase 3：常用业务组件

- [ ] `Field` / `Label` / `FieldError` / `Form`。
- [ ] `Textarea` / `Checkbox` / `Radio` / `Switch`。
- [ ] `DropdownMenu` / `Popover` / `Tooltip`。
- [ ] `Combobox` / `MultiSelect`。
- [ ] `DatePicker` / `DateTimePicker`。
- [ ] `ConfirmDialog` / `Toast` / `Notification`。
- [ ] `CopyableText` / `TruncatedText` / `LogStatusTag`。
- [ ] `Skeleton` / `LoadingOverlay`。

## Phase 4：数据密集型能力

- [ ] DataTable column schema、排序、筛选、选择、批量操作。
- [ ] 服务端分页、总数、页大小、空/加载/错误状态组合。
- [ ] 响应式表格：横向滚动、移动端卡片降级。
- [ ] 虚拟滚动适配，保持核心包不绑定 TanStack Table。
- [ ] Chart 容器、图例、tooltip 主题 token。
- [ ] 日志表格与 HTTP 状态语义。

## Phase 5：React 应用迁移

- [ ] 在 `web` 中接入 core tokens，不改变当前页面视觉结果。
- [ ] 用 `AdminButton` 替换新增后台页面里的工业按钮 class。
- [ ] 用 `AdminPage` / `AdminPageHeader` 替换 `web/src/components/admin/admin-page.tsx` 的重复结构。
- [ ] 用 `AdminStatusTag` 替换通用状态标签。
- [ ] 迁移 Users、Channels、Usage Logs 的 FilterBar/Table/Pagination。
- [ ] 保留旧组件兼容层，迁移完成后再删除重复样式。
- [ ] 明确 `AdminLayout` 与 `AdminConsoleShell` 唯一挂载职责，避免双外壳。

## Phase 6：三框架示例与发布

- [ ] 创建 React/Vue/Svelte 三套最小 playground。
- [ ] 示例统一展示后台页面、筛选、表格、分页、dialog、tabs。
- [ ] 输出 ESM/CSS/types 构建产物。
- [ ] 配置 changesets 或等价版本管理。
- [ ] 生成 API 文档和 Storybook/Ladle 文档站。
- [ ] 发布 alpha，收集三框架真实使用反馈。

## 验收标准

- [ ] 核心视觉与样式规范一致：`#0a0a0a`、`#0f0f0f`、`#262626`、零圆角。
- [ ] React、Vue、Svelte 的 props/events API 语义一致。
- [ ] 复杂交互可键盘操作，焦点可见，状态有 ARIA 语义。
- [ ] 组件支持 loading/empty/error/disabled/focus/active 状态。
- [ ] 小屏输入保持 16px，表格可以横向滚动。
- [ ] 支持 `prefers-reduced-motion`。
- [ ] 用户文案可以由宿主通过 props/slot/i18n 传入。
- [ ] 不引入全局强制圆角、颜色或阴影覆写。
- [ ] 三框架独立安装时不需要安装另外两个框架 runtime。
