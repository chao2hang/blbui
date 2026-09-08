<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminFilterField, AdminFilterRule } from '@chaos_team/blbui-core'

  export let fields: AdminFilterField[] = []
  export let filters: AdminFilterRule[] = []
  export let maxRules = 8
  export let maxDepth = 2
  export let addLabel = 'ADD FILTER'
  export let addGroupLabel = 'ADD GROUP'
  export let clearLabel = 'CLEAR'
  export let applyLabel = 'APPLY'
  export let onChange: ((detail: unknown) => void) | undefined = undefined
  export let onSubmit: ((detail: unknown) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const change = (event: Event) => onChange?.((event as CustomEvent).detail)
    const submit = (event: Event) => onSubmit?.((event as CustomEvent).detail)
    element?.addEventListener('aui-filter-builder-change', change)
    element?.addEventListener('aui-filter-builder-submit', submit)
    return () => {
      element?.removeEventListener('aui-filter-builder-change', change)
      element?.removeEventListener('aui-filter-builder-submit', submit)
    }
  })
  $: if (element) {
    element.fields = fields
    element.filters = filters
    element.maxRules = maxRules
    element.maxDepth = maxDepth
    element.addLabel = addLabel
    element.addGroupLabel = addGroupLabel
    element.clearLabel = clearLabel
    element.applyLabel = applyLabel
  }
</script>

<aui-filter-builder bind:this={element}></aui-filter-builder>
