<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'

  export let loading = false
  export let empty = false
  export let error = false
  export let loadingLabel = 'Loading...'
  export let emptyLabel = 'No data available.'
  export let errorLabel = 'Failed to load data.'
  export let permissionDenied = false
  export let permissionDeniedLabel = 'You do not have permission to view this data.'
  export let retryable = true
  export let retryLabel = 'Retry'
  export let onRetry: ((detail: { source: string; reason: 'error' | 'permission-denied' }) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => registerAdminElements())
  $: if (element) {
    element.loading = loading
    element.empty = empty
    element.error = error
    element.loadingLabel = loadingLabel
    element.emptyLabel = emptyLabel
    element.errorLabel = errorLabel
    element.permissionDenied = permissionDenied
    element.permissionDeniedLabel = permissionDeniedLabel
    element.retryable = retryable
    element.retryLabel = retryLabel
  }
  onMount(() => {
    const handler = (event: Event) => onRetry?.((event as CustomEvent).detail)
    element?.addEventListener('aui-retry', handler)
    return () => element?.removeEventListener('aui-retry', handler)
  })
</script>

<aui-table bind:this={element}><slot /><span slot="retry"><slot name="retry" /></span><span slot="permission"><slot name="permission" /></span></aui-table>
