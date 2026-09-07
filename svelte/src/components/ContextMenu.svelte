<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminMenuEntry } from '@chaos_team/blbui-core'

  export let items: AdminMenuEntry[] = []
  export let open = false
  export let x = 0
  export let y = 0
  export let label = 'Context menu'
  export let onSelect: ((id: string, item: AdminMenuEntry) => void) | undefined = undefined
  export let onOpenChange: ((open: boolean) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const onMenuSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; item: AdminMenuEntry }>).detail
      onSelect?.(detail.id, detail.item)
    }
    const onOpen = (event: Event) => onOpenChange?.((event as CustomEvent<{ open: boolean }>).detail.open)
    element?.addEventListener('aui-menu-select', onMenuSelect)
    element?.addEventListener('aui-open-change', onOpen)
    return () => {
      element?.removeEventListener('aui-menu-select', onMenuSelect)
      element?.removeEventListener('aui-open-change', onOpen)
    }
  })
  $: if (element) {
    element.items = items
    element.open = open
    element.x = x
    element.y = y
    element.label = label
  }
</script>

<aui-context-menu bind:this={element}><slot /></aui-context-menu>
