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
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => registerAdminElements())
  $: if (element) {
    element.loading = loading
    element.empty = empty
    element.error = error
    element.loadingLabel = loadingLabel
    element.emptyLabel = emptyLabel
    element.errorLabel = errorLabel
  }
</script>

<aui-table bind:this={element}><slot /></aui-table>
