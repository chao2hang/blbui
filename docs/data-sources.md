# Business data source contract

`@chaos_team/blbui-business` includes a small transport-neutral resource for
pages that load table, list or dashboard data. It keeps request state out of
component markup while preserving BLBUI's `loading`, `empty`, `error` and
`permission-denied` vocabulary.

```ts
import {
  AdminDataResource,
  createAdminFetchDataSource,
} from '@chaos_team/blbui-business'

type Service = { id: string; name: string }

const services = new AdminDataResource<Service>({
  loader: createAdminFetchDataSource<Service>({
    endpoint: ({ page, pageSize }) =>
      `/api/services?page=${page ?? 1}&pageSize=${pageSize ?? 25}`,
  }),
})

const unsubscribe = services.subscribe((snapshot) => {
  dataGrid.loading = snapshot.status === 'loading'
  dataGrid.empty = snapshot.status === 'empty'
  dataGrid.error = snapshot.status === 'error'
  dataGrid.permissionDenied = snapshot.status === 'permission-denied'
  dataGrid.rows = snapshot.rows
})

await services.load({ page: 1, pageSize: 25 })
await services.retry() // reuses the last request
unsubscribe()
services.dispose()
```

Starting a new load aborts the previous request, and stale responses cannot
overwrite the newest snapshot. HTTP `401` and `403` become non-retryable
`permission-denied`; transient `408`, `425`, `429` and `5xx` responses are
retryable by default. Custom loaders can throw `AdminDataError` to provide an
explicit status, code or retry policy.

The resource is framework-neutral. React can subscribe with
`useSyncExternalStore`, Vue with `onMounted`/`onBeforeUnmount`, Svelte with
`onMount`, and Web Components can update properties from the subscription.
The component layer remains responsible for rendering the state and emitting
`aui-retry`.

## Vue 3 direct usage

The Vue binding can consume the same resource without a framework-specific
adapter. Keep the resource outside the template and map its snapshot to the
controlled component props:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { AdminDataGrid } from '@chaos_team/blbui-vue'
import { AdminDataResource, createAdminFetchDataSource } from '@chaos_team/blbui-business'

type Service = { id: string; name: string }
const rows = ref<Service[]>([])
const state = ref('idle')
const resource = new AdminDataResource<Service>({
  loader: createAdminFetchDataSource({ endpoint: '/api/services' }),
})
let unsubscribe = () => undefined

onMounted(() => {
  unsubscribe = resource.subscribe((snapshot) => {
    rows.value = snapshot.rows
    state.value = snapshot.status
  })
  void resource.load({ page: 1, pageSize: 25 })
})
onBeforeUnmount(() => {
  unsubscribe()
  resource.dispose()
})
</script>

<template>
  <AdminDataGrid
    :rows="rows"
    :loading="state === 'loading'"
    :error="state === 'error'"
    :permission-denied="state === 'permission-denied'"
    @retry="resource.retry()"
  />
</template>
```

## Svelte 5 direct usage

Svelte uses the same subscription lifecycle. The resource stays transport
neutral and the component receives ordinary reactive values:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import { AdminDataResource, createAdminFetchDataSource } from '@chaos_team/blbui-business'

  type Service = { id: string; name: string }
  let rows: Service[] = []
  let state = 'idle'
  const resource = new AdminDataResource<Service>({
    loader: createAdminFetchDataSource({ endpoint: '/api/services' }),
  })

  onMount(() => {
    registerAdminElements()
    const unsubscribe = resource.subscribe((snapshot) => {
      rows = snapshot.rows
      state = snapshot.status
    })
    void resource.load({ page: 1, pageSize: 25 })
    return () => {
      unsubscribe()
      resource.dispose()
    }
  })
</script>

<aui-data-grid
  {rows}
  loading={state === 'loading'}
  error={state === 'error'}
  permission-denied={state === 'permission-denied'}
  on:aui-retry={() => resource.retry()}
></aui-data-grid>
```
