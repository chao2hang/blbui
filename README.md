# BLBUI

基于 `docs/blbui-plan.md` 的 **Obsidian Industrial Console** 跨框架组件库。

## 当前状态

当前版本为 `0.0.2`，已经提供 78 个已注册的无框架 Web Components，以及 React/Vue/Svelte 适配入口：

| 包                         | 用途                                              |
| -------------------------- | ------------------------------------------------- |
| `@chaos_team/blbui-core`   | Lit 实现的无框架核心、CSS tokens、Custom Elements |
| `@chaos_team/blbui-react`  | React 18/19 类型化绑定                            |
| `@chaos_team/blbui-vue`    | Vue 3 绑定                                        |
| `@chaos_team/blbui-svelte` | Svelte 5 的核心注册和类型入口                     |

## 组件清单

Core（78 个 Web Components，`@chaos_team/blbui-core`）：

- **基础原语**（9）：`Button`、`IconButton`、`Badge`、`StatusTag`、`Avatar`、`Progress`、`Rating`、`Kbd`、`ColorTag`
- **表单控件**（17）：`Input`、`Textarea`、`Select`、`Combobox`、`MultiSelect`、`NumberInput`、`PasswordInput`、`Checkbox`、`Switch`、`RadioGroup`、`Slider`、`TagInput`、`InputGroup`、`Field`、`FileUpload`、`Search`、`ColorPicker`
- **导航**（13）：`Tabs`、`Breadcrumb`、`Nav`、`Pagination`、`Accordion`、`Collapsible`、`Stepper`、`List`、`Tree`、`Timeline`、`Toggle`、`ToggleGroup`、`Segmented`
- **反馈与状态**（9）：`Alert`、`Result`、`EmptyState`、`ErrorState`、`Spinner`、`Skeleton`、`Toast`、`CopyableText`、`Separator`
- **叠加层与弹窗**（7）：`Tooltip`、`Popover`、`Dropdown`、`Command`、`Dialog`、`ConfirmDialog`、`Drawer`
- **数据展示**（11）：`Table`、`DataList`、`DataGrid`、`Calendar`、`CalendarGrid`、`DateRange`、`ChartContainer`、`JSONViewer`、`LogViewer`、`Kanban`、`CodeBlock`
- **布局与表面**（12）：`Card`、`Container`、`Stack`、`Grid`、`Splitter`、`Shell`、`Page`、`PageHeader`、`FilterBar`、`Stat`、`AspectRatio`、`ScrollArea`

Business（9 个，`@chaos_team/blbui-business`）：

- **业务套件**（9）：`CrudPage`、`CrudToolbar`、`AdvancedTable`、`FormBuilder`、`ApprovalTimeline`、`MetricCard`、`MetricGrid`、`BarChart`、`Sparkline`

React / Vue 提供全部 78 个 Core 组件的 1:1 绑定（`Admin*` 命名）；Svelte 提供核心注册入口与 7 个常用组件封装。

## 设计原则

- 画布 `#0a0a0a`，容器 `#0f0f0f`，表头 `#18181b`。
- 1px 锐利边框，默认零圆角，不使用厚重阴影或玻璃拟态。
- UI 使用 Space Grotesk，数据/路径/时间/状态使用 JetBrains Mono。
- 所有颜色状态同时保留文本语义，不依赖颜色作为唯一信息。
- 组件提供 loading、empty、error、disabled、focus 等稳定状态。
- `prefers-reduced-motion` 下关闭装饰性动画。
- Core 使用 Lit Shadow DOM 隔离组件内部样式，同时通过 CSS variables 和 slots 允许宿主应用定制主题与内容；不会给业务页面施加全局 `* { !important }` 覆盖。

## Core 使用

```ts
import { registerAdminElements } from "@chaos_team/blbui-core/register";
import "@chaos_team/blbui-core/styles.css";

registerAdminElements();
```

```html
<div class="aui-root">
  <aui-page title="Channels" description="Manage upstream channels.">
    <span slot="actions">
      <aui-button variant="primary">Deploy New</aui-button>
    </span>

    <aui-filter-bar>
      <aui-input placeholder="Search channels"></aui-input>
    </aui-filter-bar>

    <aui-table>
      <table>
        <thead>
          <tr>
            <th>NAME</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>OPENAI</td>
            <td><aui-status-tag status="success">ONLINE</aui-status-tag></td>
          </tr>
        </tbody>
      </table>
    </aui-table>
  </aui-page>
</div>
```

## React 使用

```tsx
import { AdminButton, AdminInput, AdminPage, AdminStatusTag } from "@chaos_team/blbui-react";

export function ChannelsPage() {
  return (
    <AdminPage title="Channels" description="Manage upstream channels.">
      <AdminButton variant="primary">Deploy New</AdminButton>
      <AdminInput placeholder="Search channels" onValueChange={setSearch} />
      <AdminStatusTag status="success">ONLINE</AdminStatusTag>
    </AdminPage>
  );
}
```

## Vue 使用

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AdminButton, AdminInput, AdminPage } from "@chaos_team/blbui-vue";

const search = ref("");
</script>

<template>
  <AdminPage title="Channels" description="Manage upstream channels.">
    <AdminButton variant="primary">Deploy New</AdminButton>
    <AdminInput v-model:value="search" placeholder="Search channels" />
  </AdminPage>
</template>
```

## Svelte 使用

Svelte 直接使用 Custom Elements；在应用入口调用 `registerAdminElements()`，并导入样式：

```svelte
<script lang="ts">
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import '@chaos_team/blbui-core/styles.css'

  registerAdminElements()
  let page = 1
</script>

<div class="aui-root">
  <aui-page title="Channels" description="Manage upstream channels.">
    <aui-button variant="primary">Deploy New</aui-button>
    <aui-pagination total-pages={4} {page} on:aui-page-change={(event) => page = event.detail.page} />
  </aui-page>
</div>
```

## 事件约定

Core 事件使用 `aui-*` 前缀并通过 `CustomEvent.detail` 传递结构化数据：

| 事件                        | detail                          |
| --------------------------- | ------------------------------- |
| `aui-input`                 | `{ value: string }`             |
| `aui-change`                | `{ value: string }` / `{ values: string[] }` |
| `aui-number-change`         | `{ value: number }`             |
| `aui-checked-change`        | `{ checked: boolean }`          |
| `aui-radio-change`          | `{ value: string }`             |
| `aui-slider-change`         | `{ value: number }`             |
| `aui-range-change`          | `{ start: string; end: string }` |
| `aui-rating-change`         | `{ value: number }`             |
| `aui-segment-change`        | `{ value: string }`             |
| `aui-search`                | `{ value: string }`             |
| `aui-tags-change`           | `{ values: string[] }`          |
| `aui-files-change`          | `{ files: File[] }`             |
| `aui-color-change`          | `{ value: string }`             |
| `aui-copy`                  | `{ text: string }`              |
| `aui-page-change`           | `{ page: number }`              |
| `aui-tab-change`            | `{ id: string }`                |
| `aui-nav-change`            | `{ id: string }`                |
| `aui-menu-select`           | `{ id: string }`                |
| `aui-command`               | `{ id: string; item }`          |
| `aui-list-change`           | `{ id: string }`                |
| `aui-tree-change`           | `{ id: string }`                |
| `aui-kanban-change`         | `{ itemId: string; columnId: string }` |
| `aui-toggle-change`         | `{ pressed: boolean }`          |
| `aui-toggle-group-change`   | `{ value: string; values?: string[] }` |
| `aui-date-change`           | `{ value: string }`             |
| `aui-splitter-change`       | `{ percent: number }`           |
| `aui-open-change`           | `{ open: boolean }`             |
| `aui-close` / `aui-cancel` / `aui-confirm` | `{ open: boolean }`   |
| `aui-press`                 | `{ label: string }`             |

绑定层映射规则：

- **React**：输入类（`Input`/`Select`/`Textarea`）为 `onValueChange`，勾选类为 `onCheckedChange`，其余按语义命名（`onChange`、`onPageChange`、`onTabChange`、`onNavigate`、`onOpenChange`、`onSelect`、`onToggle`、`onSplit`、`onCopy`、`onColorChange`、`onFilesChange`、`onSearch` 等）。
- **Vue**：值类双发 `update:value` + `value-change`（支持 `v-model:value`）；开关类双发 `update:open` + `open-change`；其余事件为 kebab-case（`@page-change`、`@tab-change`、`@navigate`、`@copy` 等）。

## 组件矩阵与业务扩展

完整的 Core / Business 分层、参考 `chaos-ui` 的组件矩阵和后续 ERP/CRM/图表/CRUD 组件路线见：

- `docs/roadmap.md`
- `docs/architecture.md`

## 迁移策略

1. 新页面优先使用 `@chaos_team/blbui-react`，不再新增 `bg-[#0a0a0a]`、`border-zinc-800` 等散落样式。
2. 现有 React 页面先迁移 Button、StatusTag、Page、FilterBar、Table、Pagination。
3. 保留 `web/src/components/ui` 作为现有业务兼容层，不在本阶段一次性删除。
4. Vue/Svelte 应用接入时只安装对应 bindings 和 core，不需要 React runtime。

## 校验

```bash
bun run typecheck       # 6 个包的 TypeScript 检查
bun run test            # Vitest 单元/行为测试
bun run check:svelte    # Svelte 组件语法 + dist/src 同步校验
bun run catalog:check   # 目录完整性 + 文档示例导入校验
bun run docs:check      # 文档站 tsc + vite build 冒烟
bun run format:check    # oxfmt 格式检查
bun run pack:check      # 构建全部包并 npm pack --dry-run
bun run release:check   # 上述关键项的发布前组合
```

## 许可证

AGPL-3.0-or-later。每个发布包内置 `dist/LICENSE` 副本，仓库根目录的 `LICENSE` 为权威文本。
