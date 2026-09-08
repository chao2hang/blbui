<!--
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-core/register'
  import type { AdminNotificationItem } from '@chaos_team/blbui-core'

  export let notifications: AdminNotificationItem[] = []
  export let position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right'
  export let max = 5
  export let persistKey = ''
  export let clearLabel = 'CLEAR ALL'
  export let onClose: ((id: string) => void) | undefined = undefined
  export let onAction: ((id: string, item: AdminNotificationItem) => void) | undefined = undefined
  export let onChange: ((notifications: AdminNotificationItem[]) => void) | undefined = undefined

  let element: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    const onNotificationClose = (event: Event) => onClose?.((event as CustomEvent<{ id: string }>).detail.id)
    const onNotificationAction = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; item: AdminNotificationItem }>).detail
      onAction?.(detail.id, detail.item)
    }
    const onNotificationsChange = (event: Event) =>
      onChange?.((event as CustomEvent<{ notifications: AdminNotificationItem[] }>).detail.notifications)
    element?.addEventListener('aui-notification-close', onNotificationClose)
    element?.addEventListener('aui-notification-action', onNotificationAction)
    element?.addEventListener('aui-notifications-change', onNotificationsChange)
    return () => {
      element?.removeEventListener('aui-notification-close', onNotificationClose)
      element?.removeEventListener('aui-notification-action', onNotificationAction)
      element?.removeEventListener('aui-notifications-change', onNotificationsChange)
    }
  })
  $: if (element) {
    element.notifications = notifications
    element.position = position
    element.max = max
    element.persistKey = persistKey
    element.clearLabel = clearLabel
  }
</script>

<aui-notification-center bind:this={element}></aui-notification-center>
