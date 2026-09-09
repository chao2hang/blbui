import {
    adminThemeLabels,
    adminThemes,
    setAdminTheme,
    type AdminThemeMode,
    type AdminThemeName,
} from "@chaos_team/blbui-core";
import { registerAdminElements } from "@chaos_team/blbui-core/register";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import { createParityAsyncResource, parityAsyncState } from "../../parity/data-resource";
import "@chaos_team/blbui-core/styles.css";
import "@chaos_team/blbui-business/styles.css";
import "./styles.css";

registerAdminElements();
registerBusinessElements();
setAdminTheme(document, "enterprise", "light");

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Web host mount point is missing");

type WebPage = "overview" | "users" | "channels" | "logs";
type DataState = "ready" | "loading" | "error" | "permission-denied" | "empty";
type Row = Record<string, unknown> & { id: string };
type Grid = HTMLElement & {
    columns: unknown[];
    rows: Row[];
    loading: boolean;
    error: boolean;
    permissionDenied: boolean;
    retryable: boolean;
    selectable: boolean;
    mobileCards: boolean;
    pageSize: number;
    selectedKeys: Array<string | number>;
    emptyLabel: string;
    loadingLabel: string;
    errorLabel: string;
    permissionDeniedLabel: string;
};
type Select = HTMLElement & {
    options: Array<{ value: string; label: string }>;
    value: string;
};
type Pagination = HTMLElement & {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
};
type LogViewer = HTMLElement & {
    entries: Array<{ time?: string; level?: string; message: string; meta?: string }>;
    follow: boolean;
};

const navItems: Array<{ id: WebPage; label: string; title: string }> = [
    { id: "overview", label: "Overview", title: "Operations" },
    { id: "users", label: "Users", title: "Users" },
    { id: "channels", label: "Channels", title: "Channels" },
    { id: "logs", label: "Usage Logs", title: "Usage Logs" },
];

const users: Row[] = [
    {
        id: "usr-1001",
        name: "Alice Chen",
        email: "alice.chen@example.com",
        role: "Owner",
        status: "ACTIVE",
        lastSeen: "2 min ago",
    },
    {
        id: "usr-1002",
        name: "Bo Wang",
        email: "bo.wang@example.com",
        role: "Operator",
        status: "ACTIVE",
        lastSeen: "8 min ago",
    },
    {
        id: "usr-1003",
        name: "Clara Liu",
        email: "clara.liu@example.com",
        role: "Viewer",
        status: "INVITED",
        lastSeen: "—",
    },
    {
        id: "usr-1004",
        name: "Diego Ortiz",
        email: "diego.ortiz@example.com",
        role: "Operator",
        status: "ACTIVE",
        lastSeen: "14 min ago",
    },
    {
        id: "usr-1005",
        name: "Eva Zhang",
        email: "eva.zhang@example.com",
        role: "Auditor",
        status: "SUSPENDED",
        lastSeen: "3 h ago",
    },
    {
        id: "usr-1006",
        name: "Frank Li",
        email: "frank.li@example.com",
        role: "Viewer",
        status: "ACTIVE",
        lastSeen: "26 min ago",
    },
    {
        id: "usr-1007",
        name: "Grace Wu",
        email: "grace.wu@example.com",
        role: "Operator",
        status: "ACTIVE",
        lastSeen: "31 min ago",
    },
    {
        id: "usr-1008",
        name: "Hao Sun",
        email: "hao.sun@example.com",
        role: "Viewer",
        status: "INVITED",
        lastSeen: "—",
    },
    {
        id: "usr-1009",
        name: "Iris Zhou",
        email: "iris.zhou@example.com",
        role: "Auditor",
        status: "ACTIVE",
        lastSeen: "44 min ago",
    },
    {
        id: "usr-1010",
        name: "Jun He",
        email: "jun.he@example.com",
        role: "Operator",
        status: "ACTIVE",
        lastSeen: "1 h ago",
    },
    {
        id: "usr-1011",
        name: "Kai Xu",
        email: "kai.xu@example.com",
        role: "Viewer",
        status: "ACTIVE",
        lastSeen: "2 h ago",
    },
    {
        id: "usr-1012",
        name: "Lena Zhao",
        email: "lena.zhao@example.com",
        role: "Owner",
        status: "ACTIVE",
        lastSeen: "2 h ago",
    },
    {
        id: "usr-1013",
        name: "Ming Qiao",
        email: "ming.qiao@example.com",
        role: "Operator",
        status: "SUSPENDED",
        lastSeen: "5 h ago",
    },
    {
        id: "usr-1014",
        name: "Nora Kim",
        email: "nora.kim@example.com",
        role: "Viewer",
        status: "ACTIVE",
        lastSeen: "6 h ago",
    },
    {
        id: "usr-1015",
        name: "Owen Shen",
        email: "owen.shen@example.com",
        role: "Auditor",
        status: "ACTIVE",
        lastSeen: "yesterday",
    },
];

const channels: Row[] = [
    {
        id: "chn-api-prod",
        name: "API / Production",
        protocol: "HTTPS",
        region: "cn-east-1",
        status: "HEALTHY",
        owner: "Platform",
    },
    {
        id: "chn-api-edge",
        name: "API / Edge",
        protocol: "HTTPS",
        region: "cn-north-1",
        status: "DEGRADED",
        owner: "Platform",
    },
    {
        id: "chn-events",
        name: "Events / Ingest",
        protocol: "KAFKA",
        region: "cn-east-1",
        status: "HEALTHY",
        owner: "Data",
    },
    {
        id: "chn-audit",
        name: "Audit / Archive",
        protocol: "S3",
        region: "cn-south-1",
        status: "HEALTHY",
        owner: "Security",
    },
    {
        id: "chn-webhook",
        name: "Webhook / Partner",
        protocol: "HTTPS",
        region: "us-west-1",
        status: "PAUSED",
        owner: "Integrations",
    },
    {
        id: "chn-metrics",
        name: "Metrics / Longterm",
        protocol: "OTLP",
        region: "cn-north-1",
        status: "HEALTHY",
        owner: "Observability",
    },
    {
        id: "chn-billing",
        name: "Billing / Export",
        protocol: "SFTP",
        region: "cn-east-1",
        status: "DEGRADED",
        owner: "Finance",
    },
    {
        id: "chn-replay",
        name: "Replay / Sandbox",
        protocol: "HTTPS",
        region: "cn-south-1",
        status: "PAUSED",
        owner: "Runtime",
    },
    {
        id: "chn-alerts",
        name: "Alerts / Pager",
        protocol: "HTTPS",
        region: "cn-east-1",
        status: "HEALTHY",
        owner: "SRE",
    },
    {
        id: "chn-iam",
        name: "IAM / Events",
        protocol: "KAFKA",
        region: "cn-north-1",
        status: "HEALTHY",
        owner: "Security",
    },
];

const usageLogs: Row[] = [
    {
        id: "log-001",
        time: "09:42:18",
        level: "info",
        service: "gateway",
        message: "request.completed",
        detail: "status=200 latency=42ms",
    },
    {
        id: "log-002",
        time: "09:41:56",
        level: "info",
        service: "channels",
        message: "channel.healthcheck",
        detail: "channel=chn-api-prod",
    },
    {
        id: "log-003",
        time: "09:41:22",
        level: "warn",
        service: "gateway",
        message: "upstream.slow",
        detail: "latency=840ms region=cn-north-1",
    },
    {
        id: "log-004",
        time: "09:40:47",
        level: "info",
        service: "iam",
        message: "session.refreshed",
        detail: "actor=usr-1002",
    },
    {
        id: "log-005",
        time: "09:39:11",
        level: "error",
        service: "billing",
        message: "export.retry",
        detail: "attempt=2 backoff=30s",
    },
    {
        id: "log-006",
        time: "09:38:52",
        level: "info",
        service: "gateway",
        message: "request.completed",
        detail: "status=201 latency=68ms",
    },
    {
        id: "log-007",
        time: "09:37:33",
        level: "info",
        service: "audit",
        message: "record.appended",
        detail: "batch=1842 records=120",
    },
    {
        id: "log-008",
        time: "09:36:09",
        level: "warn",
        service: "events",
        message: "consumer.lag",
        detail: "partition=4 lag=118",
    },
    {
        id: "log-009",
        time: "09:35:28",
        level: "info",
        service: "iam",
        message: "role.updated",
        detail: "actor=usr-1001 target=usr-1009",
    },
    {
        id: "log-010",
        time: "09:34:01",
        level: "error",
        service: "webhook",
        message: "delivery.failed",
        detail: "status=503 retryable=true",
    },
    {
        id: "log-011",
        time: "09:32:41",
        level: "info",
        service: "gateway",
        message: "request.completed",
        detail: "status=200 latency=37ms",
    },
    {
        id: "log-012",
        time: "09:31:07",
        level: "info",
        service: "metrics",
        message: "flush.completed",
        detail: "series=842 points=12044",
    },
];

app.className = "aui-root";
app.innerHTML = `
  <aui-shell class="web-shell" sidebar-width="224px" header-height="64px">
    <div slot="sidebar" class="web-sidebar">
      <div class="web-brand"><span class="web-brand-mark">BL</span><span>BLBUI</span></div>
      <div class="web-sidebar-kicker">CONTROL PLANE</div>
      <nav class="web-nav" aria-label="Main navigation">
        ${navItems.map((item) => `<button class="web-nav-item" type="button" data-route="${item.id}">${item.label}</button>`).join("")}
      </nav>
      <div class="web-sidebar-footer"><span class="web-pulse"></span><span>CONNECTED</span><span class="web-version">v0.0.27</span></div>
    </div>
    <div slot="header" class="web-header">
      <div class="web-header-context"><span class="web-header-kicker">BLBUI / MIGRATION HOST</span><span id="route-label">Operations</span></div>
      <div class="web-header-actions">
        <label class="web-theme-control"><span>THEME</span><aui-select id="theme-select" aria-label="Theme"></aui-select></label>
        <aui-button id="toggle-mode" size="compact">DARK MODE</aui-button>
      </div>
    </div>
    <nav class="web-mobile-nav" aria-label="Mobile navigation">
      ${navItems.map((item) => `<button class="web-nav-item" type="button" data-route="${item.id}">${item.label}</button>`).join("")}
    </nav>
    <div id="page-root" class="web-page-root"></div>
  </aui-shell>
`;

const pageRoot = document.querySelector<HTMLDivElement>("#page-root");
const routeLabel = document.querySelector<HTMLElement>("#route-label");
const themeSelect = document.querySelector<Select>("#theme-select");
const modeButton = document.querySelector<HTMLElement>("#toggle-mode");
if (!pageRoot || !routeLabel || !themeSelect || !modeButton)
    throw new Error("Web host chrome is missing");

themeSelect.options = adminThemes.map((theme) => ({
    value: theme,
    label: adminThemeLabels[theme],
}));
themeSelect.value = "enterprise";

const currentTheme = (): AdminThemeName => {
    const value = document.documentElement.dataset.auiTheme;
    return adminThemes.includes(value as AdminThemeName) ? (value as AdminThemeName) : "enterprise";
};
const currentMode = (): AdminThemeMode =>
    document.documentElement.dataset.auiMode === "dark" ? "dark" : "light";
const syncThemeChrome = (): void => {
    themeSelect.value = currentTheme();
    modeButton.textContent = currentMode() === "dark" ? "LIGHT MODE" : "DARK MODE";
    modeButton.setAttribute(
        "aria-label",
        `Switch to ${currentMode() === "dark" ? "light" : "dark"} mode`,
    );
};
themeSelect.addEventListener("aui-change", (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail.value as AdminThemeName;
    if (adminThemes.includes(value)) setAdminTheme(document, value, currentMode());
    syncThemeChrome();
});
modeButton.addEventListener("click", () => {
    setAdminTheme(document, currentTheme(), currentMode() === "dark" ? "light" : "dark");
    syncThemeChrome();
});
syncThemeChrome();

let cleanupPage = (): void => undefined;

const byId = <T extends HTMLElement>(id: string): T => {
    const element = document.getElementById(id) as T | null;
    if (!element) throw new Error(`Web host element is missing: ${id}`);
    return element;
};
const getGrid = (id: string): Grid => byId<Grid>(id);
const getPagination = (id: string): Pagination => byId<Pagination>(id);
const getSelect = (id: string): Select => byId<Select>(id);
const getOutput = (id: string): HTMLOutputElement => byId<HTMLOutputElement>(id);

const stateControls = (prefix: string): string => `
  <div class="web-state-toolbar" aria-label="${prefix} data state">
    <span class="web-state-label">STATE</span>
    <aui-button id="${prefix}-ready" size="compact">READY</aui-button>
    <aui-button id="${prefix}-loading" size="compact">LOADING</aui-button>
    <aui-button id="${prefix}-empty" size="compact">EMPTY</aui-button>
    <aui-button id="${prefix}-error" size="compact">ERROR</aui-button>
    <aui-button id="${prefix}-permission" size="compact">PERMISSION</aui-button>
  </div>`;

const configureSelect = (
    id: string,
    options: Array<{ value: string; label: string }>,
    value = "",
): Select => {
    const select = getSelect(id);
    select.options = options;
    select.value = value;
    return select;
};

const setGridState = (
    grid: Grid,
    state: DataState,
    rows: Row[],
    labels: { empty: string; loading: string; error: string; permission: string },
): void => {
    grid.loading = state === "loading";
    grid.error = state === "error";
    grid.permissionDenied = state === "permission-denied";
    grid.retryable = state === "error";
    grid.emptyLabel = labels.empty;
    grid.loadingLabel = labels.loading;
    grid.errorLabel = labels.error;
    grid.permissionDeniedLabel = labels.permission;
    grid.rows = state === "ready" ? rows : [];
};

const bindStateControls = (prefix: string, onState: (state: DataState) => void): (() => void) => {
    const states: DataState[] = ["ready", "loading", "empty", "error", "permission-denied"];
    const listeners = states.map((state) => {
        const id = state === "permission-denied" ? "permission" : state;
        const button = byId<HTMLElement>(`${prefix}-${id}`);
        const listener = () => onState(state);
        button.addEventListener("click", listener);
        return () => button.removeEventListener("click", listener);
    });
    return () => listeners.forEach((unsubscribe) => unsubscribe());
};

const renderOverview = (): void => {
    pageRoot.innerHTML = `
      <aui-page title="Operations" description="A framework-neutral host migration fixture for an enterprise control plane.">
        <div class="web-page-intro"><span class="web-eyebrow">OVERVIEW / OPERATIONS</span><span class="web-intro-copy">Shared components, tokens and lifecycle contracts in one host.</span></div>
        <aui-filter-bar>
          <aui-input id="filter" aria-label="Filter services" placeholder="Filter services"></aui-input>
          <aui-status-tag slot="actions" status="success">CONNECTED</aui-status-tag>
        </aui-filter-bar>
        <aui-data-grid id="services" mobile-cards></aui-data-grid>
        <section aria-label="Async data contract" id="async-contract" class="web-section">
          <div class="web-section-heading"><div><span class="web-eyebrow">ASYNC CONTRACT</span><h2>Loading, recovery and permission states</h2></div><span class="web-section-note">AdminDataResource</span></div>
          <div class="async-actions"><aui-button id="simulate-error">SIMULATE DATA ERROR</aui-button><aui-button id="simulate-permission">SIMULATE PERMISSION DENIAL</aui-button><aui-button id="recover-data" variant="primary">RECOVER DATA</aui-button></div>
          <aui-data-grid id="async-grid" error-label="FAILED TO LOAD ASYNC DATA" permission-denied-label="REQUEST ACCESS TO VIEW ASYNC DATA"><span slot="permission">Request access to continue.</span></aui-data-grid>
          <output id="async-state" data-parity-async-state="ready" data-parity-retry-count="0">Async state: ready · retries: 0</output>
          <section aria-label="Cache observability" id="cache-observability" class="web-observability">
            <div class="web-section-heading"><div><span class="web-eyebrow">OBSERVABILITY</span><h2>Cache and request telemetry</h2></div><span id="telemetry-event" data-parity-telemetry-event="none">Telemetry event: none</span></div>
            <div class="async-actions"><aui-button id="refresh-cache" size="compact">REFRESH CACHED DATA</aui-button><aui-button id="clear-cache" size="compact">CLEAR CACHE</aui-button></div>
            <output id="cache-event" data-parity-cache-event="none">Cache event: none</output><output id="cache-stats"></output><output id="telemetry-stats"></output>
          </section>
        </section>
        <aui-advanced-table id="business-table" selectable></aui-advanced-table>
        <output data-parity-business-selection="0">Business selection: 0</output>
        <section aria-label="Business charts" id="business-charts" class="web-chart-grid"><aui-heatmap id="business-heatmap" label="Request density"></aui-heatmap><aui-funnel-chart id="business-funnel" label="Channel funnel"></aui-funnel-chart><aui-gantt-chart id="business-gantt" min="0" max="100" label="Release plan"></aui-gantt-chart></section>
      </aui-page>`;

    const grid = getGrid("services");
    grid.columns = [
        { key: "name", label: "Service", sortable: true },
        { key: "status", label: "Status" },
        { key: "region", label: "Region" },
    ];
    const serviceRows: Row[] = [
        { id: "gateway-prod", name: "Gateway / Production", status: "ONLINE", region: "cn-east-1" },
        { id: "gateway-edge", name: "Gateway / Edge", status: "DEGRADED", region: "cn-north-1" },
    ];
    grid.rows = serviceRows;
    grid.mobileCards = true;
    byId<HTMLElement>("filter").addEventListener("aui-input", (event) => {
        const value = (event as CustomEvent<{ value: string }>).detail.value.toLowerCase();
        grid.rows = serviceRows.filter((row) => String(row.name).toLowerCase().includes(value));
    });

    const businessTable = byId<HTMLElement & Record<string, unknown>>("business-table");
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
    const heatmap = byId<HTMLElement & Record<string, unknown>>("business-heatmap");
    const funnel = byId<HTMLElement & Record<string, unknown>>("business-funnel");
    const gantt = byId<HTMLElement & Record<string, unknown>>("business-gantt");
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
        {
            id: "schema",
            label: "Schema review",
            group: "PLATFORM",
            start: 0,
            end: 28,
            status: "done",
        },
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

    const asyncGrid = getGrid("async-grid");
    const asyncState = getOutput("async-state");
    asyncGrid.columns = [{ key: "label", label: "STATE" }];
    asyncGrid.rows = [{ id: "async-ready", label: "Async contract row" }];
    const asyncResource = createParityAsyncResource();
    let retryCount = 0;
    const cacheEvent = getOutput("cache-event");
    const cacheStats = getOutput("cache-stats");
    const telemetryEvent = getOutput("telemetry-event");
    const telemetryStats = getOutput("telemetry-stats");
    const renderCacheStats = () => {
        const stats = asyncResource.resource.getCacheStats();
        cacheStats.dataset.parityCacheEntries = String(stats.entries);
        cacheStats.dataset.parityCacheHits = String(stats.hits);
        cacheStats.dataset.parityCacheStaleHits = String(stats.staleHits);
        cacheStats.dataset.parityCacheMisses = String(stats.misses);
        cacheStats.dataset.parityCacheBypasses = String(stats.bypasses);
        cacheStats.dataset.parityCacheWrites = String(stats.writes);
        cacheStats.dataset.parityCacheInvalidations = String(stats.invalidations);
        cacheStats.dataset.parityCacheRevalidations = String(stats.revalidations);
        cacheStats.innerHTML = [
            ["entries", stats.entries],
            ["hits", stats.hits],
            ["stale", stats.staleHits],
            ["misses", stats.misses],
            ["bypasses", stats.bypasses],
            ["writes", stats.writes],
            ["invalidations", stats.invalidations],
            ["revalidations", stats.revalidations],
        ]
            .map(([label, value]) => `<span><strong>${value}</strong>${label}</span>`)
            .join("");
    };
    const renderTelemetryStats = () => {
        const stats = asyncResource.resource.getTelemetryStats();
        telemetryStats.dataset.parityTelemetryLoads = String(stats.loads);
        telemetryStats.dataset.parityTelemetryRetries = String(stats.retries);
        telemetryStats.dataset.parityTelemetrySuccesses = String(stats.successes);
        telemetryStats.dataset.parityTelemetryErrors = String(stats.errors);
        telemetryStats.dataset.parityTelemetryAborts = String(stats.aborts);
        telemetryStats.innerHTML = [
            ["loads", stats.loads],
            ["retries", stats.retries],
            ["successes", stats.successes],
            ["errors", stats.errors],
            ["aborts", stats.aborts],
        ]
            .map(([label, value]) => `<span><strong>${value}</strong>${label}</span>`)
            .join("");
    };
    const unsubscribeCache = asyncResource.resource.subscribeCache((event) => {
        cacheEvent.dataset.parityCacheEvent = event.type;
        cacheEvent.textContent = `Cache event: ${event.type}`;
        renderCacheStats();
    });
    const unsubscribeTelemetry = asyncResource.resource.subscribeTelemetry((event) => {
        telemetryEvent.dataset.parityTelemetryEvent = event.type;
        telemetryEvent.textContent = `Telemetry event: ${event.type}`;
        renderTelemetryStats();
    });
    const applyAsyncSnapshot = (
        snapshot: ReturnType<typeof asyncResource.resource.getSnapshot>,
    ) => {
        const state = parityAsyncState(snapshot.status);
        asyncGrid.loading = snapshot.status === "loading";
        asyncGrid.error = state === "error";
        asyncGrid.permissionDenied = state === "permission-denied";
        asyncGrid.retryable = snapshot.error?.retryable ?? true;
        asyncGrid.rows = snapshot.rows as unknown as Row[];
        asyncState.dataset.parityAsyncState = state;
        asyncState.textContent = `Async state: ${state} · retries: ${retryCount}`;
    };
    const unsubscribeAsync = asyncResource.resource.subscribe(applyAsyncSnapshot);
    void asyncResource.load();
    byId<HTMLElement>("simulate-error").addEventListener("click", () => {
        asyncResource.setMode("error");
        void asyncResource.load();
    });
    byId<HTMLElement>("simulate-permission").addEventListener("click", () => {
        asyncResource.setMode("permission-denied");
        void asyncResource.load();
    });
    byId<HTMLElement>("recover-data").addEventListener("click", () => {
        asyncResource.setMode("ready");
        void asyncResource.load();
    });
    asyncGrid.addEventListener("aui-retry", () => {
        retryCount += 1;
        asyncState.dataset.parityRetryCount = String(retryCount);
        asyncResource.setMode("ready");
        void asyncResource.retry();
    });
    byId<HTMLElement>("clear-cache").addEventListener("click", () => asyncResource.clearCache());
    byId<HTMLElement>("refresh-cache").addEventListener("click", () => {
        asyncResource.setMode("ready");
        void asyncResource.load();
    });
    renderCacheStats();
    renderTelemetryStats();
    cleanupPage = () => {
        unsubscribeAsync();
        unsubscribeCache();
        unsubscribeTelemetry();
        asyncResource.resource.dispose();
    };
};

const renderUsers = (): void => {
    pageRoot.innerHTML = `
      <aui-page title="Users" description="Manage operators, reviewers and service identities.">
        <div class="web-page-intro"><span class="web-eyebrow">IDENTITY / USERS</span><span class="web-intro-copy">Role-based access with explicit lifecycle states.</span></div>
        ${stateControls("users")}
        <aui-filter-bar><aui-input id="users-search" aria-label="Search users" placeholder="Search name or email"></aui-input><aui-select id="users-role" aria-label="Filter users by role"></aui-select><aui-select id="users-status" aria-label="Filter users by status"></aui-select><aui-status-tag slot="actions" status="success">RBAC ENABLED</aui-status-tag></aui-filter-bar>
        <output class="web-selection" id="users-selection" data-selected-count="0">0 SELECTED · 15 USERS</output>
        <aui-data-grid id="users-grid" mobile-cards selectable empty-label="NO USERS MATCH THE CURRENT FILTERS" error-label="FAILED TO LOAD USERS" permission-denied-label="YOU DO NOT HAVE ACCESS TO USER DIRECTORY"><span slot="permission">Ask an administrator to grant directory.read.</span></aui-data-grid>
        <div id="users-pagination-wrap"><aui-pagination id="users-pagination"></aui-pagination></div>
      </aui-page>`;
    const grid = getGrid("users-grid");
    grid.columns = [
        { key: "name", label: "User", sortable: true },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" },
        { key: "lastSeen", label: "Last seen" },
    ];
    grid.pageSize = 0;
    grid.mobileCards = true;
    const pagination = getPagination("users-pagination");
    pagination.pageSize = 5;
    let state: DataState = "ready";
    let page = 1;
    let query = "";
    let role = "";
    let status = "";
    const filtered = (): Row[] =>
        users.filter(
            (row) =>
                (!query || `${row.name} ${row.email}`.toLowerCase().includes(query)) &&
                (!role || row.role === role) &&
                (!status || row.status === status),
        );
    const render = () => {
        const rows = filtered();
        const pages = Math.max(1, Math.ceil(rows.length / 5));
        page = Math.min(page, pages);
        const visible = rows.slice((page - 1) * 5, page * 5);
        setGridState(grid, state, visible, {
            empty: "NO USERS MATCH THE CURRENT FILTERS",
            loading: "LOADING USER DIRECTORY...",
            error: "FAILED TO LOAD USERS",
            permission: "YOU DO NOT HAVE ACCESS TO USER DIRECTORY",
        });
        pagination.page = page;
        pagination.totalPages = pages;
        pagination.total = rows.length;
        byId<HTMLElement>("users-pagination-wrap").classList.toggle(
            "is-hidden",
            state !== "ready" || rows.length === 0,
        );
        const output = getOutput("users-selection");
        output.textContent = `${grid.selectedKeys?.length ?? 0} SELECTED · ${rows.length} USERS`;
        output.dataset.selectedCount = String(grid.selectedKeys?.length ?? 0);
    };
    configureSelect("users-role", [
        { value: "", label: "ALL ROLES" },
        ...["Owner", "Operator", "Viewer", "Auditor"].map((value) => ({ value, label: value })),
    ]);
    configureSelect("users-status", [
        { value: "", label: "ALL STATUS" },
        ...["ACTIVE", "INVITED", "SUSPENDED"].map((value) => ({ value, label: value })),
    ]);
    byId<HTMLElement>("users-search").addEventListener("aui-input", (event) => {
        query = (event as CustomEvent<{ value: string }>).detail.value.trim().toLowerCase();
        page = 1;
        render();
    });
    getSelect("users-role").addEventListener("aui-change", (event) => {
        role = (event as CustomEvent<{ value: string }>).detail.value;
        page = 1;
        render();
    });
    getSelect("users-status").addEventListener("aui-change", (event) => {
        status = (event as CustomEvent<{ value: string }>).detail.value;
        page = 1;
        render();
    });
    pagination.addEventListener("aui-page-change", (event) => {
        page = (event as CustomEvent<{ page: number }>).detail.page;
        render();
    });
    grid.addEventListener("aui-selection-change", render);
    grid.addEventListener("aui-retry", () => {
        state = "ready";
        render();
    });
    const unsubscribe = bindStateControls("users", (next) => {
        state = next;
        render();
    });
    render();
    cleanupPage = () => unsubscribe();
};

const renderChannels = (): void => {
    pageRoot.innerHTML = `
      <aui-page title="Channels" description="Route traffic across regions, protocols and operational owners.">
        <div class="web-page-intro"><span class="web-eyebrow">RUNTIME / CHANNELS</span><span class="web-intro-copy">Health, ownership and bulk actions remain visible at every breakpoint.</span></div>
        ${stateControls("channels")}
        <aui-filter-bar><aui-input id="channels-search" aria-label="Search channels" placeholder="Search channels"></aui-input><aui-select id="channels-region" aria-label="Filter channels by region"></aui-select><aui-select id="channels-protocol" aria-label="Filter channels by protocol"></aui-select><aui-status-tag slot="actions" status="info">10 CHANNELS</aui-status-tag></aui-filter-bar>
        <output class="web-selection" id="channels-selection" data-selected-count="0">0 SELECTED · 10 CHANNELS</output>
        <aui-data-grid id="channels-grid" mobile-cards selectable empty-label="NO CHANNELS MATCH THE CURRENT FILTERS" error-label="FAILED TO LOAD CHANNELS" permission-denied-label="CHANNEL INVENTORY ACCESS REQUIRED"><span slot="permission">Request channels.read from the platform owner.</span></aui-data-grid>
        <div id="channels-pagination-wrap"><aui-pagination id="channels-pagination"></aui-pagination></div>
      </aui-page>`;
    const grid = getGrid("channels-grid");
    grid.columns = [
        { key: "name", label: "Channel", sortable: true },
        { key: "protocol", label: "Protocol" },
        { key: "region", label: "Region" },
        { key: "status", label: "Status" },
        { key: "owner", label: "Owner" },
    ];
    grid.pageSize = 0;
    grid.mobileCards = true;
    const pagination = getPagination("channels-pagination");
    pagination.pageSize = 5;
    let state: DataState = "ready";
    let page = 1;
    let query = "";
    let region = "";
    let protocol = "";
    const filtered = (): Row[] =>
        channels.filter(
            (row) =>
                (!query || `${row.name} ${row.owner}`.toLowerCase().includes(query)) &&
                (!region || row.region === region) &&
                (!protocol || row.protocol === protocol),
        );
    const render = () => {
        const rows = filtered();
        const pages = Math.max(1, Math.ceil(rows.length / 5));
        page = Math.min(page, pages);
        const visible = rows.slice((page - 1) * 5, page * 5);
        setGridState(grid, state, visible, {
            empty: "NO CHANNELS MATCH THE CURRENT FILTERS",
            loading: "LOADING CHANNEL INVENTORY...",
            error: "FAILED TO LOAD CHANNELS",
            permission: "CHANNEL INVENTORY ACCESS REQUIRED",
        });
        pagination.page = page;
        pagination.totalPages = pages;
        pagination.total = rows.length;
        byId<HTMLElement>("channels-pagination-wrap").classList.toggle(
            "is-hidden",
            state !== "ready" || rows.length === 0,
        );
        const output = getOutput("channels-selection");
        output.textContent = `${grid.selectedKeys?.length ?? 0} SELECTED · ${rows.length} CHANNELS`;
        output.dataset.selectedCount = String(grid.selectedKeys?.length ?? 0);
    };
    configureSelect("channels-region", [
        { value: "", label: "ALL REGIONS" },
        ...["cn-east-1", "cn-north-1", "cn-south-1", "us-west-1"].map((value) => ({
            value,
            label: value,
        })),
    ]);
    configureSelect("channels-protocol", [
        { value: "", label: "ALL PROTOCOLS" },
        ...["HTTPS", "KAFKA", "S3", "OTLP", "SFTP"].map((value) => ({ value, label: value })),
    ]);
    byId<HTMLElement>("channels-search").addEventListener("aui-input", (event) => {
        query = (event as CustomEvent<{ value: string }>).detail.value.trim().toLowerCase();
        page = 1;
        render();
    });
    getSelect("channels-region").addEventListener("aui-change", (event) => {
        region = (event as CustomEvent<{ value: string }>).detail.value;
        page = 1;
        render();
    });
    getSelect("channels-protocol").addEventListener("aui-change", (event) => {
        protocol = (event as CustomEvent<{ value: string }>).detail.value;
        page = 1;
        render();
    });
    pagination.addEventListener("aui-page-change", (event) => {
        page = (event as CustomEvent<{ page: number }>).detail.page;
        render();
    });
    grid.addEventListener("aui-selection-change", render);
    grid.addEventListener("aui-retry", () => {
        state = "ready";
        render();
    });
    const unsubscribe = bindStateControls("channels", (next) => {
        state = next;
        render();
    });
    render();
    cleanupPage = () => unsubscribe();
};

const renderLogs = (): void => {
    pageRoot.innerHTML = `
      <aui-page title="Usage Logs" description="Inspect request activity, warnings and operational audit signals.">
        <div class="web-page-intro"><span class="web-eyebrow">OBSERVABILITY / USAGE LOGS</span><span class="web-intro-copy">A dense log surface with the same async state contract as tables.</span></div>
        ${stateControls("logs")}
        <aui-filter-bar><aui-input id="logs-search" aria-label="Search usage logs" placeholder="Search message or service"></aui-input><aui-select id="logs-level" aria-label="Filter logs by level"></aui-select><aui-select id="logs-range" aria-label="Usage log time range"></aui-select><aui-status-tag slot="actions" status="info">LIVE STREAM</aui-status-tag></aui-filter-bar>
        <div id="logs-ready-view" class="web-log-frame"><aui-log-viewer id="logs-viewer" follow></aui-log-viewer></div>
        <aui-data-grid id="logs-state-grid" empty-label="NO LOGS MATCH THE CURRENT FILTERS" error-label="FAILED TO LOAD USAGE LOGS" permission-denied-label="USAGE LOG ACCESS REQUIRED"><span slot="permission">Request observability.read from the security owner.</span></aui-data-grid>
        <div id="logs-pagination-wrap"><aui-pagination id="logs-pagination"></aui-pagination></div>
      </aui-page>`;
    const grid = getGrid("logs-state-grid");
    grid.columns = [
        { key: "message", label: "MESSAGE" },
        { key: "service", label: "SERVICE" },
        { key: "level", label: "LEVEL" },
    ];
    grid.pageSize = 0;
    const viewer = byId<LogViewer>("logs-viewer");
    const pagination = getPagination("logs-pagination");
    pagination.pageSize = 6;
    let state: DataState = "ready";
    let page = 1;
    let query = "";
    let level = "";
    const filtered = (): Row[] =>
        usageLogs.filter(
            (row) =>
                (!query ||
                    `${row.message} ${row.service} ${row.detail}`.toLowerCase().includes(query)) &&
                (!level || row.level === level),
        );
    const render = () => {
        const rows = filtered();
        const pages = Math.max(1, Math.ceil(rows.length / 6));
        page = Math.min(page, pages);
        const visible = rows.slice((page - 1) * 6, page * 6);
        const ready = state === "ready";
        byId<HTMLElement>("logs-ready-view").classList.toggle("is-hidden", !ready);
        setGridState(grid, state, visible, {
            empty: "NO LOGS MATCH THE CURRENT FILTERS",
            loading: "LOADING USAGE LOGS...",
            error: "FAILED TO LOAD USAGE LOGS",
            permission: "USAGE LOG ACCESS REQUIRED",
        });
        grid.classList.toggle("is-hidden", ready);
        viewer.entries = ready
            ? visible.map((row) => ({
                  time: String(row.time),
                  level: String(row.level),
                  message: `${row.message} · ${row.service}`,
                  meta: String(row.detail),
              }))
            : [];
        pagination.page = page;
        pagination.totalPages = pages;
        pagination.total = rows.length;
        byId<HTMLElement>("logs-pagination-wrap").classList.toggle(
            "is-hidden",
            state !== "ready" || rows.length === 0,
        );
    };
    configureSelect("logs-level", [
        { value: "", label: "ALL LEVELS" },
        { value: "info", label: "INFO" },
        { value: "warn", label: "WARN" },
        { value: "error", label: "ERROR" },
    ]);
    configureSelect(
        "logs-range",
        [
            { value: "24h", label: "LAST 24 HOURS" },
            { value: "7d", label: "LAST 7 DAYS" },
            { value: "30d", label: "LAST 30 DAYS" },
        ],
        "24h",
    );
    byId<HTMLElement>("logs-search").addEventListener("aui-input", (event) => {
        query = (event as CustomEvent<{ value: string }>).detail.value.trim().toLowerCase();
        page = 1;
        render();
    });
    getSelect("logs-level").addEventListener("aui-change", (event) => {
        level = (event as CustomEvent<{ value: string }>).detail.value;
        page = 1;
        render();
    });
    pagination.addEventListener("aui-page-change", (event) => {
        page = (event as CustomEvent<{ page: number }>).detail.page;
        render();
    });
    grid.addEventListener("aui-retry", () => {
        state = "ready";
        render();
    });
    const unsubscribe = bindStateControls("logs", (next) => {
        state = next;
        render();
    });
    render();
    cleanupPage = () => unsubscribe();
};

const renderPage = (page: WebPage): void => {
    cleanupPage();
    cleanupPage = () => undefined;
    const item = navItems.find((entry) => entry.id === page) ?? navItems[0];
    routeLabel.textContent = item.title;
    document
        .querySelectorAll<HTMLElement>("[data-route]")
        .forEach((button) => button.toggleAttribute("aria-current", button.dataset.route === page));
    if (page === "users") renderUsers();
    else if (page === "channels") renderChannels();
    else if (page === "logs") renderLogs();
    else renderOverview();
};

document
    .querySelectorAll<HTMLElement>("[data-route]")
    .forEach((button) =>
        button.addEventListener("click", () => renderPage(button.dataset.route as WebPage)),
    );
renderPage("overview");
window.addEventListener("pagehide", () => cleanupPage(), { once: true });
