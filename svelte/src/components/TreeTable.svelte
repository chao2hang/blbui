<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminDataGridColumn, AdminTreeTableNode } from '@chaos_team/blbui-core'

  export let columns: AdminDataGridColumn[] = []
  export let nodes: AdminTreeTableNode[] = []
  export let expanded: Array<string | number> = []
  export let selected: string | number | null = null
  export let selectable = false
  export let emptyLabel = 'NO NODES AVAILABLE'
  export let onToggle: ((detail: unknown) => void) | undefined = undefined
  export let onSelect: ((detail: unknown) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const toggle = (event: Event) => onToggle?.((event as CustomEvent).detail)
    const select = (event: Event) => onSelect?.((event as CustomEvent).detail)
    element?.addEventListener('aui-tree-table-toggle', toggle)
    element?.addEventListener('aui-tree-table-select', select)
    return () => {
      element?.removeEventListener('aui-tree-table-toggle', toggle)
      element?.removeEventListener('aui-tree-table-select', select)
    }
  })
  $: if (element) {
    element.columns = columns
    element.nodes = nodes
    element.expanded = expanded
    element.selected = selected
    element.selectable = selectable
    element.emptyLabel = emptyLabel
  }
</script>

<aui-tree-table bind:this={element}></aui-tree-table>
