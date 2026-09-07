<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminDataGridBatchAction, AdminDataGridColumn, AdminDataGridSortDirection } from '@chaos_team/blbui-core'

  export let columns: AdminDataGridColumn[] = []
  export let rows: Array<Record<string, unknown> & { id?: string | number }> = []
  export let loading = false
  export let error = false
  export let selectable = false
  export let mobileCards = true
  export let virtual = false
  export let serverSide = false
  export let sortKey = ''
  export let sortDirection: AdminDataGridSortDirection = 'asc'
  export let selectedKeys: Array<string | number> = []
  export let filters: Record<string, string> = {}
  export let batchActions: AdminDataGridBatchAction[] = []
  export let page = 1
  export let pageSize = 10
  export let total = 0
  export let rowKey = 'id'
  export let onSortChange: ((detail: { key: string; direction: AdminDataGridSortDirection }) => void) | undefined = undefined
  export let onFilterChange: ((detail: { filters: Record<string, string>; key: string; value: string }) => void) | undefined = undefined
  export let onSelectionChange: ((detail: { keys: Array<string | number> }) => void) | undefined = undefined
  export let onBatchAction: ((detail: unknown) => void) | undefined = undefined
  export let onPageChange: ((detail: { page: number; pageSize: number; total: number }) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const bindings: Array<[string, (event: Event) => void | undefined]> = [
      ['aui-sort-change', event => onSortChange?.((event as CustomEvent).detail)],
      ['aui-filter-change', event => onFilterChange?.((event as CustomEvent).detail)],
      ['aui-selection-change', event => onSelectionChange?.((event as CustomEvent).detail)],
      ['aui-batch-action', event => onBatchAction?.((event as CustomEvent).detail)],
      ['aui-page-change', event => onPageChange?.((event as CustomEvent).detail)],
    ]
    bindings.forEach(([name, handler]) => element?.addEventListener(name, handler as EventListener))
    return () => bindings.forEach(([name, handler]) => element?.removeEventListener(name, handler as EventListener))
  })
  $: if (element) {
    element.columns = columns
    element.rows = rows
    element.loading = loading
    element.error = error
    element.selectable = selectable
    element.mobileCards = mobileCards
    element.virtual = virtual
    element.serverSide = serverSide
    element.sortKey = sortKey
    element.sortDirection = sortDirection
    element.selectedKeys = selectedKeys
    element.filters = filters
    element.batchActions = batchActions
    element.page = page
    element.pageSize = pageSize
    element.total = total
    element.rowKey = rowKey
  }
</script>

<aui-data-grid bind:this={element} />
