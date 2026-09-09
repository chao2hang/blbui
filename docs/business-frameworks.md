# Business 组件的 Vue / Svelte 用法

`@chaos_team/blbui-business` 保持 framework-neutral，不强制把 Vue 或 Svelte
runtime 带进 Business 包。Vue 3 和 Svelte 5 宿主直接注册 Business Custom
Elements，并把数组、对象和文件数据通过 DOM property 传入；这样可以和
`AdminDataResource`、Core 组件以及 SSR 注册流程共用同一份契约。

## 真实资源与生命周期 parity

四套 playground 共用 `examples/parity/data-resource.ts` 中的真实
`AdminDataResource` fixture。它统一演示 ready/loading、503 可重试错误、403
permission-denied、`aui-retry` 恢复，以及卸载时取消订阅和 `dispose()`。
这意味着框架差异只存在于生命周期接入方式：React 使用 effect cleanup，
Vue 使用 `onBeforeUnmount`，Svelte 返回 `onMount` cleanup，原生 Web
Components 在 `pagehide` 中清理。新增 Business 组件或宿主场景时，应优先
复用这份 fixture，避免各框架重新实现一套异步状态语义。

## Vue 3

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { registerAdminElements } from '@chaos_team/blbui-core/register'
import { registerBusinessElements } from '@chaos_team/blbui-business/register'
import '@chaos_team/blbui-core/styles.css'
import '@chaos_team/blbui-business/styles.css'

registerAdminElements()
registerBusinessElements()

const columns = [{ key: 'name', label: 'SERVICE', sortable: true }]
const rows = ref([{ id: 'gateway', name: 'Gateway' }])
const steps = [{ id: 'account', title: 'Account' }, { id: 'review', title: 'Review' }]
const roles = [{ id: 'operator', label: 'Operator' }]
const resources = [{ id: 'channels', label: 'Channels' }]
const permissions = ref({ operator: { channels: 'read' } })
const auditEntries = ref([{ id: 'evt-1', actor: 'operator', action: 'channel.updated', time: '09:42' }])

const table = ref<HTMLElement | null>(null)
const permissionMatrix = ref<HTMLElement | null>(null)
const unsubscribe = () => undefined
onMounted(() => {
  // Use the same resource subscription pattern as Core DataGrid.
  // The host owns the transport and assigns snapshot.rows to `rows`.
})
onBeforeUnmount(() => unsubscribe())
</script>

<template>
  <aui-advanced-table
    ref="table"
    :columns.prop="columns"
    :rows.prop="rows"
    selectable
    retryable
    @aui-selection-change="handleSelection"
  />

  <aui-form-wizard :steps.prop="steps" @aui-wizard-complete="finish" />
  <aui-permission-matrix
    ref="permissionMatrix"
    :roles.prop="roles"
    :resources.prop="resources"
    :permissions.prop="permissions"
    @aui-permission-change="savePermission"
  />
  <aui-audit-log
    :entries.prop="auditEntries"
    has-more
    @aui-audit-load-more="loadMore"
  />
  <aui-export-button :data.prop="rows" format="csv" filename="channels" />
</template>
```

For Vue, `.prop` is intentional: `:rows="rows"` would create an HTML
attribute and lose object identity. Business elements emit composed `aui-*`
events, so they can be handled with ordinary Vue event listeners. If a page
needs a Vue-native wrapper, keep it in the host application so the optional
Business dependency does not leak into `@chaos_team/blbui-vue`.

## Svelte 5

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import { registerBusinessElements } from '@chaos_team/blbui-business/register'
  import '@chaos_team/blbui-core/styles.css'
  import '@chaos_team/blbui-business/styles.css'

  registerAdminElements()
  registerBusinessElements()

  let table: HTMLElement & Record<string, unknown>
  let rows = [{ id: 'gateway', name: 'Gateway' }]
  const columns = [{ key: 'name', label: 'SERVICE', sortable: true }]
  const steps = [{ id: 'account', title: 'Account' }, { id: 'review', title: 'Review' }]
  const roles = [{ id: 'operator', label: 'Operator' }]
  const resources = [{ id: 'channels', label: 'Channels' }]
  const permissions = { operator: { channels: 'read' } }
  const auditEntries = [{ id: 'evt-1', actor: 'operator', action: 'channel.updated', time: '09:42' }]

  onMount(() => {
    table.columns = columns
    table.rows = rows
    return () => undefined
  })
</script>

<aui-advanced-table
  bind:this={table}
  selectable
  retryable
  on:aui-selection-change={handleSelection}
></aui-advanced-table>

<aui-form-wizard {steps} on:aui-wizard-complete={finish}></aui-form-wizard>
<aui-permission-matrix
  {roles}
  {resources}
  {permissions}
  on:aui-permission-change={savePermission}
></aui-permission-matrix>
<aui-audit-log
  {auditEntries}
  has-more
  on:aui-audit-load-more={loadMore}
></aui-audit-log>
<aui-export-button data={rows} format="csv" filename="channels"></aui-export-button>
```

Svelte wrappers in `@chaos_team/blbui-svelte/components` cover the frequently
used Core layer. Business elements remain direct Custom Elements on purpose;
`bind:this` plus property assignment is the stable path for arrays and objects.
`on:aui-*` listeners are automatically removed with the Svelte component; if
the host registers manual listeners, return their cleanup function from
`onMount`.

## Business element inventory

The direct Vue/Svelte examples and the catalog are checked together for every
registered Business element:

- CRUD: `aui-crud-page`, `aui-crud-toolbar`, `aui-advanced-table`
- Forms and workflow: `aui-form-builder`, `aui-form-wizard`,
  `aui-approval-timeline`
- Analytics: `aui-metric-card`, `aui-metric-grid`, `aui-bar-chart`,
  `aui-line-chart`, `aui-area-chart`, `aui-pie-chart`, `aui-gauge`,
  `aui-sparkline`, `aui-heatmap`, `aui-funnel-chart`, `aui-gantt-chart`
- Enterprise and operations: `aui-permission-matrix`, `aui-audit-log`,
  `aui-import-dialog`, `aui-export-button`, `aui-bulk-actions-toolbar`

The release gate runs `bun run business:examples:check` and the playground E2E
starts real Vue, Svelte and Web Component hosts, so these snippets cannot drift
back to unregistered `Admin*` tags.
