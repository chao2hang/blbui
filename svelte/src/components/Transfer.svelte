<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminTransferOption } from '@chaos_team/blbui-core'

  export let options: AdminTransferOption[] = []
  export let values: string[] = []
  export let sourceTitle = 'Available'
  export let targetTitle = 'Selected'
  export let searchable = true
  export let disabled = false
  export let onChange: ((values: string[], added: string[], removed: string[]) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ values: string[]; added: string[]; removed: string[] }>).detail
      onChange?.(detail.values, detail.added, detail.removed)
    }
    element?.addEventListener('aui-transfer-change', handler)
    return () => element?.removeEventListener('aui-transfer-change', handler)
  })
  $: if (element) {
    element.options = options
    element.values = values
    element.sourceTitle = sourceTitle
    element.targetTitle = targetTitle
    element.searchable = searchable
    element.disabled = disabled
  }
</script>

<aui-transfer bind:this={element}></aui-transfer>
