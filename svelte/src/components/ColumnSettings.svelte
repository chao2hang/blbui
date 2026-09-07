<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminDataGridColumn } from '@chaos_team/blbui-core'
  export let columns: AdminDataGridColumn[] = []
  export let visibleKeys: string[] = []
  export let open = false
  export let title = 'COLUMNS'
  export let onChange: ((detail: { keys: string[]; columns: AdminDataGridColumn[] }) => void) | undefined = undefined
  export let onOpenChange: ((open: boolean) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const change = (event: Event) => onChange?.((event as CustomEvent).detail)
    const openChange = (event: Event) => onOpenChange?.((event as CustomEvent<{ open: boolean }>).detail.open)
    element?.addEventListener('aui-column-settings-change', change)
    element?.addEventListener('aui-open-change', openChange)
    return () => {
      element?.removeEventListener('aui-column-settings-change', change)
      element?.removeEventListener('aui-open-change', openChange)
    }
  })
  $: if (element) {
    element.columns = columns
    element.visibleKeys = visibleKeys
    element.open = open
    element.title = title
  }
</script>

<aui-column-settings bind:this={element} />
