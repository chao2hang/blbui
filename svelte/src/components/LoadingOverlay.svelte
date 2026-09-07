<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  export let open = false
  export let label = 'LOADING...'
  export let fullscreen = false
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => registerAdminElements())
  $: if (element) {
    element.open = open
    element.label = label
    element.fullscreen = fullscreen
  }
</script>

<aui-loading-overlay bind:this={element}><slot /></aui-loading-overlay>
