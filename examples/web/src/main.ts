import { registerAdminElements } from "@chaos_team/blbui-core/register";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import { setAdminTheme } from "@chaos_team/blbui-core";
import "@chaos_team/blbui-core/styles.css";
import "@chaos_team/blbui-business/styles.css";

registerAdminElements();
registerBusinessElements();
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
    <aui-advanced-table id="business-table" selectable></aui-advanced-table>
    <output data-parity-business-selection="0">Business selection: 0</output>
  </aui-page>
`;

const grid = document.querySelector<HTMLElement & {
    columns: unknown[];
    rows: Array<Record<string, unknown>>;
    mobileCards: boolean;
}>("#services");
if (!grid) throw new Error("DataGrid host is missing");
const businessTable = document.querySelector<HTMLElement & Record<string, unknown>>("#business-table");
if (!businessTable) throw new Error("Business table host is missing");
businessTable.columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "SERVICE" },
    { key: "owner", label: "OWNER" },
];
businessTable.rows = [
    { id: "svc-gateway", name: "Gateway", owner: "Platform" },
    { id: "svc-worker", name: "Worker", owner: "Runtime" },
];
businessTable.selectable = true;
businessTable.addEventListener("aui-selection-change", (event) => {
    document.querySelector("[data-parity-business-selection]")?.setAttribute("data-parity-business-selection", String((event as CustomEvent<{ keys: unknown[] }>).detail.keys.length));
});
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
