import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
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
} from "@chaos_team/blbui-react";
import { AdminAdvancedTable } from "@chaos_team/blbui-business-react";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import "@chaos_team/blbui-core/styles.css";
import "@chaos_team/blbui-business/styles.css";

registerBusinessElements();

function App() {
    const contract = fixture.parityContract.assertions;
    const [activeTab, setActiveTab] = useState(fixture.tabs[0].id);
    const [query, setQuery] = useState(contract.initialQuery);
    const [open, setOpen] = useState(contract.initialDialog);
    const [page, setPage] = useState(contract.initialPage);
    const [asyncState, setAsyncState] = useState<"ready" | "error" | "permission-denied">("ready");
    const [retryCount, setRetryCount] = useState(0);
    const [toasts, setToasts] = useState([{ id: "parity", title: "PARITY READY", message: "React fixture is synchronized.", variant: "success" as const, duration: 0 }]);
    const normalizedQuery = query.trim().toLowerCase();
    const visibleRows = fixture.rows.filter((row) => {
        const matchesTab = activeTab === "all" || row.status === "ONLINE";
        const matchesQuery = !normalizedQuery || [row.id, row.status, row.region].some((value) => value.toLowerCase().includes(normalizedQuery));
        return matchesTab && matchesQuery;
    });
    return (
        <div className="aui-root" style={{ minHeight: "100vh", padding: 32 }} data-parity-query={query} data-parity-page={page} data-parity-dialog={String(open)} data-parity-active-tab={activeTab} data-parity-async-state={asyncState} data-parity-retry-count={retryCount}>
            <AdminPage title="Channels" description="Cross-framework operator playground.">
                <AdminTabs
                    items={fixture.tabs}
                    active={activeTab}
                    onTabChange={setActiveTab}
                />
                <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
                    <AdminInput value={query} placeholder="Search channels" onValueChange={setQuery} />
                    <AdminButton variant="primary" onClick={() => setOpen(true)}>
                        Create channel
                    </AdminButton>
                </div>
                <AdminTable>
                    <table>
                        <thead><tr><th>Name</th><th>Status</th><th>Region</th><th>Query</th></tr></thead>
                        <tbody>{visibleRows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.status}</td><td>{row.region}</td><td>{query || "—"}</td></tr>)}</tbody>
                    </table>
                </AdminTable>
                <section aria-label="Async data contract" style={{ marginTop: 20 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <AdminButton onClick={() => setAsyncState("error")}>Simulate data error</AdminButton>
                        <AdminButton onClick={() => setAsyncState("permission-denied")}>Simulate permission denial</AdminButton>
                        <AdminButton onClick={() => setAsyncState("ready")}>Recover data</AdminButton>
                    </div>
                    <AdminTable
                        id="async-table"
                        error={asyncState === "error"}
                        permissionDenied={asyncState === "permission-denied"}
                        onRetry={() => {
                            setRetryCount((count) => count + 1);
                            setAsyncState("ready");
                        }}
                    >
                        <table><tbody><tr><td>Async contract row</td><td>{retryCount}</td></tr></tbody></table>
                        <span slot="permission">Request access to continue.</span>
                    </AdminTable>
                </section>
                <AdminAdvancedTable
                    id="business-table"
                    columns={fixture.business.columns}
                    rows={fixture.business.rows}
                    selectable
                    onSelectionChange={(keys) => {
                        document.querySelector("[data-parity-business-selection]")?.setAttribute("data-parity-business-selection", String(keys.length));
                    }}
                />
                <output data-parity-business-selection="0">Business selection: 0</output>
                <AdminPagination page={page} totalPages={contract.totalPages} onPageChange={setPage} />
                <AdminToastManager items={toasts} onChange={setToasts} />
                <AdminDialog open={open} title="Create channel" onOpenChange={setOpen}>
                    <p>Page {page}: confirm the new channel configuration.</p>
                    <AdminButton onClick={() => setOpen(false)}>Close</AdminButton>
                </AdminDialog>
            </AdminPage>
        </div>
    );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
