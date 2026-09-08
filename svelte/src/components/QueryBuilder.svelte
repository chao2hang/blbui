<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminFilterField, AdminQueryRule } from '@chaos_team/blbui-core'

  export let fields: AdminFilterField[] = []
  export let rules: AdminQueryRule[] = []
  export let logic: 'and' | 'or' = 'and'
  export let applyLabel = 'RUN QUERY'
  export let onChange: ((detail: unknown) => void) | undefined = undefined
  export let onSubmit: ((detail: unknown) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const change = (event: Event) => onChange?.((event as CustomEvent).detail)
    const submit = (event: Event) => onSubmit?.((event as CustomEvent).detail)
    element?.addEventListener('aui-query-change', change)
    element?.addEventListener('aui-query-submit', submit)
    return () => {
      element?.removeEventListener('aui-query-change', change)
      element?.removeEventListener('aui-query-submit', submit)
    }
  })
  $: if (element) {
    element.fields = fields
    element.rules = rules
    element.logic = logic
    element.applyLabel = applyLabel
  }
</script>

<aui-query-builder bind:this={element}></aui-query-builder>
