<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminSchemaFormField, AdminSchemaFormValue } from '@chaos_team/blbui-core'

  export let fields: AdminSchemaFormField[] = []
  export let values: Record<string, AdminSchemaFormValue> = {}
  export let layout: 'vertical' | 'horizontal' = 'vertical'
  export let loading = false
  export let submitLabel = 'SUBMIT'
  export let resetLabel = 'RESET'
  export let onChange: ((detail: { name: string; value: AdminSchemaFormValue; values: Record<string, AdminSchemaFormValue> }) => void) | undefined = undefined
  export let onSubmit: ((detail: { valid: boolean; values: Record<string, AdminSchemaFormValue> }) => void) | undefined = undefined
  export let onReset: ((values: Record<string, AdminSchemaFormValue>) => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const change = (event: Event) => onChange?.((event as CustomEvent).detail)
    const submit = (event: Event) => onSubmit?.((event as CustomEvent).detail)
    const reset = (event: Event) => onReset?.((event as CustomEvent<{ values: Record<string, AdminSchemaFormValue> }>).detail.values)
    element?.addEventListener('aui-change', change)
    element?.addEventListener('aui-submit', submit)
    element?.addEventListener('aui-reset', reset)
    return () => {
      element?.removeEventListener('aui-change', change)
      element?.removeEventListener('aui-submit', submit)
      element?.removeEventListener('aui-reset', reset)
    }
  })
  $: if (element) {
    element.fields = fields
    element.values = values
    element.layout = layout
    element.loading = loading
    element.submitLabel = submitLabel
    element.resetLabel = resetLabel
  }
</script>

<aui-schema-form bind:this={element}></aui-schema-form>
