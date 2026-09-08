<script setup lang="ts">
import { ref } from "vue";
import {
  AdminButton,
  AdminDialog,
  AdminInput,
  AdminPage,
  AdminPagination,
  AdminTable,
  AdminTabs,
} from "@chaos_team/blbui-vue";

const query = ref("");
const open = ref(false);
const page = ref(1);
const tabs = [{ id: "all", label: "All" }, { id: "healthy", label: "Healthy" }];
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
          <thead><tr><th>Name</th><th>Status</th><th>Query</th></tr></thead>
          <tbody><tr><td>gateway-prod</td><td>ONLINE</td><td>{{ query || "—" }}</td></tr></tbody>
        </table>
      </AdminTable>
      <AdminPagination :page="page" :total-pages="3" @page-change="page = $event" />
      <AdminDialog v-model:open="open" title="Create channel">
        <p>Page {{ page }}: confirm the new channel configuration.</p>
        <AdminButton @click="open = false">Close</AdminButton>
      </AdminDialog>
    </AdminPage>
  </div>
</template>
