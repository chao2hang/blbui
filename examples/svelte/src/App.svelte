<script lang="ts">
  import { onMount } from 'svelte'
  import fixture from '../../parity/fixture.json'
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import { registerBusinessElements } from '@chaos_team/blbui-business/register'
  import { AdminButton, AdminDialog, AdminInput, AdminPage, AdminPageHeader, AdminPagination, AdminShell, AdminStatusTag, AdminTable, AdminToastManager } from '@chaos_team/blbui-svelte'

  const contract = fixture.parityContract.assertions
  let query = contract.initialQuery
  let open = contract.initialDialog
  let page = contract.initialPage
  let asyncState: 'ready' | 'error' | 'permission-denied' = 'ready'
  let retryCount = 0
  let activeTab = fixture.tabs[0].id
  $: normalizedQuery = query.trim().toLowerCase()
  $: visibleRows = fixture.rows.filter((row) => {
    const matchesTab = activeTab === 'all' || row.status === 'ONLINE'
    const matchesQuery = !normalizedQuery || [row.id, row.status, row.region].some((value) => value.toLowerCase().includes(normalizedQuery))
    return matchesTab && matchesQuery
  })
  let toasts = [{ id: 'parity', title: 'PARITY READY', message: 'Svelte fixture is synchronized.', variant: 'success', duration: 0 }]
  let businessTable: (HTMLElement & Record<string, unknown>) | undefined
  let businessSelection = 0
  onMount(() => {
    registerAdminElements()
    registerBusinessElements()
    if (businessTable) {
      businessTable.columns = fixture.business.columns
      businessTable.rows = fixture.business.rows
      businessTable.selectable = true
      businessTable.addEventListener('aui-selection-change', (event) => (businessSelection = (event as CustomEvent<{ keys: unknown[] }>).detail.keys.length))
    }
  })
</script>

<svelte:head><title>BLBUI Svelte Playground</title></svelte:head>

<div class="aui-root" style="min-height: 100vh" data-parity-query={query} data-parity-page={page} data-parity-dialog={String(open)} data-parity-active-tab={activeTab} data-parity-async-state={asyncState} data-parity-retry-count={retryCount}>
  <AdminShell sidebarWidth="168px" headerHeight="48px">
    <div slot="sidebar" style="padding: 16px; font: 700 12px var(--aui-font-mono)">BLBUI</div>
    <div slot="header" style="display: flex; justify-content: flex-end; padding: 0 16px"><AdminStatusTag status="success">CONNECTED</AdminStatusTag></div>
    <div style="padding: 32px">
      <AdminPage title="Channels" description="Cross-framework operator playground.">
        <AdminPageHeader title="Channel inventory" description="Shared PageHeader wrapper for Svelte hosts." />
    <aui-tabs items={fixture.tabs} active={activeTab} on:aui-tab-change={(event) => (activeTab = event.detail.id)}></aui-tabs>
    <div style="display: flex; gap: 8px; margin: 20px 0">
      <AdminInput value={query} onValueChange={(value) => (query = value)} placeholder="Search channels" />
      <AdminButton variant="primary" on:click={() => (open = true)}>Create channel</AdminButton>
    </div>
    <AdminTable>
      <table>
        <thead><tr><th>Name</th><th>Status</th><th>Region</th><th>Query</th></tr></thead>
        <tbody>{#each visibleRows as row}<tr><td>{row.id}</td><td>{row.status}</td><td>{row.region}</td><td>{query || '—'}</td></tr>{/each}</tbody>
      </table>
    </AdminTable>
    <section aria-label="Async data contract" style="margin-top: 20px">
      <div style="display: flex; gap: 8px; margin-bottom: 8px">
        <AdminButton on:click={() => (asyncState = 'error')}>Simulate data error</AdminButton>
        <AdminButton on:click={() => (asyncState = 'permission-denied')}>Simulate permission denial</AdminButton>
        <AdminButton on:click={() => (asyncState = 'ready')}>Recover data</AdminButton>
      </div>
      <AdminTable
        id="async-table"
        error={asyncState === 'error'}
        permissionDenied={asyncState === 'permission-denied'}
        onRetry={() => { retryCount += 1; asyncState = 'ready' }}
      >
        <table><tbody><tr><td>Async contract row</td><td>{retryCount}</td></tr></tbody></table>
        <span slot="permission">Request access to continue.</span>
      </AdminTable>
    </section>
    <aui-advanced-table id="business-table" bind:this={businessTable}></aui-advanced-table>
    <output data-parity-business-selection={businessSelection}>Business selection: {businessSelection}</output>
    <AdminPagination {page} totalPages={contract.totalPages} onPageChange={(next) => (page = next)} />
    <AdminToastManager bind:items={toasts} />
    <AdminDialog bind:open title="Create channel">
      <p>Page {page}: confirm the new channel configuration.</p>
      <AdminButton on:click={() => (open = false)}>Close</AdminButton>
    </AdminDialog>
      </AdminPage>
    </div>
  </AdminShell>
</div>
