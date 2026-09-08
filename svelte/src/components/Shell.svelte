<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'

  export let sidebarWidth = ''
  export let headerHeight = ''
  export let className = ''
  let element: (HTMLElement & Record<string, unknown>) | undefined

  onMount(() => registerAdminElements())

  $: if (element) {
    element.sidebarWidth = sidebarWidth
    element.headerHeight = headerHeight
  }
</script>

<aui-shell bind:this={element} class={className}>
  <span slot="sidebar" style="display:contents"><slot name="sidebar" /></span>
  <span slot="header" style="display:contents"><slot name="header" /></span>
  <slot />
</aui-shell>
