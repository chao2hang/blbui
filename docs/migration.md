# 外部宿主迁移示例

BLBUI 的运行时核心是 Custom Elements。迁移时先在应用入口注册元素和样式，再在组件卸载时让框架绑定层清理事件监听；业务页面不需要引入另一套 UI runtime。

## Canonical Web Components 宿主

仓库内 [`examples/web`](../examples/web) 是可运行的迁移宿主，不依赖外部业务仓库。它用同一套 Shell、Page、FilterBar、DataGrid、Pagination、LogViewer、StatusTag 和语义 tokens 演示四个页面：Operations、Users、Channels、Usage Logs。

Users、Channels 和 Usage Logs 都覆盖 `ready`、`loading`、`empty`、`error`、`permission-denied` 和 retry 状态，并验证筛选、选中行、分页以及 320px 下的移动导航。宿主 header 还提供 9 套主题和 light/dark 切换，适合作为已有 Vite、Astro 或原生 Custom Elements 应用的起始模板。

```bash
cd examples/web
bun run dev
```

页面级布局只保留一个 `aui-shell`。窄屏时 Shell 会隐藏 sidebar，宿主必须提供等价的移动导航；canonical host 使用 `web-mobile-nav` 保持页面之间可达。

## 原生 Web Components

```ts
import { registerAdminElements, whenAdminElementsDefined } from "@chaos_team/blbui-core/register";
import "@chaos_team/blbui-core/styles.css";

registerAdminElements();
await whenAdminElementsDefined();

const input = document.querySelector("aui-input");
input?.addEventListener("aui-input", (event) => {
    const { value } = (event as CustomEvent<{ value: string }>).detail;
    console.log(value);
});
```

数组和对象通过 property 传递，避免把业务数据序列化成 attribute：

```ts
const area = document.querySelector("aui-area-chart") as HTMLElement & {
    series: Array<{ id: string; label: string; data: Array<{ label: string; value: number | null }> }>;
};
area.series = [
    { id: "capacity", label: "Capacity", data: [{ label: "A", value: 20 }] },
    { id: "reserved", label: "Reserved", data: [{ label: "A", value: 12 }] },
];
```

## React

```tsx
import { AdminInput, AdminAreaChart } from "@chaos_team/blbui-react";
import { AdminAreaChart as BusinessAreaChart } from "@chaos_team/blbui-business-react";

<AdminInput value={query} onValueChange={setQuery} />
<BusinessAreaChart
    series={areaSeries}
    onPoint={(detail) => console.log(detail.seriesId, detail.point)}
/>
```

React 绑定在 effect 中同步 DOM property，并在组件卸载时移除自定义事件监听；不要把 `aui-*` 事件当作普通 React JSX 事件名手动拼接。

## Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AdminInput } from "@chaos_team/blbui-vue";

const query = ref("");
</script>

<AdminInput v-model:value="query" />
<aui-area-chart :series="areaSeries" @aui-chart-point="handlePoint" />
```

Vue 绑定使用 `update:value` + `value-change` 的约定；直接使用 Business Custom Element 时，数组仍通过 `:series` property 传入。

## Svelte

```svelte
<script lang="ts">
    import { registerAdminElements } from "@chaos_team/blbui-svelte";
    import "@chaos_team/blbui-core/styles.css";

    registerAdminElements();
    let query = "";
</script>

<aui-input value={query} on:aui-input={(event) => (query = event.detail.value)} />
<aui-area-chart series={areaSeries} on:aui-chart-point={handlePoint}></aui-area-chart>
```

## 迁移检查表

1. 在应用入口调用 `registerAdminElements()`；SSR 应用在 hydration 前 `await whenAdminElementsDefined()`。
2. 引入 `@chaos_team/blbui-core/styles.css`，再通过 `setAdminTheme(document, theme, mode)` 设置主题。
3. 将数组、对象和文件列表从 attribute 迁移到 DOM property。
4. 将输入类回调统一到 `value-change` / `onValueChange` / `v-model:value`。
5. 将浮层的 `open` 状态作为受控值维护，确认卸载后事件监听和焦点恢复没有残留。
6. 在 320px、light/dark、reduced-motion 和 forced-colors 下复核页面级溢出与可读性。

## 唯一挂载职责

应用级外壳只挂载一次，并负责 sidebar、header 和内容滚动区域；页面级组件只负责
标题、描述、操作区和页面内容。推荐保持下面的单向层级，不要在 `AdminPage` 内再
嵌套 `AdminShell`，也不要在 `AdminPage` 内重复放置同一组 `AdminPageHeader`：

```html
<aui-shell>
  <aside slot="sidebar">Navigation</aside>
  <header slot="header">Global actions</header>
  <aui-page title="Users" description="Manage operators">
    Page content
  </aui-page>
</aui-shell>
```

如果宿主已有 `AdminLayout` 或 `AdminConsoleShell`，将其作为唯一外壳保留，并把
`AdminPage` 放入内容插槽；不要同时挂载两层 header/sidebar。仓库内四套 playground
均按该层级运行，浏览器门禁会检查每个宿主只有一个 `aui-shell` 和一个嵌套的
`aui-page`。

仓库内的 `bun run e2e:check` 还会直接启动 React、Vue、Svelte 和原生 Web
playground，验证查询、Tab、分页、Dialog、DOM property 与事件链路；它与
`examples:check` 的构建检查互补，避免只验证源码存在而漏掉运行时绑定问题。

## Date/Time picker 迁移

`aui-date-picker` 与 `aui-time-picker` 默认保持原生控件兼容；需要让弹出面板完全跟随 BLBUI 主题时，设置 `picker="custom"`。自定义面板支持 `min` / `max` / `step`，并通过原有 `aui-date-change`、`aui-time-change`、`aui-change` 事件返回值，另外用 `aui-open-change` 反馈面板状态。外部宿主应在 light/dark、圆角和 Glass 主题下检查边界日期、禁用项、Escape 关闭和 320px 宽度。
