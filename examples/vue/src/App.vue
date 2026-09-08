<script setup lang="ts">
import { computed, ref } from "vue";
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
query.value = contract.initialQuery;
const tabs = fixture.tabs;
const toasts = ref([{ id: "parity", title: "PARITY READY", message: "Vue fixture is synchronized.", variant: "success", duration: 0 }]);
const visibleRows = computed(() => fixture.rows.filter((row) => activeTab.value === "all" || row.status === "ONLINE"));
</script>

<template>
  <div class="aui-root" style="min-height: 100vh; padding: 32px" :data-parity-query="query" :data-parity-page="page" :data-parity-dialog="String(open)" :data-parity-active-tab="activeTab">
    <AdminPage title="Channels" description="Cross-framework operator playground.">
      <AdminTabs :items="tabs" :active="activeTab" @tab-change="activeTab = $event" />
      <div style="display: flex; gap: 8px; margin: 20px 0">
        <AdminInput v-model:value="query" placeholder="Search channels" />
        <AdminButton variant="primary" @click="open = true">Create channel</AdminButton>
      </div>
      <AdminTable>
        <table>
          <thead><tr><th>Name</th><th>Status</th><th>Region</th><th>Query</th></tr></thead>
          <tbody><tr v-for="row in visibleRows" :key="row.id"><td>{{ row.id }}</td><td>{{ row.status }}</td><td>{{ row.region }}</td><td>{{ query || "—" }}</td></tr></tbody>
        </table>
      </AdminTable>
      <AdminPagination :page="page" :total-pages="contract.totalPages" @page-change="page = $event" />
      <AdminToastManager v-model:items="toasts" />
      <AdminDialog v-model:open="open" title="Create channel">
        <p>Page {{ page }}: confirm the new channel configuration.</p>
        <AdminButton @click="open = false">Close</AdminButton>
      </AdminDialog>
    </AdminPage>
  </div>
</template>
