<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import fixture from "../../parity/fixture.json";
import {
    AdminButton,
    AdminDialog,
    AdminInput,
    AdminPage,
    AdminPagination,
    AdminTable,
    AdminTabs,
    AdminToastManager,
} from "@chaos_team/blbui-vue";

const query = ref("");
const contract = fixture.parityContract.assertions;
const activeTab = ref(fixture.tabs[0].id);
const open = ref(contract.initialDialog);
const page = ref(contract.initialPage);
const asyncState = ref<"ready" | "error" | "permission-denied">("ready");
const retryCount = ref(0);
const recoverFromAsyncError = () => {
    retryCount.value += 1;
    asyncState.value = "ready";
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
        style="min-height: 100vh; padding: 32px"
        :data-parity-query="query"
        :data-parity-page="page"
        :data-parity-dialog="String(open)"
        :data-parity-active-tab="activeTab"
        :data-parity-async-state="asyncState"
        :data-parity-retry-count="retryCount"
    >
        <AdminPage title="Channels" description="Cross-framework operator playground.">
            <AdminTabs :items="tabs" :active="activeTab" @tab-change="activeTab = $event" />
            <div style="display: flex; gap: 8px; margin: 20px 0">
                <AdminInput v-model:value="query" placeholder="Search channels" />
                <AdminButton variant="primary" @click="open = true">Create channel</AdminButton>
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
                    <AdminButton @click="asyncState = 'error'">Simulate data error</AdminButton>
                    <AdminButton @click="asyncState = 'permission-denied'"
                        >Simulate permission denial</AdminButton
                    >
                    <AdminButton @click="asyncState = 'ready'">Recover data</AdminButton>
                </div>
                <AdminTable
                    id="async-table"
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
                <aui-export-button :data.prop="visibleRows" format="csv" filename="channels" />
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
</template>
