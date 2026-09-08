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
import "@chaos_team/blbui-core/styles.css";

function App() {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [toasts, setToasts] = useState([{ id: "parity", title: "PARITY READY", message: "React fixture is synchronized.", variant: "success" as const, duration: 0 }]);
    return (
        <div className="aui-root" style={{ minHeight: "100vh", padding: 32 }}>
            <AdminPage title="Channels" description="Cross-framework operator playground.">
                <AdminTabs
                    items={fixture.tabs}
                    active="all"
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
                        <tbody>{fixture.rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.status}</td><td>{row.region}</td><td>{query || "—"}</td></tr>)}</tbody>
                    </table>
                </AdminTable>
                <AdminPagination page={page} totalPages={3} onPageChange={setPage} />
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
