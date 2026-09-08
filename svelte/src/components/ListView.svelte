<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminListViewItem } from '@chaos_team/blbui-core'

  export let items: AdminListViewItem[] = []
  export let loading = false
  export let error = false
  export let selectable = true
  export let selectedKeys: Array<string | number> = []
  export let loadingLabel = 'LOADING...'
  export let emptyLabel = 'NO ITEMS AVAILABLE'
  export let errorLabel = 'FAILED TO LOAD ITEMS'
  export let onSelect: ((detail: unknown) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const handler = (event: Event) => onSelect?.((event as CustomEvent).detail)
    element?.addEventListener('aui-list-view-select', handler)
    return () => element?.removeEventListener('aui-list-view-select', handler)
  })
  $: if (element) {
    element.items = items
    element.loading = loading
    element.error = error
    element.selectable = selectable
    element.selectedKeys = selectedKeys
    element.loadingLabel = loadingLabel
    element.emptyLabel = emptyLabel
    element.errorLabel = errorLabel
  }
</script>

<aui-list-view bind:this={element}></aui-list-view>
