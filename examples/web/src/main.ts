import { registerAdminElements } from "@chaos_team/blbui-core/register";
import { setAdminTheme } from "@chaos_team/blbui-core";
import "@chaos_team/blbui-core/styles.css";

registerAdminElements();
setAdminTheme(document, "enterprise", "light");

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Web host mount point is missing");

app.className = "aui-root";
app.innerHTML = `
  <aui-page title="Operations" description="A framework-neutral host migration fixture.">
    <aui-filter-bar>
      <aui-input id="filter" placeholder="Filter services"></aui-input>
      <aui-status-tag slot="actions" status="success">CONNECTED</aui-status-tag>
    </aui-filter-bar>
    <aui-data-grid id="services" mobile-cards></aui-data-grid>
  </aui-page>
`;

const grid = document.querySelector<HTMLElement & {
    columns: unknown[];
    rows: Array<Record<string, unknown>>;
    mobileCards: boolean;
}>("#services");
if (!grid) throw new Error("DataGrid host is missing");
grid.columns = [
    { key: "name", label: "Service", sortable: true },
    { key: "status", label: "Status" },
    { key: "region", label: "Region" },
];
grid.rows = [
    { id: "gateway-prod", name: "Gateway / Production", status: "ONLINE", region: "cn-east-1" },
    { id: "gateway-edge", name: "Gateway / Edge", status: "DEGRADED", region: "cn-north-1" },
];

document.querySelector("#filter")?.addEventListener("aui-input", (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail.value.toLowerCase();
    grid.rows = [
        { id: "gateway-prod", name: "Gateway / Production", status: "ONLINE", region: "cn-east-1" },
        { id: "gateway-edge", name: "Gateway / Edge", status: "DEGRADED", region: "cn-north-1" },
    ].filter((row) => String(row.name).toLowerCase().includes(value));
});
