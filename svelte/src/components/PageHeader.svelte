<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'

  export let title = ''
  export let description = ''
  export let className = ''
  let element: (HTMLElement & Record<string, unknown>) | undefined

  onMount(() => registerAdminElements())

  $: if (element) {
    element.title = title
    element.description = description
  }
</script>

<aui-page-header bind:this={element} class={className}>
  <span slot="actions" style="display:contents"><slot name="actions" /></span>
</aui-page-header>
