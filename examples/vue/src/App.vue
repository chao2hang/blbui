<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import { createParityAsyncResource, parityAsyncState } from "../../parity/data-resource";
import fixture from "../../parity/fixture.json";
import {
    AdminButton,
    AdminDialog,
    AdminInput,
    AdminPage,
    AdminPagination,
    AdminShell,
    AdminTable,
    AdminTabs,
    AdminToastManager,
} from "@chaos_team/blbui-vue";

const query = ref("");
const contract = fixture.parityContract.assertions;
const activeTab = ref(fixture.tabs[0].id);
const open = ref(contract.initialDialog);
const page = ref(contract.initialPage);
const retryCount = ref(0);
const asyncResource = createParityAsyncResource();
const asyncSnapshot = ref(asyncResource.resource.getSnapshot());
const asyncState = computed(() => parityAsyncState(asyncSnapshot.value.status));
const cacheEvent = ref("none");
const cacheStats = ref(asyncResource.resource.getCacheStats());
const telemetryEvent = ref("none");
const telemetryStats = ref(asyncResource.resource.getTelemetryStats());
const cacheMetricItems = computed(() => [
    ["entries", cacheStats.value.entries],
    ["hits", cacheStats.value.hits],
    ["stale", cacheStats.value.staleHits],
    ["misses", cacheStats.value.misses],
    ["bypasses", cacheStats.value.bypasses],
    ["writes", cacheStats.value.writes],
    ["invalidations", cacheStats.value.invalidations],
    ["revalidations", cacheStats.value.revalidations],
]);
let stopAsyncSubscription = () => undefined;
let stopCacheSubscription = () => undefined;
let stopTelemetrySubscription = () => undefined;
const recoverFromAsyncError = () => {
    retryCount.value += 1;
    asyncResource.setMode("ready");
    void asyncResource.retry();
};
query.value = contract.initialQuery;
const tabs = fixture.tabs;
const businessRoles = [{ id: "operator", label: "Operator" }];
const businessResources = [{ id: "channels", label: "Channels" }];
const businessPermissions = { operator: { channels: "read" } };
const auditEntries = [{ id: "evt-1", actor: "operator", action: "channel.updated", time: "09:42" }];
const heatmapData = [
    { x: "00", y: "API", value: 18 },
    { x: "06", y: "API", value: 34 },
    { x: "12", y: "API", value: 72 },
    { x: "18", y: "API", value: 44 },
    { x: "00", y: "EDGE", value: 42 },
    { x: "06", y: "EDGE", value: 58 },
    { x: "12", y: "EDGE", value: 88 },
    { x: "18", y: "EDGE", value: 64 },
];
const funnelData = [
    { label: "DISCOVERED", value: 1000 },
    { label: "CONFIGURED", value: 720 },
    { label: "HEALTHY", value: 510 },
    { label: "PRODUCTION", value: 340 },
];
const ganttTasks = [
    { id: "schema", label: "Schema review", group: "PLATFORM", start: 0, end: 28, status: "done" },
    {
        id: "adapter",
        label: "Adapter rollout",
        group: "RUNTIME",
        start: 22,
        end: 66,
        status: "active",
    },
    {
        id: "audit",
        label: "Audit sign-off",
        group: "SECURITY",
        start: 62,
        end: 96,
        status: "pending",
    },
];
const toasts = ref([
    {
        id: "parity",
        title: "PARITY READY",
        message: "Vue fixture is synchronized.",
        variant: "success",
        duration: 0,
    },
]);
onMounted(() => {
    registerBusinessElements();
    stopAsyncSubscription = asyncResource.resource.subscribe((snapshot) => {
        asyncSnapshot.value = snapshot;
    });
    stopCacheSubscription = asyncResource.resource.subscribeCache((event) => {
        cacheEvent.value = event.type;
        cacheStats.value = asyncResource.resource.getCacheStats();
    });
    stopTelemetrySubscription = asyncResource.resource.subscribeTelemetry((event) => {
        telemetryEvent.value = event.type;
        telemetryStats.value = asyncResource.resource.getTelemetryStats();
    });
    void asyncResource.load();
    const table = document.createElement("aui-advanced-table") as HTMLElement &
        Record<string, unknown>;
    table.id = "business-table";
    table.columns = fixture.business.columns;
    table.rows = fixture.business.rows;
    table.selectable = true;
    table.addEventListener("aui-selection-change", (event) => {
        document
            .querySelector("[data-parity-business-selection]")
            ?.setAttribute(
                "data-parity-business-selection",
                String((event as CustomEvent<{ keys: unknown[] }>).detail.keys.length),
            );
    });
    document.querySelector("#business-table-mount")?.append(table);
});
onBeforeUnmount(() => {
    stopAsyncSubscription();
    stopCacheSubscription();
    stopTelemetrySubscription();
    asyncResource.resource.dispose();
});
const visibleRows = computed(() => {
    const normalizedQuery = query.value.trim().toLowerCase();
    return fixture.rows.filter((row) => {
        const matchesTab = activeTab.value === "all" || row.status === "ONLINE";
        const matchesQuery =
            !normalizedQuery ||
            [row.id, row.status, row.region].some((value) =>
                value.toLowerCase().includes(normalizedQuery),
            );
        return matchesTab && matchesQuery;
    });
});
</script>

<template>
    <div
        class="aui-root"
        style="min-height: 100vh"
        :data-parity-query="query"
        :data-parity-page="page"
        :data-parity-dialog="String(open)"
        :data-parity-active-tab="activeTab"
        :data-parity-async-state="asyncState"
        :data-parity-retry-count="retryCount"
        :data-parity-cache-event="cacheEvent"
        :data-parity-cache-hits="cacheStats.hits"
        :data-parity-cache-stale-hits="cacheStats.staleHits"
        :data-parity-cache-misses="cacheStats.misses"
        :data-parity-cache-bypasses="cacheStats.bypasses"
        :data-parity-cache-writes="cacheStats.writes"
        :data-parity-cache-invalidations="cacheStats.invalidations"
        :data-parity-cache-revalidations="cacheStats.revalidations"
        :data-parity-telemetry-event="telemetryEvent"
        :data-parity-telemetry-loads="telemetryStats.loads"
        :data-parity-telemetry-retries="telemetryStats.retries"
        :data-parity-telemetry-successes="telemetryStats.successes"
        :data-parity-telemetry-errors="telemetryStats.errors"
        :data-parity-telemetry-aborts="telemetryStats.aborts"
    >
        <AdminShell sidebar-width="200px" header-height="56px">
            <template #sidebar>
                <div style="padding: 20px; font: 700 12px var(--aui-font-mono)">BLBUI</div>
            </template>
            <template #header>
                <div
                    style="
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        padding: 0 20px;
                        font: 700 11px var(--aui-font-mono);
                    "
                >
                    <span>CONTROL PLANE</span>
                    <span style="color: var(--aui-success)">CONNECTED</span>
                </div>
            </template>
            <div style="padding: 32px">
                <AdminPage title="Channels" description="Cross-framework operator playground.">
                    <AdminTabs :items="tabs" :active="activeTab" @tab-change="activeTab = $event" />
                    <div style="display: flex; gap: 8px; margin: 20px 0">
                        <AdminInput v-model:value="query" placeholder="Search channels" />
                        <AdminButton variant="primary" @click="open = true"
                            >Create channel</AdminButton
                        >
                    </div>
                    <AdminTable>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Region</th>
                                    <th>Query</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in visibleRows" :key="row.id">
                                    <td>{{ row.id }}</td>
                                    <td>{{ row.status }}</td>
                                    <td>{{ row.region }}</td>
                                    <td>{{ query || "—" }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </AdminTable>
                    <section aria-label="Async data contract" style="margin-top: 20px">
                        <div style="display: flex; gap: 8px; margin-bottom: 8px">
                            <AdminButton
                                @click="
                                    asyncResource.setMode('error');
                                    asyncResource.load();
                                "
                                >Simulate data error</AdminButton
                            >
                            <AdminButton
                                @click="
                                    asyncResource.setMode('permission-denied');
                                    asyncResource.load();
                                "
                                >Simulate permission denial</AdminButton
                            >
                            <AdminButton
                                @click="
                                    asyncResource.setMode('ready');
                                    asyncResource.load();
                                "
                                >Recover data</AdminButton
                            >
                        </div>
                        <AdminTable
                            id="async-table"
                            :loading="asyncSnapshot.status === 'loading'"
                            :error="asyncState === 'error'"
                            :permission-denied="asyncState === 'permission-denied'"
                            @retry="recoverFromAsyncError"
                        >
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Async contract row</td>
                                        <td>{{ retryCount }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <template #permission>Request access to continue.</template>
                        </AdminTable>
                        <section aria-label="Cache observability" id="cache-observability">
                            <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap">
                                <AdminButton
                                    @click="
                                        asyncResource.setMode('ready');
                                        asyncResource.load();
                                    "
                                    >Refresh cached data</AdminButton
                                >
                                <AdminButton @click="asyncResource.clearCache"
                                    >Clear cache</AdminButton
                                >
                            </div>
                            <output
                                id="cache-event"
                                style="display: block; margin-top: 8px; overflow-wrap: anywhere"
                                :data-parity-cache-event="cacheEvent"
                            >
                                Cache event: {{ cacheEvent }}
                            </output>
                            <output
                                id="cache-stats"
                                style="
                                    display: grid;
                                    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
                                    gap: 4px;
                                    min-width: 0;
                                    margin-top: 8px;
                                "
                                :data-parity-cache-entries="cacheStats.entries"
                                :data-parity-cache-hits="cacheStats.hits"
                                :data-parity-cache-stale-hits="cacheStats.staleHits"
                                :data-parity-cache-misses="cacheStats.misses"
                                :data-parity-cache-bypasses="cacheStats.bypasses"
                                :data-parity-cache-writes="cacheStats.writes"
                                :data-parity-cache-invalidations="cacheStats.invalidations"
                                :data-parity-cache-revalidations="cacheStats.revalidations"
                            >
                                <span
                                    v-for="([label, value], index) in cacheMetricItems"
                                    :key="`${label}-${index}`"
                                    style="
                                        display: flex;
                                        flex-direction: column;
                                        min-width: 0;
                                        padding: 4px 6px;
                                        border: 1px solid var(--aui-border);
                                        color: var(--aui-text-secondary);
                                        font: 10px/1.25 var(--aui-font-mono);
                                        text-transform: uppercase;
                                    "
                                >
                                    <strong style="color: var(--aui-text-primary)">{{
                                        value
                                    }}</strong>
                                    {{ label }}
                                </span>
                            </output>
                            <output
                                id="telemetry-event"
                                style="display: block; margin-top: 8px; overflow-wrap: anywhere"
                                :data-parity-telemetry-event="telemetryEvent"
                            >
                                Telemetry event: {{ telemetryEvent }}
                            </output>
                            <output
                                id="telemetry-stats"
                                style="
                                    display: grid;
                                    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
                                    gap: 4px;
                                    min-width: 0;
                                    margin-top: 8px;
                                "
                                :data-parity-telemetry-loads="telemetryStats.loads"
                                :data-parity-telemetry-retries="telemetryStats.retries"
                                :data-parity-telemetry-successes="telemetryStats.successes"
                                :data-parity-telemetry-errors="telemetryStats.errors"
                                :data-parity-telemetry-aborts="telemetryStats.aborts"
                            >
                                <span
                                    v-for="([label, value], index) in [
                                        ['loads', telemetryStats.loads],
                                        ['retries', telemetryStats.retries],
                                        ['successes', telemetryStats.successes],
                                        ['errors', telemetryStats.errors],
                                        ['aborts', telemetryStats.aborts],
                                    ]"
                                    :key="`${label}-${index}`"
                                    style="
                                        display: flex;
                                        flex-direction: column;
                                        min-width: 0;
                                        padding: 4px 6px;
                                        border: 1px solid var(--aui-border);
                                        color: var(--aui-text-secondary);
                                        font: 10px/1.25 var(--aui-font-mono);
                                        text-transform: uppercase;
                                    "
                                >
                                    <strong style="color: var(--aui-text-primary)">{{
                                        value
                                    }}</strong>
                                    {{ label }}
                                </span>
                            </output>
                        </section>
                    </section>
                    <div id="business-table-mount"></div>
                    <output data-parity-business-selection="0">Business selection: 0</output>
                    <section aria-label="Business direct Custom Elements" style="margin-top: 20px">
                        <aui-permission-matrix
                            :roles.prop="businessRoles"
                            :resources.prop="businessResources"
                            :permissions.prop="businessPermissions"
                        />
                        <aui-audit-log :entries.prop="auditEntries" has-more />
                        <aui-export-button
                            :data.prop="visibleRows"
                            format="csv"
                            filename="channels"
                        />
                        <aui-heatmap :data.prop="heatmapData" label="Request density" />
                        <aui-funnel-chart :data.prop="funnelData" label="Channel funnel" />
                        <aui-gantt-chart
                            :tasks.prop="ganttTasks"
                            :min="0"
                            :max="100"
                            label="Release plan"
                        />
                    </section>
                    <AdminPagination
                        :page="page"
                        :total-pages="contract.totalPages"
                        @page-change="page = $event"
                    />
                    <AdminToastManager v-model:items="toasts" />
                    <AdminDialog v-model:open="open" title="Create channel">
                        <p>Page {{ page }}: confirm the new channel configuration.</p>
                        <AdminButton @click="open = false">Close</AdminButton>
                    </AdminDialog>
                </AdminPage>
            </div>
        </AdminShell>
    </div>
</template>
