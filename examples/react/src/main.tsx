import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
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
} from "@chaos_team/blbui-react";
import {
    AdminAdvancedTable,
    AdminFunnelChart,
    AdminGanttChart,
    AdminHeatmap,
} from "@chaos_team/blbui-business-react";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import { createParityAsyncResource, parityAsyncState } from "../../parity/data-resource";
import "@chaos_team/blbui-core/styles.css";
import "@chaos_team/blbui-business/styles.css";

registerBusinessElements();

function App() {
    const contract = fixture.parityContract.assertions;
    const [activeTab, setActiveTab] = useState(fixture.tabs[0].id);
    const [query, setQuery] = useState(contract.initialQuery);
    const [open, setOpen] = useState(contract.initialDialog);
    const [page, setPage] = useState(contract.initialPage);
    const [retryCount, setRetryCount] = useState(0);
    const asyncResource = useMemo(() => createParityAsyncResource(), []);
    const asyncMounts = useRef(0);
    const asyncLoaded = useRef(false);
    const [asyncSnapshot, setAsyncSnapshot] = useState(() => asyncResource.resource.getSnapshot());
    const [cacheEvent, setCacheEvent] = useState("none");
    const [cacheStats, setCacheStats] = useState(() => asyncResource.resource.getCacheStats());
    const asyncState = parityAsyncState(asyncSnapshot.status);
    useEffect(() => {
        asyncMounts.current += 1;
        const unsubscribe = asyncResource.resource.subscribe(setAsyncSnapshot);
        const unsubscribeCache = asyncResource.resource.subscribeCache((event) => {
            setCacheEvent(event.type);
            setCacheStats(asyncResource.resource.getCacheStats());
        });
        if (!asyncLoaded.current) {
            asyncLoaded.current = true;
            void asyncResource.load();
        }
        return () => {
            unsubscribe();
            unsubscribeCache();
            asyncMounts.current -= 1;
            queueMicrotask(() => {
                if (asyncMounts.current === 0) asyncResource.resource.dispose();
            });
        };
    }, [asyncResource]);
    const [toasts, setToasts] = useState([
        {
            id: "parity",
            title: "PARITY READY",
            message: "React fixture is synchronized.",
            variant: "success" as const,
            duration: 0,
        },
    ]);
    const normalizedQuery = query.trim().toLowerCase();
    const visibleRows = fixture.rows.filter((row) => {
        const matchesTab = activeTab === "all" || row.status === "ONLINE";
        const matchesQuery =
            !normalizedQuery ||
            [row.id, row.status, row.region].some((value) =>
                value.toLowerCase().includes(normalizedQuery),
            );
        return matchesTab && matchesQuery;
    });
    return (
        <div
            className="aui-root"
            style={{ minHeight: "100vh" }}
            data-parity-query={query}
            data-parity-page={page}
            data-parity-dialog={String(open)}
            data-parity-active-tab={activeTab}
            data-parity-async-state={asyncState}
            data-parity-retry-count={retryCount}
            data-parity-cache-event={cacheEvent}
            data-parity-cache-hits={cacheStats.hits}
            data-parity-cache-stale-hits={cacheStats.staleHits}
            data-parity-cache-misses={cacheStats.misses}
            data-parity-cache-bypasses={cacheStats.bypasses}
            data-parity-cache-writes={cacheStats.writes}
            data-parity-cache-invalidations={cacheStats.invalidations}
            data-parity-cache-revalidations={cacheStats.revalidations}
        >
            <AdminShell
                sidebarWidth="200px"
                headerHeight="56px"
                sidebar={
                    <div style={{ padding: 20, font: "700 12px var(--aui-font-mono)" }}>BLBUI</div>
                }
                header={
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            padding: "0 20px",
                            font: "700 11px var(--aui-font-mono)",
                        }}
                    >
                        <span>CONTROL PLANE</span>
                        <span style={{ color: "var(--aui-success)" }}>CONNECTED</span>
                    </div>
                }
            >
                <div style={{ padding: 32 }}>
                    <AdminPage title="Channels" description="Cross-framework operator playground.">
                        <AdminTabs
                            items={fixture.tabs}
                            active={activeTab}
                            onTabChange={setActiveTab}
                        />
                        <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
                            <AdminInput
                                value={query}
                                placeholder="Search channels"
                                onValueChange={setQuery}
                            />
                            <AdminButton variant="primary" onClick={() => setOpen(true)}>
                                Create channel
                            </AdminButton>
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
                                    {visibleRows.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.id}</td>
                                            <td>{row.status}</td>
                                            <td>{row.region}</td>
                                            <td>{query || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AdminTable>
                        <section aria-label="Async data contract" style={{ marginTop: 20 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <AdminButton
                                    onClick={() => {
                                        asyncResource.setMode("error");
                                        void asyncResource.load();
                                    }}
                                >
                                    Simulate data error
                                </AdminButton>
                                <AdminButton
                                    onClick={() => {
                                        asyncResource.setMode("permission-denied");
                                        void asyncResource.load();
                                    }}
                                >
                                    Simulate permission denial
                                </AdminButton>
                                <AdminButton
                                    onClick={() => {
                                        asyncResource.setMode("ready");
                                        void asyncResource.load();
                                    }}
                                >
                                    Recover data
                                </AdminButton>
                            </div>
                            <AdminTable
                                id="async-table"
                                loading={asyncSnapshot.status === "loading"}
                                error={asyncState === "error"}
                                permissionDenied={asyncState === "permission-denied"}
                                onRetry={() => {
                                    setRetryCount((count) => count + 1);
                                    asyncResource.setMode("ready");
                                    void asyncResource.retry();
                                }}
                            >
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Async contract row</td>
                                            <td>{retryCount}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <span slot="permission">Request access to continue.</span>
                            </AdminTable>
                            <section aria-label="Cache observability" id="cache-observability">
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        marginTop: 8,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <AdminButton
                                        onClick={() => {
                                            asyncResource.setMode("ready");
                                            void asyncResource.load();
                                        }}
                                    >
                                        Refresh cached data
                                    </AdminButton>
                                    <AdminButton onClick={asyncResource.clearCache}>
                                        Clear cache
                                    </AdminButton>
                                </div>
                                <output
                                    id="cache-event"
                                    style={{
                                        display: "block",
                                        marginTop: 8,
                                        overflowWrap: "anywhere",
                                    }}
                                    data-parity-cache-event={cacheEvent}
                                >
                                    Cache event: {cacheEvent}
                                </output>
                                <output
                                    id="cache-stats"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                                        gap: 4,
                                        minWidth: 0,
                                        marginTop: 8,
                                    }}
                                    data-parity-cache-entries={cacheStats.entries}
                                    data-parity-cache-hits={cacheStats.hits}
                                    data-parity-cache-stale-hits={cacheStats.staleHits}
                                    data-parity-cache-misses={cacheStats.misses}
                                    data-parity-cache-bypasses={cacheStats.bypasses}
                                    data-parity-cache-writes={cacheStats.writes}
                                    data-parity-cache-invalidations={cacheStats.invalidations}
                                    data-parity-cache-revalidations={cacheStats.revalidations}
                                >
                                    {[
                                        ["entries", cacheStats.entries],
                                        ["hits", cacheStats.hits],
                                        ["stale", cacheStats.staleHits],
                                        ["misses", cacheStats.misses],
                                        ["bypasses", cacheStats.bypasses],
                                        ["writes", cacheStats.writes],
                                        ["invalidations", cacheStats.invalidations],
                                        ["revalidations", cacheStats.revalidations],
                                    ].map(([label, value]) => (
                                        <span
                                            key={label}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                minWidth: 0,
                                                padding: "4px 6px",
                                                border: "1px solid var(--aui-border)",
                                                color: "var(--aui-text-secondary)",
                                                font: "10px/1.25 var(--aui-font-mono)",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <strong style={{ color: "var(--aui-text-primary)" }}>
                                                {value}
                                            </strong>
                                            {label}
                                        </span>
                                    ))}
                                </output>
                            </section>
                        </section>
                        <AdminAdvancedTable
                            id="business-table"
                            columns={fixture.business.columns}
                            rows={fixture.business.rows}
                            selectable
                            onSelectionChange={(keys) => {
                                document
                                    .querySelector("[data-parity-business-selection]")
                                    ?.setAttribute(
                                        "data-parity-business-selection",
                                        String(keys.length),
                                    );
                            }}
                        />
                        <section
                            aria-label="Business charts"
                            style={{ marginTop: 20, display: "grid", gap: 12 }}
                        >
                            <AdminHeatmap
                                data={[
                                    { x: "00", y: "API", value: 18 },
                                    { x: "06", y: "API", value: 34 },
                                    { x: "12", y: "API", value: 72 },
                                    { x: "18", y: "API", value: 44 },
                                    { x: "00", y: "EDGE", value: 42 },
                                    { x: "06", y: "EDGE", value: 58 },
                                    { x: "12", y: "EDGE", value: 88 },
                                    { x: "18", y: "EDGE", value: 64 },
                                ]}
                                label="Request density"
                            />
                            <AdminFunnelChart
                                data={[
                                    { label: "DISCOVERED", value: 1000 },
                                    { label: "CONFIGURED", value: 720 },
                                    { label: "HEALTHY", value: 510 },
                                    { label: "PRODUCTION", value: 340 },
                                ]}
                                label="Channel funnel"
                            />
                            <AdminGanttChart
                                tasks={[
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
                                ]}
                                min={0}
                                max={100}
                                label="Release plan"
                            />
                        </section>
                        <output data-parity-business-selection="0">Business selection: 0</output>
                        <AdminPagination
                            page={page}
                            totalPages={contract.totalPages}
                            onPageChange={setPage}
                        />
                        <AdminToastManager items={toasts} onChange={setToasts} />
                        <AdminDialog open={open} title="Create channel" onOpenChange={setOpen}>
                            <p>Page {page}: confirm the new channel configuration.</p>
                            <AdminButton onClick={() => setOpen(false)}>Close</AdminButton>
                        </AdminDialog>
                    </AdminPage>
                </div>
            </AdminShell>
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
