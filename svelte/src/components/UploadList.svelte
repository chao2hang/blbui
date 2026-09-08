<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminUploadItem } from '@chaos_team/blbui-core'

  export let files: AdminUploadItem[] = []
  export let removable = true
  export let retryable = true
  export let previewable = true
  export let compact = false
  export let disabled = false
  export let emptyLabel = 'No files selected'
  export let onRemove: ((id: string, file: AdminUploadItem) => void) | undefined = undefined
  export let onRetry: ((id: string, file: AdminUploadItem) => void) | undefined = undefined
  export let onPreview: ((id: string, file: AdminUploadItem) => void) | undefined = undefined
  export let onChange: ((files: AdminUploadItem[]) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const onRemoveEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; file: AdminUploadItem }>).detail
      onRemove?.(detail.id, detail.file)
    }
    const onRetryEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; file: AdminUploadItem }>).detail
      onRetry?.(detail.id, detail.file)
    }
    const onPreviewEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; file: AdminUploadItem }>).detail
      onPreview?.(detail.id, detail.file)
    }
    const onChangeEvent = (event: Event) =>
      onChange?.((event as CustomEvent<{ files: AdminUploadItem[] }>).detail.files)
    element?.addEventListener('aui-upload-remove', onRemoveEvent)
    element?.addEventListener('aui-upload-retry', onRetryEvent)
    element?.addEventListener('aui-upload-preview', onPreviewEvent)
    element?.addEventListener('aui-upload-change', onChangeEvent)
    return () => {
      element?.removeEventListener('aui-upload-remove', onRemoveEvent)
      element?.removeEventListener('aui-upload-retry', onRetryEvent)
      element?.removeEventListener('aui-upload-preview', onPreviewEvent)
      element?.removeEventListener('aui-upload-change', onChangeEvent)
    }
  })
  $: if (element) {
    element.files = files
    element.removable = removable
    element.retryable = retryable
    element.previewable = previewable
    element.compact = compact
    element.disabled = disabled
    element.emptyLabel = emptyLabel
  }
</script>

<aui-upload-list bind:this={element}></aui-upload-list>
