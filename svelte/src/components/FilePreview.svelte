<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminUploadItem } from '@chaos_team/blbui-core'

  export let file: AdminUploadItem | null = null
  export let open = false
  export let title = ''
  export let closeLabel = 'Close preview'
  export let downloadLabel = 'Download'
  export let downloadable = true
  export let onClose: ((file: AdminUploadItem | null) => void) | undefined = undefined
  export let onDownload: ((file: AdminUploadItem) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const onCloseEvent = (event: Event) =>
      onClose?.((event as CustomEvent<{ file: AdminUploadItem | null }>).detail.file)
    const onDownloadEvent = (event: Event) =>
      onDownload?.((event as CustomEvent<{ file: AdminUploadItem }>).detail.file)
    element?.addEventListener('aui-file-preview-close', onCloseEvent)
    element?.addEventListener('aui-file-download', onDownloadEvent)
    return () => {
      element?.removeEventListener('aui-file-preview-close', onCloseEvent)
      element?.removeEventListener('aui-file-download', onDownloadEvent)
    }
  })
  $: if (element) {
    element.file = file
    element.open = open
    element.title = title
    element.closeLabel = closeLabel
    element.downloadLabel = downloadLabel
    element.downloadable = downloadable
  }
</script>

<aui-file-preview bind:this={element}></aui-file-preview>
