import { registerAdminElements } from "@chaos_team/blbui-core/register";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import { setAdminTheme } from "@chaos_team/blbui-core";
import { createParityAsyncResource, parityAsyncState } from "../../parity/data-resource";
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
    <section aria-label="Async data contract" id="async-contract">
      <div class="async-actions">
        <aui-button id="simulate-error">SIMULATE DATA ERROR</aui-button>
        <aui-button id="simulate-permission">SIMULATE PERMISSION DENIAL</aui-button>
        <aui-button id="recover-data">RECOVER DATA</aui-button>
      </div>
      <aui-data-grid id="async-grid" error-label="FAILED TO LOAD ASYNC DATA" permission-denied-label="REQUEST ACCESS TO VIEW ASYNC DATA">
        <span slot="permission">Request access to continue.</span>
      </aui-data-grid>
      <output id="async-state" data-parity-async-state="ready" data-parity-retry-count="0">Async state: ready · retries: 0</output>
    </section>
    <aui-advanced-table id="business-table" selectable></aui-advanced-table>
    <output data-parity-business-selection="0">Business selection: 0</output>
    <section aria-label="Business charts" id="business-charts">
      <aui-heatmap id="business-heatmap" label="Request density"></aui-heatmap>
      <aui-funnel-chart id="business-funnel" label="Channel funnel"></aui-funnel-chart>
      <aui-gantt-chart id="business-gantt" min="0" max="100" label="Release plan"></aui-gantt-chart>
    </section>
  </aui-page>
`;

const grid = document.querySelector<
    HTMLElement & {
        columns: unknown[];
        rows: Array<Record<string, unknown>>;
        mobileCards: boolean;
    }
>("#services");
if (!grid) throw new Error("DataGrid host is missing");
const businessTable = document.querySelector<HTMLElement & Record<string, unknown>>(
    "#business-table",
);
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
    document
        .querySelector("[data-parity-business-selection]")
        ?.setAttribute(
            "data-parity-business-selection",
            String((event as CustomEvent<{ keys: unknown[] }>).detail.keys.length),
        );
});
const heatmap = document.querySelector<HTMLElement & Record<string, unknown>>("#business-heatmap");
const funnel = document.querySelector<HTMLElement & Record<string, unknown>>("#business-funnel");
const gantt = document.querySelector<HTMLElement & Record<string, unknown>>("#business-gantt");
if (!heatmap || !funnel || !gantt) throw new Error("Business chart hosts are missing");
heatmap.data = [
    { x: "00", y: "API", value: 18 },
    { x: "06", y: "API", value: 34 },
    { x: "12", y: "API", value: 72 },
    { x: "18", y: "API", value: 44 },
    { x: "00", y: "EDGE", value: 42 },
    { x: "06", y: "EDGE", value: 58 },
    { x: "12", y: "EDGE", value: 88 },
    { x: "18", y: "EDGE", value: 64 },
];
funnel.data = [
    { label: "DISCOVERED", value: 1000 },
    { label: "CONFIGURED", value: 720 },
    { label: "HEALTHY", value: 510 },
    { label: "PRODUCTION", value: 340 },
];
gantt.tasks = [
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
const asyncGrid = document.querySelector<HTMLElement & Record<string, unknown>>("#async-grid");
const asyncState = document.querySelector<HTMLOutputElement>("#async-state");
if (!asyncGrid || !asyncState) throw new Error("Async contract host is missing");
asyncGrid.columns = [{ key: "label", label: "STATE" }];
asyncGrid.rows = [{ id: "async-ready", label: "Async contract row" }];
const asyncResource = createParityAsyncResource();
let retryCount = 0;
const applyAsyncSnapshot = (snapshot: ReturnType<typeof asyncResource.resource.getSnapshot>) => {
    const state = parityAsyncState(snapshot.status);
    asyncGrid.loading = snapshot.status === "loading";
    asyncGrid.error = state === "error";
    asyncGrid.permissionDenied = state === "permission-denied";
    asyncGrid.retryable = snapshot.error?.retryable ?? true;
    asyncGrid.rows = snapshot.rows;
    asyncState.dataset.parityAsyncState = state;
    asyncState.textContent = `Async state: ${state} · retries: ${retryCount}`;
};
const unsubscribeAsync = asyncResource.resource.subscribe(applyAsyncSnapshot);
void asyncResource.resource.load();
document.querySelector("#simulate-error")?.addEventListener("click", () => {
    asyncResource.setMode("error");
    void asyncResource.resource.load();
});
document.querySelector("#simulate-permission")?.addEventListener("click", () => {
    asyncResource.setMode("permission-denied");
    void asyncResource.resource.load();
});
document.querySelector("#recover-data")?.addEventListener("click", () => {
    asyncResource.setMode("ready");
    void asyncResource.resource.load();
});
asyncGrid.addEventListener("aui-retry", () => {
    retryCount += 1;
    asyncState.dataset.parityRetryCount = String(retryCount);
    asyncResource.setMode("ready");
    void asyncResource.resource.retry();
});
window.addEventListener(
    "pagehide",
    () => {
        unsubscribeAsync();
        asyncResource.resource.dispose();
    },
    { once: true },
);
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
