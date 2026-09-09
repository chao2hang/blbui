<script lang="ts">
  import { onMount } from 'svelte'
  import fixture from '../../parity/fixture.json'
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import { registerBusinessElements } from '@chaos_team/blbui-business/register'
  import { createParityAsyncResource, parityAsyncState } from '../../parity/data-resource'
  import { AdminButton, AdminDialog, AdminInput, AdminPage, AdminPagination, AdminShell, AdminStatusTag, AdminTable, AdminToastManager } from '@chaos_team/blbui-svelte'

  const contract = fixture.parityContract.assertions
  let query = contract.initialQuery
  let open = contract.initialDialog
  let page = contract.initialPage
  const asyncResource = createParityAsyncResource()
  let asyncSnapshot = asyncResource.resource.getSnapshot()
  $: asyncState = parityAsyncState(asyncSnapshot.status)
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
  let permissionMatrix: (HTMLElement & Record<string, unknown>) | undefined
  let auditLog: (HTMLElement & Record<string, unknown>) | undefined
  let exportButton: (HTMLElement & Record<string, unknown>) | undefined
  let heatmap: (HTMLElement & Record<string, unknown>) | undefined
  let funnel: (HTMLElement & Record<string, unknown>) | undefined
  let gantt: (HTMLElement & Record<string, unknown>) | undefined
  onMount(() => {
    registerAdminElements()
    registerBusinessElements()
    if (businessTable) {
      businessTable.columns = fixture.business.columns
      businessTable.rows = fixture.business.rows
      businessTable.selectable = true
      businessTable.addEventListener('aui-selection-change', (event) => (businessSelection = (event as CustomEvent<{ keys: unknown[] }>).detail.keys.length))
    }
    if (permissionMatrix) {
      permissionMatrix.roles = [{ id: 'operator', label: 'Operator' }]
      permissionMatrix.resources = [{ id: 'channels', label: 'Channels' }]
      permissionMatrix.permissions = { operator: { channels: 'read' } }
    }
    if (auditLog) auditLog.entries = [{ id: 'evt-1', actor: 'operator', action: 'channel.updated', time: '09:42' }]
    if (exportButton) {
      exportButton.data = fixture.rows
      exportButton.format = 'csv'
      exportButton.filename = 'channels'
    }
    if (heatmap) heatmap.data = [
      { x: '00', y: 'API', value: 18 }, { x: '06', y: 'API', value: 34 }, { x: '12', y: 'API', value: 72 }, { x: '18', y: 'API', value: 44 },
      { x: '00', y: 'EDGE', value: 42 }, { x: '06', y: 'EDGE', value: 58 }, { x: '12', y: 'EDGE', value: 88 }, { x: '18', y: 'EDGE', value: 64 },
    ]
    if (funnel) funnel.data = [{ label: 'DISCOVERED', value: 1000 }, { label: 'CONFIGURED', value: 720 }, { label: 'HEALTHY', value: 510 }, { label: 'PRODUCTION', value: 340 }]
    if (gantt) gantt.tasks = [
      { id: 'schema', label: 'Schema review', group: 'PLATFORM', start: 0, end: 28, status: 'done' },
      { id: 'adapter', label: 'Adapter rollout', group: 'RUNTIME', start: 22, end: 66, status: 'active' },
      { id: 'audit', label: 'Audit sign-off', group: 'SECURITY', start: 62, end: 96, status: 'pending' },
    ]
    const unsubscribe = asyncResource.resource.subscribe((snapshot) => (asyncSnapshot = snapshot))
    void asyncResource.resource.load()
    return () => {
      unsubscribe()
      asyncResource.resource.dispose()
    }
  })
  const retryAsync = () => {
    retryCount += 1
    asyncResource.setMode('ready')
    void asyncResource.resource.retry()
  }
</script>

<svelte:head><title>BLBUI Svelte Playground</title></svelte:head>

<div class="aui-root" style="min-height: 100vh" data-parity-query={query} data-parity-page={page} data-parity-dialog={String(open)} data-parity-active-tab={activeTab} data-parity-async-state={asyncState} data-parity-retry-count={retryCount}>
  <AdminShell sidebarWidth="168px" headerHeight="48px">
    <div slot="sidebar" style="padding: 16px; font: 700 12px var(--aui-font-mono)">BLBUI</div>
    <div slot="header" style="display: flex; justify-content: flex-end; padding: 0 16px"><AdminStatusTag status="success">CONNECTED</AdminStatusTag></div>
    <div style="padding: 32px">
      <AdminPage title="Channels" description="Cross-framework operator playground.">
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
        <AdminButton on:click={() => { asyncResource.setMode('error'); void asyncResource.resource.load() }}>Simulate data error</AdminButton>
        <AdminButton on:click={() => { asyncResource.setMode('permission-denied'); void asyncResource.resource.load() }}>Simulate permission denial</AdminButton>
        <AdminButton on:click={() => { asyncResource.setMode('ready'); void asyncResource.resource.load() }}>Recover data</AdminButton>
      </div>
      <AdminTable
        id="async-table"
        loading={asyncSnapshot.status === 'loading'}
        error={asyncState === 'error'}
        permissionDenied={asyncState === 'permission-denied'}
        onRetry={retryAsync}
      >
        <table><tbody><tr><td>Async contract row</td><td>{retryCount}</td></tr></tbody></table>
        <span slot="permission">Request access to continue.</span>
      </AdminTable>
    </section>
    <aui-advanced-table id="business-table" bind:this={businessTable}></aui-advanced-table>
    <output data-parity-business-selection={businessSelection}>Business selection: {businessSelection}</output>
    <section aria-label="Business direct Custom Elements" style="margin-top: 20px">
      <aui-permission-matrix bind:this={permissionMatrix}></aui-permission-matrix>
      <aui-audit-log bind:this={auditLog} has-more></aui-audit-log>
      <aui-export-button bind:this={exportButton}></aui-export-button>
      <aui-heatmap bind:this={heatmap} label="Request density"></aui-heatmap>
      <aui-funnel-chart bind:this={funnel} label="Channel funnel"></aui-funnel-chart>
      <aui-gantt-chart bind:this={gantt} min={0} max={100} label="Release plan"></aui-gantt-chart>
    </section>
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
