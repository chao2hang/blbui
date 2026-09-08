# BLBUI 视觉验收记录

## 本次验收

- 日期：2026-09-08
- 版本：0.0.17
- 入口：http://127.0.0.1:4176/
- 浏览器：Codex In-app Browser
- 视口：桌面约 1280 × 720（页面有效宽度 1265px）；窄屏 390 × 844（页面有效宽度 375px）
- 组件目录：123 个组件卡片，8 个分类
- 主题矩阵：9 套主题 × light/dark = 18 个组合

## 0.0.17 异步状态与 Business parity 复核

- 日期：2026-09-09；入口：docs-site 本地 playground；浏览器：Codex In-app Browser。
- 人工检查 Table/DataGrid/ListView/AdvancedTable/AuditLog 的 loading、empty、error、permission denied、retry 按钮、焦点环与具名插槽契约；默认 token、边框和状态色随主题切换正常。
- 人工检查 Business AdvancedTable 在 React、Vue、Svelte、Web Components playground 的表格宽度、选择控件、窄屏横向滚动和事件反馈；未发现页面级横向溢出或主题覆盖缺口。
- 自动化补充：四套真实浏览器 parity 均通过，Business 行选择 detail 在四个平台均为统一 `keys` 语义；本轮未改动既有 golden，待固定 runner CI 复核后再按规则提升基准。

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

## 0.0.15 跨框架运行时抽查

- React、Vue、Svelte 与原生 Web Components playground 均由 Playwright 实际启动并通过 parity 合同；筛选、Healthy Tab、Dialog 打开/关闭、分页和 DOM property 更新均可观察。
- 视觉抽查确认本轮只涉及适配器状态同步和示例过滤逻辑，未改变组件 token、布局或主题矩阵；Svelte Table/Dialog/Pagination 改为 DOM property 同步，避免 false 布尔属性被误读为开启状态。
- Core Button 保留原生内部按钮的键盘 Enter/Space 语义，Svelte wrapper 仅转发 click 且不重复声明 accessible role；真实浏览器运行时四套 playground 通过，页面错误为空。

## 0.0.14 自定义 picker 与主题抽查

- 在文档站实际打开 DatePicker 的 `picker="custom"` 面板，确认日历网格、月份切换、选日后自动关闭和 Escape 关闭；边界禁用由单元测试与 Playwright 视觉/响应式矩阵覆盖。
- 在文档站实际打开 TimePicker 的 `picker="custom"` 面板，确认小时/分钟选择、`step="900"` 选项粒度和受控值更新。
- 在 Glass dark/light 与 Rounded light 下检查日期、时间、表单、导航、Descriptions 和 Cascader 的 surface、边框、圆角、焦点环；组件均随主题切换，无需修改 markup。
- 当前浏览器控制通道固定为桌面视口；320px 窄屏、reduced-motion、forced-colors 由 Playwright E2E 作为权威响应式证据。

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
- `0.0.13` 在同一 commit 上完成第二次固定 runner 复核；Windows/Ubuntu 各 432 张 PNG 逐张 SHA-256 一致，已提取为 profile-specific golden 并启用同 profile 差异比较。

## 已知限制

- Date/Time picker 默认仍可走原生控件；本轮新增 `picker="custom"`，在 Obsidian/Rounded/Glass 的 light/dark 下使用 token 驱动的日历/时间面板，边界项、Escape 和外部点击关闭已纳入后续人工抽查。
- 关闭状态的 Dialog 内部关闭按钮不会被绘制，这是隐藏组件的预期结果，不作为视觉缺陷。
- 当前 Playwright 会生成桌面/移动截图冒烟产物，并通过 pixelmatch 检查重复渲染稳定性；`tests/e2e/visual-matrix.json` 已固定 Windows/Ubuntu Chromium、desktop/mobile/narrow、9 × 2 主题与 8 个代表场景。`.github/workflows/visual-regression.yml` 会在两个固定 runner 上生成 9 × 2 × 3 × 8 的 PNG 证据并保留 14 天；`tests/e2e/visual-golden.json` 与 `VISUAL_MATRIX_GOLDEN_DIR` 已固定 profile-aware 文件名和像素比较策略，active golden 仅比较相同 profile，避免字体和系统控件差异造成误报。
- ContextMenu 的打开位置来自浏览器右键坐标；在极窄视口边缘的智能翻转仍列入下一轮定位增强。
- Area/Pie/Gauge 已完成首次人工验收；下一轮视觉矩阵继续覆盖 9 套主题、日夜模式、320px 窄屏、空数据和 Gauge 极值。

## 后续验收规则

每次新增或修改组件必须更新本记录对应矩阵，并至少复核：默认 light/dark、圆角主题、Glass/Atmospheric、窄屏、键盘焦点、禁用/加载/空/错误状态。发布前运行 `bun run release:check`，并将新的视觉差异和已知限制写入本文件。

## 0.0.16 移动端 SchemaForm golden 复核

- 对 commit `2d5477d` 的固定 runner 产物进行了人工逐图检查；Ubuntu 与 Windows 的 `mobile / obsidian-light / schema-form` 均确认组件内容、主题 token、边框、字段间距、控件尺寸、按钮和底部裁切正常。
- 本轮差异只来自移动端输入文字与原生控件的跨 runner 基线变化：Ubuntu mobile 产物为 `324 × 263`，Windows mobile 产物为 `324 × 262`；Ubuntu/Windows narrow 产物均为 `254 × 263`；未发现功能、布局或主题回归。
- 已更新 `tests/e2e/golden/ubuntu-chromium/` 与 `tests/e2e/golden/windows-chromium/` 中 mobile + narrow SchemaForm 的 9 套主题 × light/dark、双平台共 72 个 profile-specific PNG；未重录其余 792 张 golden。后续 runner/浏览器升级仍需按同样流程重新人工复核。
- 严格比较还发现两张既有 narrow 业务场景存在固定 runner 的 1px 高度漂移：Ubuntu Obsidian light 的 FormWizard 为 `254 × 127`、Windows Obsidian light 的 PermissionMatrix 为 `254 × 141`；两张均与已人工复核的 narrow 证据一致，已同步提升对应 profile-specific golden。
- 后续双 runner 复核确认 Ubuntu Enterprise dark 的 PieChart 与 Windows Minimal light 的 Gauge 在 narrow 视口存在确定性的 1px 截图边界基线差异；两张失败证据与各自历史 golden 的组件内容逐像素一致，仅外层容器截取起点不同。已人工检查截图并提升对应的 profile-specific golden，未发现组件视觉回归。

## 0.0.16 固定 runner narrow 边界复核（run 34261433120）

- Ubuntu Chromium 与 Windows Chromium 的完整矩阵均已收集并逐组人工检查；本次 CI 报告的 54 张差异全部集中在 narrow 视口的业务场景：Ubuntu 为 PermissionMatrix / PieChart / FormWizard 共 36 张，Windows 为 Gauge / PermissionMatrix 共 18 张。
- 对实际截图、历史 golden 和 diff 逐张核对后确认：图形、文字、颜色、主题 token 和组件内部布局均一致；差异来自 `target.screenshot()` 保留元素边界后，与历史 full-page clip 在 1px 外层截取起点/终点上的确定性差异。
- 已依据 run `34261433120` 的固定 runner 证据提升上述 54 张 profile-specific golden；未放宽 pixel-exact 策略，也未更新任何非差异图。下一次双 runner 复核必须重新确认同样的边界语义，再处理 runner 或 Playwright 升级带来的变化。

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

## 0.0.13 固定 runner golden promotion

- 在同一 `0.0.13` commit `fcd7d73` 上完成两次固定 runner 矩阵运行：Windows Chromium 与 Ubuntu Chromium 均成功。
- 两次产物按 profile、viewport、theme、mode、scene 逐张比较，Windows `432/432`、Ubuntu `432/432` 均 SHA-256 一致，差异为 0。
- 已提交 `tests/e2e/golden/windows-chromium/` 与 `tests/e2e/golden/ubuntu-chromium/` 各 432 张 PNG，并将 `visual-golden.json` 状态切换为 `active`。
- CI 现在为每个平台设置 `VISUAL_MATRIX_GOLDEN_DIR` 和 `VISUAL_MATRIX_GOLDEN_REQUIRED=1`，仅比较相同 profile；本机未固定 runner 的截图不作为 golden 验收依据。

本轮实际截图抽查补充：

- Glass light：AreaChart 两条填充曲线、null gap、系列颜色和 legend 均可辨识，卡片背景、边框和 tooltip 维持玻璃主题层级。
- Rounded dark：AreaChart 两条 polyline 与两个 legend swatch 的颜色映射正确，圆角容器没有裁切 legend；页面 `scrollWidth - clientWidth` 为 0。

## 下一轮验收重点

- Area Chart 多系列需要在 9 套主题 × light/dark、null gap、legend、键盘点位和 320px 窄屏下复核。
- 固定 runner PNG golden 已按 Windows/Ubuntu profile 独立保存并启用同 profile PR 差异门禁；后续 runner 或浏览器升级必须重新完成双次稳定性复核。
- 外部宿主迁移示例需覆盖原生 Web Components、React、Vue、Svelte 的注册时机和事件清理。
