# 外部宿主迁移示例

BLBUI 的运行时核心是 Custom Elements。迁移时先在应用入口注册元素和样式，再在组件卸载时让框架绑定层清理事件监听；业务页面不需要引入另一套 UI runtime。

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

## Date/Time picker 迁移

`aui-date-picker` 与 `aui-time-picker` 默认保持原生控件兼容；需要让弹出面板完全跟随 BLBUI 主题时，设置 `picker="custom"`。自定义面板支持 `min` / `max` / `step`，并通过原有 `aui-date-change`、`aui-time-change`、`aui-change` 事件返回值，另外用 `aui-open-change` 反馈面板状态。外部宿主应在 light/dark、圆角和 Glass 主题下检查边界日期、禁用项、Escape 关闭和 320px 宽度。
