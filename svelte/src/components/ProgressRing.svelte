<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  export let value = 0
  export let max = 100
  export let size = 48
  export let strokeWidth = 4
  export let label = 'Progress'
  export let showValue = true
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => registerAdminElements())
  $: if (element) {
    element.value = value
    element.max = max
    element.size = size
    element.strokeWidth = strokeWidth
    element.label = label
    element.showValue = showValue
  }
</script>

<aui-progress-ring bind:this={element} />
