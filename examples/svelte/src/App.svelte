<script lang="ts">
  import { onMount } from 'svelte'
  import fixture from '../../parity/fixture.json'
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import { AdminButton, AdminDialog, AdminInput, AdminPage, AdminPagination, AdminTable, AdminToastManager } from '@chaos_team/blbui-svelte'

  let query = ''
  let open = false
  let page = 1
  let toasts = [{ id: 'parity', title: 'PARITY READY', message: 'Svelte fixture is synchronized.', variant: 'success', duration: 0 }]
  onMount(() => registerAdminElements())
</script>

<svelte:head><title>BLBUI Svelte Playground</title></svelte:head>

<div class="aui-root" style="min-height: 100vh; padding: 32px">
  <AdminPage title="Channels" description="Cross-framework operator playground.">
    <aui-tabs items={fixture.tabs} active="all"></aui-tabs>
    <div style="display: flex; gap: 8px; margin: 20px 0">
      <AdminInput value={query} onValueChange={(value) => (query = value)} placeholder="Search channels" />
      <AdminButton variant="primary" on:click={() => (open = true)}>Create channel</AdminButton>
    </div>
    <AdminTable>
      <table>
        <thead><tr><th>Name</th><th>Status</th><th>Region</th><th>Query</th></tr></thead>
        <tbody>{#each fixture.rows as row}<tr><td>{row.id}</td><td>{row.status}</td><td>{row.region}</td><td>{query || '—'}</td></tr>{/each}</tbody>
      </table>
    </AdminTable>
    <AdminPagination {page} totalPages={3} onPageChange={(next) => (page = next)} />
    <AdminToastManager bind:items={toasts} />
    <AdminDialog bind:open title="Create channel">
      <p>Page {page}: confirm the new channel configuration.</p>
      <AdminButton on:click={() => (open = false)}>Close</AdminButton>
    </AdminDialog>
  </AdminPage>
</div>
