<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'

  export let layout: 'vertical' | 'horizontal' = 'vertical'
  export let loading = false
  export let submitLabel = 'SUBMIT'
  export let resetLabel = 'RESET'
  export let showActions = true
  export let noValidate = false
  export let onSubmit: ((detail: { valid: boolean }) => void) | undefined = undefined
  export let onInvalid: (() => void) | undefined = undefined
  export let onReset: (() => void) | undefined = undefined
  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const submit = (event: Event) => onSubmit?.((event as CustomEvent<{ valid: boolean }>).detail)
    const invalid = () => onInvalid?.()
    const reset = () => onReset?.()
    element?.addEventListener('aui-submit', submit)
    element?.addEventListener('aui-invalid', invalid)
    element?.addEventListener('aui-reset', reset)
    return () => {
      element?.removeEventListener('aui-submit', submit)
      element?.removeEventListener('aui-invalid', invalid)
      element?.removeEventListener('aui-reset', reset)
    }
  })
  $: if (element) {
    element.layout = layout
    element.loading = loading
    element.submitLabel = submitLabel
    element.resetLabel = resetLabel
    element.showActions = showActions
    element.noValidate = noValidate
  }
</script>

<aui-form bind:this={element}>
  <slot />
  <span slot="actions" style="display:contents"><slot name="actions" /></span>
</aui-form>
