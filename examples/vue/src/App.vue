<script setup lang="ts">
import { ref } from "vue";
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
const open = ref(false);
const page = ref(1);
const tabs = fixture.tabs;
const toasts = ref([{ id: "parity", title: "PARITY READY", message: "Vue fixture is synchronized.", variant: "success", duration: 0 }]);
</script>

<template>
  <div class="aui-root" style="min-height: 100vh; padding: 32px">
    <AdminPage title="Channels" description="Cross-framework operator playground.">
      <AdminTabs :items="tabs" active="all" />
      <div style="display: flex; gap: 8px; margin: 20px 0">
        <AdminInput v-model:value="query" placeholder="Search channels" />
        <AdminButton variant="primary" @click="open = true">Create channel</AdminButton>
      </div>
      <AdminTable>
        <table>
          <thead><tr><th>Name</th><th>Status</th><th>Region</th><th>Query</th></tr></thead>
          <tbody><tr v-for="row in fixture.rows" :key="row.id"><td>{{ row.id }}</td><td>{{ row.status }}</td><td>{{ row.region }}</td><td>{{ query || "—" }}</td></tr></tbody>
        </table>
      </AdminTable>
      <AdminPagination :page="page" :total-pages="3" @page-change="page = $event" />
      <AdminToastManager v-model:items="toasts" />
      <AdminDialog v-model:open="open" title="Create channel">
        <p>Page {{ page }}: confirm the new channel configuration.</p>
        <AdminButton @click="open = false">Close</AdminButton>
      </AdminDialog>
    </AdminPage>
  </div>
</template>
