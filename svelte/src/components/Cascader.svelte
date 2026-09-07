<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminCascaderOption } from '@chaos_team/blbui-core'

  export let options: AdminCascaderOption[] = []
  export let value: string[] = []
  export let placeholder = 'Select an option'
  export let disabled = false
  export let open = false
  export let searchable = false
  export let onChange: ((value: string[], options: AdminCascaderOption[]) => void) | undefined = undefined
  export let onOpenChange: ((open: boolean) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const onValueChange = (event: Event) => {
      const detail = (event as CustomEvent<{ value: string[]; options: AdminCascaderOption[] }>).detail
      onChange?.(detail.value, detail.options)
    }
    const onOpen = (event: Event) => onOpenChange?.((event as CustomEvent<{ open: boolean }>).detail.open)
    element?.addEventListener('aui-cascader-change', onValueChange)
    element?.addEventListener('aui-open-change', onOpen)
    return () => {
      element?.removeEventListener('aui-cascader-change', onValueChange)
      element?.removeEventListener('aui-open-change', onOpen)
    }
  })
  $: if (element) {
    element.options = options
    element.value = value
    element.placeholder = placeholder
    element.disabled = disabled
    element.open = open
    element.searchable = searchable
  }
</script>

<aui-cascader bind:this={element} />
