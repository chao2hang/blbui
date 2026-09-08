# BLBUI 架构与封装准则

## 组件来源与借鉴边界

- **Base UI / Radix**：借鉴原生语义、受控状态、键盘焦点和 ARIA 设计。
- **Shoelace / Lit**：借鉴 Custom Elements、属性/property 分离和框架无关核心。
- **Ant Design / Arco Design**：借鉴后台场景下的表格、分页、筛选器、空/错/加载状态组合。
- **Melt UI / Headless UI**：借鉴“行为与视觉分离”的适配层思路。
- **本项目规范**：覆盖上述系统的默认视觉，工业后台必须遵循黑白层级、零圆角、锐利边框、等宽数据字体和克制动效。

不会复制第三方库的品牌样式、API 或实现代码；只提取成熟的交互契约。

## 属性与事件

- 简单值使用 HTML attribute，同时在框架绑定中写入 DOM property。
- 数组/对象（如 `items`、`options`）必须通过 property 传递，不能序列化到 attribute。
- Core 事件使用 kebab-case `aui-*`。
- React 适配层负责事件监听和 ref，不把自定义事件交给 React 的 JSX 属性自动猜测。
- Vue 适配层负责 `v-model:value` / `v-model:open` 和 kebab-case 事件。
- Svelte 直接消费 Custom Elements，类型声明扩展事件和 property。

## 可访问性

- 按钮、输入、选择器、分页、tabs、dialog 使用原生元素。
- 选中状态同时输出 `aria-selected` 或 `aria-current`。
- 禁用状态使用真实 `disabled`；不可用导航使用 `aria-disabled`。
- Dialog 使用原生 `<dialog>`，支持 ESC 关闭和 backdrop 点击关闭。
- 每个需要传达状态的区域拥有 `role=status` 或 `role=alert`。

## 构建与发布

- 构建顺序固定为 core → react/vue/svelte/business → business-react；`bun run build:packages` 先对 TS 源做 `useDefineForClassFields: false` 预编译（Lit 响应式属性依赖原型访问器，ES2022 class fields 的 `[[Define]]` 语义会在 dist 里覆盖它们），再用 Bun 打包。正式发布按同一依赖关系顺序执行。
- Svelte 包以源码 `.svelte` 发布，`dist/index.js` 与 `dist/components.js` 由构建从 `src/components.ts` barrel 再生成，`check:svelte` 校验 dist/src 导出同步。
- `catalog:check` 校验目录完整性（104 个 Core + 19 个 Business，共 123 个组件）与文档示例中每个 `Admin*` 导入、每个 `aui-*` 标签在对应包里真实存在。

## 主题合同

- `tokens.css` 定义默认语义 token；`themes.css` 只覆盖同一份 token 合同，不改变组件 DOM 或事件。
- 主题通过宿主元素上的 `data-aui-theme` 与 `data-aui-mode` 生效；`setAdminTheme(document, name, mode)` 适合应用级切换。
- 每套主题必须同时验证 light/dark、surface、text、border、focus、status、overlay、radius、shadow 与 native form color-scheme。
- `utilities.css` 使用 `.aui-*` 命名空间，参考 daisyUI 的组合式写法，但不复用其实现或 token 名称。

## 下一阶段

- 已完成 SSR hydration 检查和 React/Vue/Svelte 三框架最小示例应用；注册时机统一通过 `whenAdminElementsDefined`。
- Playwright 已加入 pixelmatch 重复渲染稳定性门禁；`tests/e2e/visual-matrix.json` 固化 Windows/Ubuntu Chromium、代表视口、场景和 9 × 2 主题矩阵，PNG golden 在固定 runner 上按 profile 保存。
- `docs/migration.md` 固化原生 Web Components、React、Vue、Svelte 的注册时机、property 传递、事件清理和 SSR hydration 迁移示例；`tests/e2e/visual-golden.json` 固化同 profile PNG 命名与 pixelmatch 比较策略。
- DataGrid 的可选 TanStack Table / Virtual adapter，以及 TreeTable、ListView、FilterBuilder、QueryBuilder 等复杂交互已提供第一版无依赖实现；Business adapter contract 通过纯单元测试保护分页、排序、选择和虚拟窗口语义。
- 业务包中的权限矩阵、审计日志、workflow、导入导出和可选数据适配器已落地；公共 API 文档生成与一致性检查纳入发布门禁。
