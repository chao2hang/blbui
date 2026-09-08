# BLBUI 视觉验收记录

## 本次验收

- 日期：2026-09-08
- 版本：0.0.12
- 入口：http://127.0.0.1:4176/
- 浏览器：Codex In-app Browser
- 视口：桌面约 1280 × 720（页面有效宽度 1265px）；窄屏 390 × 844（页面有效宽度 375px）
- 组件目录：123 个组件卡片，8 个分类
- 主题矩阵：9 套主题 × light/dark = 18 个组合

## 结果

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| 组件目录完整渲染 | 通过 | 123/123 卡片存在并渲染；分类计数与可见数量一致；逐卡尺寸检查无 0 尺寸 |
| 页面级横向溢出 | 通过 | 桌面与 390px 窄屏均复核 `scrollWidth === clientWidth`；窄屏标题字号已收敛，水平滚动条已消除 |
| 主题覆盖 | 通过 | 9 套主题 × light/dark 共 18 个组合均逐一切换目视；组件数量保持 123 个；新增组件只使用 AUI token |
| 日夜切换 | 通过 | 根节点 `data-aui-mode` 正确在 light/dark 间切换 |
| 分类筛选 | 通过 | Business 筛选准确显示 19 个业务组件，恢复 All 后显示 123 个 |
| Dialog | 通过 | 打开、遮罩、焦点进入、ESC 关闭和焦点恢复均正常 |
| Drawer | 通过 | 右侧抽屉打开、遮罩和 ESC 关闭均正常 |
| Usage tabs | 通过 | Button 的 Web Components/React/Vue/Svelte 标签切换会更新代码片段 |
| 代表组件视觉 | 通过 | 表单、导航、反馈、覆盖层、数据、布局、业务组件均有人工目视检查；Area/Pie/Gauge 在 Obsidian light/dark、Rounded、Glass 与 320px 窄屏下已人工复核 |
| 代码区与卡片窄屏布局 | 通过 | 代码区可横向滚动；窄屏页面无级联横向溢出，卡片内部代码区保留局部滚动；浮层预览不再被 playground 纵向裁切 |

## 人工目视范围

已实际查看以下页面状态和组件：

- Obsidian、Rounded、Enterprise、Modern、Minimal、Premium、Chinese、Atmospheric、Glass 的 light/dark 共 18 个组合逐一切换，确认布局、颜色、圆角/边框和状态 token 生效。
- Button、Card、Container、Stack、Grid、Menu、Sidebar、Navbar。
- DatePicker、TimePicker、PinInput、Descriptions。
- Cascader、Transfer、ContextMenu、HoverCard、NotificationCenter。
- UploadList、FilePreview（空态、文件状态、PDF 元信息、打开/关闭）。
- Bar Chart、Line Chart、Area Chart、Pie Chart、Gauge、Sparkline、DataGrid、Kanban、Table。
- Dialog、Drawer、Popover、Dropdown、Accordion、Collapsible。
- 主题展示区、组件分类区、代码示例区、框架切换区和无障碍说明区。

本轮新增的交互复核：

- UploadList：READY、UPLOADING 进度、FAILED 错误、RETRY、PREVIEW、REMOVE 按钮均可见且可操作；点击 RETRY 后组件仍保持稳定渲染，点击 PREVIEW 会把文件交给 FilePreview 并打开弹层。
- FilePreview：打开后有遮罩和 dialog 语义，显示文件名、MIME 类型、大小与不可预览提示；关闭按钮可关闭并恢复页面。
- Form / FormItem / SchemaForm：输入、Select、number、required 校验、提交和 reset 状态可见且可操作。
- DataGrid / ColumnSettings：排序、筛选、行选择、批量操作、列显隐和移动端卡片状态可见且可操作。
- TreeTable / ListView / FilterBuilder / QueryBuilder：展开选择、加载/空态、规则增删和 ALL/ANY 查询状态已检查。
- FormWizard / PermissionMatrix / AuditLog：步骤切换、横向滚动、权限循环、筛选/空态/错误/加载状态已检查。
- ImportDialog / ExportButton / BulkActionsToolbar：文件预览、CSV 导出事件、无选中时按钮禁用和危险操作标识已检查。
- ProgressRing / TruncatedText / LoadingOverlay：进度、长文本可访问名称、遮罩 loading 状态均已检查。
- Forms / Data 筛选：分别显示 26 / 14 个卡片，页面级横向溢出为 false。
- 390px 窄屏：主题展示区与组件目录可滚动浏览，修复标题造成的 2px 页面级横向溢出。

## 固定 runner 视觉证据

- GitHub Actions run [34186435788](https://github.com/chao2hang/blbui/actions/runs/34186435788) 已在 Windows Chromium 与 Ubuntu Chromium 均通过完整视觉矩阵；当前矩阵每个平台应上传 432 张 PNG（9 themes × 2 modes × 3 viewports × 8 scenes）。
- 已人工抽查 Ubuntu 产物的默认 Button、Rounded 移动端 DataGrid、Glass 表单、Chinese workflow 和窄屏 Permission Matrix；布局、主题 token、圆角和业务状态均正常。
- 当前产物作为首批跨平台证据保留 14 天；确认字体、系统控件和浏览器版本稳定后，再从证据产物中提取每个平台 432 张 platform-specific golden，并启用同 profile 差异比较。

## 已知限制

- 原生 date/time 控件的弹出日历和时间面板由操作系统/浏览器绘制，主题只能控制字段本身；跨平台弹出面板需后续自定义 picker 方案。
- 关闭状态的 Dialog 内部关闭按钮不会被绘制，这是隐藏组件的预期结果，不作为视觉缺陷。
- 当前 Playwright 会生成桌面/移动截图冒烟产物，并通过 pixelmatch 检查重复渲染稳定性；`tests/e2e/visual-matrix.json` 已固定 Windows/Ubuntu Chromium、desktop/mobile/narrow、9 × 2 主题与 8 个代表场景。`.github/workflows/visual-regression.yml` 会在两个固定 runner 上生成 9 × 2 × 3 × 8 的 PNG 证据并保留 14 天；`tests/e2e/visual-golden.json` 与 `VISUAL_MATRIX_GOLDEN_DIR` 已固定 profile-aware 文件名和像素比较策略，首轮证据确认后再将 status 切为 active，避免字体和系统控件差异造成误报。
- ContextMenu 的打开位置来自浏览器右键坐标；在极窄视口边缘的智能翻转仍列入下一轮定位增强。
- Area/Pie/Gauge 已完成首次人工验收；下一轮视觉矩阵继续覆盖 9 套主题、日夜模式、320px 窄屏、空数据和 Gauge 极值。

## 后续验收规则

每次新增或修改组件必须更新本记录对应矩阵，并至少复核：默认 light/dark、圆角主题、Glass/Atmospheric、窄屏、键盘焦点、禁用/加载/空/错误状态。发布前运行 `bun run release:check`，并将新的视觉差异和已知限制写入本文件。

## 0.0.11 图表 tooltip/focus 复核

- 入口：`http://127.0.0.1:4179/#components`；Chrome 桌面视口；Business 分类显示 19 个组件。
- Bar Chart：Obsidian dark 与 Glass light 下人工确认悬浮/键盘点位均显示 `12:00: 920`，焦点描边、tooltip 对比度和图表布局正常。
- Area Chart：Obsidian dark 下人工确认悬浮/键盘点位均显示 `04:00: 29`，空值间隙与焦点描边保持稳定。
- Pie Chart：Obsidian dark 下人工确认悬浮/键盘分区均显示 `EDGE: 42 (42%)`，donut、legend 和 tooltip 不发生布局跳动。
- 主题抽查：Glass dark/light 均覆盖图表；日间 tooltip 背景、边框、文字与焦点色满足可读性要求。

## 0.0.12 新增能力复核

- DateRange：快捷范围、清空按钮、动态起止边界和严格日期格式校验已在文档站逐项操作；合法值会同步 `aui-range-change`，非法值显示错误文本、`aria-invalid` 和 `aria-describedby`，清空后恢复可提交状态。
- Line Chart 多系列：Obsidian dark、Rounded light、Glass dark 和 320px 窄屏均检查了共享 Y 轴、不同系列颜色、legend 换行、null gap 和键盘 tooltip；`aui-chart-point` 事件包含 `seriesId` / `seriesLabel`，旧单系列 detail 保持 `{ index, point }`。
- Editor adapter：文档与 Business React contract 示例均检查了宿主无编辑器运行时时的读写、连接/断开和受控更新路径；适配层不捆绑 CodeMirror、TipTap 或 Monaco。
- 主题与窄屏：Rounded、Glass 的 light/dark 组合再次抽查表单、图表、浮层；320px 下 DateRange 快捷操作、Line Chart legend 和编辑器状态示例未产生页面级横向溢出。
- SSR/hydration：无 DOM 注册、`whenAdminElementsDefined`、theme API fallback 和 React/Vue/Svelte 最小挂载均通过自动化验证；自定义元素定义前不会读取浏览器专有状态。

本轮实际截图抽查补充：

- Glass light：AreaChart 两条填充曲线、null gap、系列颜色和 legend 均可辨识，卡片背景、边框和 tooltip 维持玻璃主题层级。
- Rounded dark：AreaChart 两条 polyline 与两个 legend swatch 的颜色映射正确，圆角容器没有裁切 legend；页面 `scrollWidth - clientWidth` 为 0。

## 下一轮验收重点

- Area Chart 多系列需要在 9 套主题 × light/dark、null gap、legend、键盘点位和 320px 窄屏下复核。
- 固定 runner PNG golden 先按 Windows/Ubuntu profile 独立保存并只比较同 profile；首轮基线确认后再启用 PR 差异门禁。
- 外部宿主迁移示例需覆盖原生 Web Components、React、Vue、Svelte 的注册时机和事件清理。
