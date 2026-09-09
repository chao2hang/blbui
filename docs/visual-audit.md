# BLBUI 视觉验收记录

## 本次验收

- 日期：2026-09-09
- 版本：0.0.26
- 入口：http://127.0.0.1:4176/
- 浏览器：Codex In-app Browser
- 视口：桌面约 1280 × 720（页面有效宽度 1265px）；窄屏 320 × 720
- 组件目录：129 个组件卡片，8 个分类
- 主题矩阵：9 套主题 × light/dark = 18 个组合

### 0.0.26 发布前人工复核（2026-09-09）

- 在 docs-site、React、Vue、Svelte 和 Web Components 入口复核数据资源生命周期示例；订阅者更新、dispose/abort 状态、telemetry 文案和统计卡片均保持可见。
- 在 Obsidian dark、Rounded light、Glass dark 和 Atmospheric light 下检查资源状态卡片、按钮焦点、边框与文字对比度；主题切换后未发现 token 缺失或状态不可读。
- 使用 320 × 720 视口复核四个 playground 的筛选区、数据表、异步操作、通知层和观测面板；页面按纵向流动，未发现页面级横向溢出或控件裁切。
- 自动化补充：数据源测试 16/16、business 类型检查、格式检查、公开 API 检查和 release/governance 门禁通过；本轮没有变更组件像素 golden。
- 结果：0.0.26 数据资源生命周期与发布证据完成收口；真实外部 `web/` 宿主仍未进入工作区，Users、Channels、Usage Logs 不宣称已迁移。

### 0.0.25 发布前人工复核（2026-09-09）

- 版本：0.0.25
- 在 React、Vue、Svelte 和 Web Components playground 实际查看 telemetry 面板；初次加载显示 `load-success`，统计卡片显示 loads/successes，重试和错误路径的 event 文案与聚合数字可更新。
- 在 Obsidian dark、Rounded light、Glass dark 和 Atmospheric light 下查看 telemetry/cache 两组观测面板；surface、边框、文字、按钮焦点和统计网格保持可读。四个 playground 均实际查看了初始 `load-success`、cache `write`、统计网格和通知层。
- 使用同一 Chromium 以 320 × 720 视口逐一查看 React、Vue、Svelte、Web Components 截图：筛选、表格、异步按钮组和通知层均可读，按钮没有被裁切，页面级内容按纵向流动；Web Components 的移动卡片布局也保持可读。
- 手工操作 TagInput：输入标签、清空输入后按 Backspace 删除最后一个标签；删除后输入框仍保持焦点，标签和边界状态没有跳动或裁切。
- 自动化补充：请求 telemetry 的隐私默认值、重试/缓存命中/竞态取消、统计重置、TagInput 键盘行为、四框架 telemetry E2E 和完整 release gate 均通过；视觉组件像素未发生变化，因此不提升既有 golden。
- 结果：0.0.25 新增数据观测与输入交互完成发布前视觉收口；真实外部 `web/` 宿主仍未进入工作区，Users、Channels、Usage Logs 不宣称已迁移。

### 0.0.24 发布前人工复核（2026-09-09）

- 使用 Codex In-app Browser 实际检查 Markdown Editor、Markdown Viewer 和 Rich Text Editor；空内容、只读、错误文案、编辑后预览更新均保持卡片内布局稳定，Rich Text 预览不会执行脚本或 `onclick`。
- 在 Obsidian dark、Rounded light、Glass dark、Atmospheric light 下逐项查看三类编辑器的表面、边框、文字、焦点和预览层级；日夜切换后编辑区域和只读内容均可读，未发现主题 token 缺失。
- 在 320px 窄屏查看编辑器文本区、预览区、错误提示和代码区，确认页面无横向溢出；代码区保留局部滚动，编辑器卡片不会裁切预览。
- 同步人工查看 Popover/Dropdown 的真实触发器、ARIA 状态、Escape 关闭和焦点回到内部按钮；新增业务卡片与旧组件目录均可见。
- 自动化补充：129/129 catalog、9 套主题 × light/dark、axe、编辑器安全、Popover 键盘、320px、性能预算与视觉重复渲染门禁通过；固定 runner golden 仍保持 432/432 × 2 profile 合同。
- 结果：0.0.24 的新增组件和交互质量完成发布前视觉收口；真实外部 `web/` 宿主仍未进入工作区，Users、Channels、Usage Logs 不宣称已迁移。

### 0.0.24 固定 runner golden 收口（run 34317083582）

- Windows Chromium 与 Ubuntu Chromium 均生成了本次 commit 的完整 432 张矩阵 artifact；人工抽查 DataGrid、SchemaForm、FormWizard、PermissionMatrix、Area/Pie/Gauge 和三种视口下的代表截图，确认内容、主题 token、图形和组件内部布局正确。
- 对照既有 profile-specific golden 后确认差异是确定性的元素边界/高度变化（含 1px 截取边界），不是随机渲染漂移；按 `VISUAL_MATRIX_PROMOTE=1` 和完整 manifest 提升 Windows 378 张、Ubuntu 342 张，分别保留 54/90 张像素一致文件。
- 提升后以同一 artifact 逐张复核 Windows 432/432、Ubuntu 432/432，均为 0 diff；pixelmatch threshold 0.1 与 `maxDifferentPixels=0` 合同保持不变。


### 0.0.23 发布前人工复核（2026-09-09）

- 使用 React、Vue、Svelte 和 Web Components playground 实际查看异步资源区；缓存观测面板的事件文案、统计数字、刷新缓存和清空缓存操作均可见。
- 在桌面与 320px 窄屏复核面板换行，确认长统计文案不会产生页面级横向溢出；切换 light/dark 与代表性主题后 surface、边框、文字和按钮焦点保持可读。
- 自动化补充：四框架 E2E 通过 `miss/write → hit → bypass/write → invalidate` 顺序断言，新增 parity fixture 单元测试通过；本轮没有变更组件像素 golden。
- 结果：缓存观测已从 API 文档进入真实四框架示例；真实外部 `web/` 宿主仍未进入工作区，Users、Channels、Usage Logs 不宣称已迁移。


### 0.0.22 发布前人工复核（2026-09-09）

- 使用 Codex In-app Browser 查看 docs-site 的 Obsidian dark、Rounded light、Glass dark 和 Chinese light 截面；确认版本标识已更新为 `0.0.22`，侧栏、主题选择器、组件目录、代码区和状态栏层级清晰。
- 切换 light/dark 与主题后，表单、DataGrid、Business 图表、权限矩阵和异步状态卡片的 surface、边框、文字对比度、圆角和焦点状态均保持可读；未发现页面级横向溢出或内容裁切。
- 自动化补充：`release:check` 完成 16 条 E2E（1 条按既有条件跳过）、108 条测试、docs smoke、类型检查、打包检查和固定 runner golden contract；当前视觉基线仅更新为已人工复核的固定 runner 产物。
- 结果：版本标识和本轮缓存观测文档没有引入新的视觉回归；真实外部 `web/` 宿主仍未进入工作区，Users、Channels、Usage Logs 不宣称已迁移。

### 0.0.20 发布前人工收口（2026-09-09）

- 重新检查 docs-site、React、Vue、Svelte 和 Web Components 五个实际入口；四个 playground 均显示表格、异步状态控制、Business 图表和通知/分页等关键区域。
- docs-site 确认 9 套主题选择器与 light/dark 控制存在；Heatmap、Funnel Chart、Gantt Chart 的数据、标签、任务条、内部滚动和焦点语义均可见。
- React/Vue/Svelte 确认共享 `AdminDataResource` 的 ready 状态、异步控制按钮、Business AdvancedTable 和图表渲染；Web Components 确认 pagehide 生命周期对应的 async contract、表格和图表仍稳定。
- 结果：未发现新增主题缺失、页面级横向溢出、图表裁切、异步状态不可见或跨框架 parity 视觉差异；本轮不提升既有 pixel golden，继续由固定 runner 视觉矩阵维护基线。

### 0.0.21 后续迁移结构复核（2026-09-09）

- 使用 Codex In-app Browser 查看 docs-site 的桌面 Obsidian dark 截面；侧栏、主题选择器、框架示例代码、无障碍说明和底部状态栏层级清晰，未发现页面级横向溢出或文字裁切。
- 查看 Vue/Svelte 320px playground 截图，确认新的 `AdminShell` 外壳、顶部连接状态、`AdminPage` 标题区、筛选控件、表格和异步操作按钮保持可读；按钮组在窄屏按组件内部布局工作，不产生页面级横向滚动。
- 四个 playground 均改为单一 `AdminShell` 包裹单一 `AdminPage`；Svelte 移除重复 `AdminPageHeader`，避免双标题边框和重复页面职责。
- 自动化补充：React、Vue、Svelte、Web Components 的浏览器测试均检查 `aui-shell` 数量为 1 且包含 1 个 `aui-page`；17 条 E2E 中 16 条通过、1 条按既有条件跳过。
- 结果：未发现 shell/page 嵌套造成的视觉回归；本轮不提升 golden，继续以固定 runner 视觉矩阵作为像素基线。

### 0.0.19 发布前人工收口（2026-09-09）

- 使用 Codex In-app Browser 实际查看 docs-site 桌面视口：默认 Obsidian dark、Glass dark/light、Chinese light/dark，以及 Heatmap、Funnel Chart、Gantt Chart 的业务图表截面。
- 确认主题切换后页面背景、侧栏、卡片、边框、状态色、按钮对比度和标题层级保持一致；中国风的暖色表面与红色强调、毛玻璃的冷色表面与紫色强调均可辨识。
- 确认 Heatmap 单元格色阶、内部横向滚动条、Funnel 比例层级、Gantt 任务条和分组标签均可见，未发现页面级横向溢出或图表卡片裁切。
- 已结合可访问性树确认目录显示 126 个组件、Business Suite 显示 22 个组件，图表卡片暴露 tooltip/event 文案与 Gantt 任务语义；320px、键盘、空数据和事件路径由本次 `release:check` 的 E2E/单测继续作为权威补充。

## 0.0.17 异步状态与 Business parity 复核

- 日期：2026-09-09；入口：docs-site 本地 playground；浏览器：Codex In-app Browser。
- 人工检查 Table/DataGrid/ListView/AdvancedTable/AuditLog 的 loading、empty、error、permission denied、retry 按钮、焦点环与具名插槽契约；默认 token、边框和状态色随主题切换正常。
- 人工检查 Business AdvancedTable 在 React、Vue、Svelte、Web Components playground 的表格宽度、选择控件、窄屏横向滚动和事件反馈；未发现页面级横向溢出或主题覆盖缺口。
- 自动化补充：四套真实浏览器 parity 均通过，Business 行选择 detail 在四个平台均为统一 `keys` 语义；本轮未改动既有 golden，待固定 runner CI 复核后再按规则提升基准。

## 0.0.18 docs-site 异步状态实验台复核

- 日期：2026-09-09；入口：docs-site 本地 playground；浏览器：Codex In-app Browser。
- 人工检查九套主题矩阵、Glass light/dark、Business AdvancedTable 的 loading 与 permission-denied 状态；状态面板、对比度、请求访问按钮和卡片内横向滚动均正常。
- 自动化补充：Table、DataGrid、AdvancedTable、AuditLog 均覆盖 ready/loading/empty/error/permission-denied、retry 和权限恢复。

## 0.0.18 Business Vue/Svelte 直连示例复核

- 日期：2026-09-09；入口：Vue 与 Svelte playground（`127.0.0.1:5185`、`127.0.0.1:5186`）；浏览器：Chrome/Codex Computer Use。
- 人工检查桌面视口：Business AdvancedTable、PermissionMatrix、AuditLog、ExportButton 均已渲染；表格列、边框、状态按钮、分页和通知层级正常，无页面级横向溢出。
- 自动化补充：Vue/Svelte/Web Components playground E2E 通过；PermissionMatrix 的 Operator/Channels、AuditLog 的 `channel.updated` 和 ExportButton 的 EXPORT 文案均可访问。
- 结果：未发现新增 Business 直连示例的 token、布局、注册时机或自定义元素警告问题；既有 9×2 golden 未改变。

## 0.0.18 后续质量收口

- 日期：2026-09-09；入口：Vue 与 Svelte playground；浏览器：Chrome/Codex Computer Use；自动化补充视口：320 × 720。
- 人工检查桌面截面：Vue/Svelte 的 PermissionMatrix、AuditLog、ExportButton 均保持工业深色层级、边框和焦点状态；AuditLog 的工具栏与 LOAD MORE、ExportButton 均可见，通知层不遮挡业务表格。
- 自动化补充：Vue/Svelte 320px E2E 均通过，页面 `scrollWidth <= clientWidth`；宽表只在组件内部保留横向滚动，不产生页面级横向溢出。
- 行为补充：ImportDialog、ExportButton、BulkActionsToolbar、PermissionMatrix、AuditLog 的直接 Custom Element 事件均由单测验证；npm registry 超时会输出包含六个包缺失状态的 summary。
- 结果：本轮仅新增测试、降级保护和发布诊断，没有修改主题 token 或视觉 golden；未发现新增布局回归。

## 0.0.19 Business 图表组件复核

- 日期：2026-09-09；入口：docs-site 本地 playground；浏览器：Chrome/Codex Computer Use；视口：桌面、320 × 720 窄屏。
- 人工检查 Heatmap、Funnel Chart、Gantt Chart 在 Obsidian dark、Rounded light、Glass dark、Atmospheric light 下的 surface、边框、状态色、标签截断和焦点环；日夜切换后组件仍保持可读和稳定布局。
- 人工操作 Heatmap 单元格、Funnel 阶段和 Gantt 任务，确认 tooltip/任务反馈、键盘焦点与事件路径可用；空数据状态显示稳定。
- 自动化补充：catalog 126 卡片、三类组件主题切换、320px 页面无级联横向溢出；Heatmap/Gantt 只保留组件内部横向滚动，Funnel 不产生页面级滚动。
- 结果：未发现硬编码 AUI token、页面级 overflow、焦点不可见或主题覆盖缺口；未更新既有 golden，新增组件视觉证据先由组件级断言和人工复核保留。

## 结果

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| 组件目录完整渲染 | 通过 | 129/129 卡片存在并渲染；分类计数与可见数量一致；逐卡尺寸检查无 0 尺寸 |
| 页面级横向溢出 | 通过 | 桌面与 390px 窄屏均复核 `scrollWidth === clientWidth`；窄屏标题字号已收敛，水平滚动条已消除 |
| 主题覆盖 | 通过 | 9 套主题 × light/dark 共 18 个组合均逐一切换目视；组件数量保持 129 个；新增组件只使用 AUI token |
| 日夜切换 | 通过 | 根节点 `data-aui-mode` 正确在 light/dark 间切换 |
| 分类筛选 | 通过 | Business 筛选准确显示 25 个业务组件，恢复 All 后显示 129 个 |
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
- Bar Chart、Line Chart、Area Chart、Pie Chart、Gauge、Sparkline、Heatmap、Funnel Chart、Gantt Chart、DataGrid、Kanban、Table。
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
- Area/Pie/Gauge/Heatmap/Funnel/Gantt 已完成首次人工验收；下一轮视觉矩阵继续覆盖 9 套主题、日夜模式、320px 窄屏、空数据和图表极值。

## 后续验收规则

每次新增或修改组件必须更新本记录对应矩阵，并至少复核：默认 light/dark、圆角主题、Glass/Atmospheric、窄屏、键盘焦点、禁用/加载/空/错误状态。发布前运行 `bun run release:check`，并将新的视觉差异和已知限制写入本文件。

## 0.0.21 后续矩阵复核（run 34302925489）

- Windows Chromium 与 Ubuntu Chromium 在同一提交 `41cf613` 上各生成完整 `432/432` 张 PNG；两次连续 run `34301636829` 与 `34302925489` 的同 profile 产物逐张一致，确认 runner 渲染稳定。
- 当前实现与 `0.0.13` 遗留 golden 的差异集中在 SchemaForm、DataGrid、FormWizard、PermissionMatrix、AreaChart、PieChart、Gauge；代表性截图人工复核确认内容、颜色、主题 token、图形和组件内部布局正确，差异来自异步状态/图表能力落地后的边界与绘制更新，而非随机环境漂移。
- 已建立 `bun run visual:promote` 固定 runner 提升脚本：强制要求 profile、完整 432 文件清单和显式 `VISUAL_MATRIX_PROMOTE=1`，只复制像素不同文件；后续基准更新不再手工绕过 manifest 校验。

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
