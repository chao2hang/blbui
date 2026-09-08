# Changelog

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
