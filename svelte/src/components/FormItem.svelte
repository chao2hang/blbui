<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  export let label = ''
  export let description = ''
  export let error = ''
  export let required = false
  export let name = ''
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => registerAdminElements())
  $: if (element) {
    element.label = label
    element.description = description
    element.error = error
    element.required = required
    element.name = name
  }
</script>

<aui-form-item bind:this={element}><slot /></aui-form-item>
