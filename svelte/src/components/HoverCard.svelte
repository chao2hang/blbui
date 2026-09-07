<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'

  export let title = ''
  export let side: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
  export let delay = 160
  export let closeDelay = 80
  export let open = false
  export let onOpenChange: ((open: boolean) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const handler = (event: Event) => onOpenChange?.((event as CustomEvent<{ open: boolean }>).detail.open)
    element?.addEventListener('aui-open-change', handler)
    return () => element?.removeEventListener('aui-open-change', handler)
  })
  $: if (element) {
    element.title = title
    element.side = side
    element.delay = delay
    element.closeDelay = closeDelay
    element.open = open
  }
</script>

<aui-hover-card bind:this={element}>
  <span slot="trigger" style="display:contents"><slot name="trigger" /></span>
  <span slot="content" style="display:contents"><slot name="content" /></span>
</aui-hover-card>
