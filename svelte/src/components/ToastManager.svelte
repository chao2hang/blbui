<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminToastItem } from '@chaos_team/blbui-core'

  export let items: AdminToastItem[] = []
  export let position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'
  export let max = 5
  export let persistKey = ''
  export let syncTabs = false
  export let channelName = 'blbui-toasts'
  export let label = 'Notifications'
  export let onChange: ((items: AdminToastItem[]) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined

  onMount(() => {
    registerAdminElements()
    const change = (event: Event) => {
      const next = (event as CustomEvent<{ items: AdminToastItem[] }>).detail.items
      items = next
      onChange?.(next)
    }
    element?.addEventListener('aui-toast-manager-change', change)
    return () => element?.removeEventListener('aui-toast-manager-change', change)
  })

  $: if (element) {
    element.items = items
    element.position = position
    element.max = max
    element.persistKey = persistKey
    element.syncTabs = syncTabs
    element.channelName = channelName
    element.label = label
  }
</script>

<aui-toast-manager bind:this={element}></aui-toast-manager>
