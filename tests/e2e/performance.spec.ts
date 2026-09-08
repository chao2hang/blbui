import { expect, test } from "@playwright/test";

test.describe("BLBUI long-list performance contract", () => {
    test("keeps a 10k-row virtual DataGrid within render and scroll budgets", async ({ page }) => {
        await page.goto("/");
        const result = await page.evaluate(async () => {
            const host = document.createElement("div");
            host.className = "aui-root";
            const grid = document.createElement("aui-data-grid") as HTMLElement & {
                columns: unknown[];
                rows: Array<Record<string, unknown>>;
                virtual: boolean;
                mobileCards: boolean;
                pageSize: number;
                rowHeight: number;
                updateComplete: Promise<boolean>;
            };
            grid.columns = [
                { key: "id", label: "ID" },
                { key: "status", label: "Status" },
                { key: "region", label: "Region" },
            ];
            grid.virtual = true;
            grid.mobileCards = false;
            grid.pageSize = 0;
            grid.rowHeight = 36;
            grid.rows = Array.from({ length: 10_000 }, (_, index) => ({
                id: `service-${index}`,
                status: index % 2 ? "ONLINE" : "DEGRADED",
                region: `region-${index % 10}`,
            }));
            host.append(grid);
            document.body.append(host);
            const start = performance.now();
            await grid.updateComplete;
            const renderMs = performance.now() - start;
            const scroller = grid.shadowRoot?.querySelector<HTMLElement>(".scroll");
            const renderedRows = grid.shadowRoot?.querySelectorAll("tbody tr[data-row-key]").length ?? 0;
            const rowCount = grid.shadowRoot?.querySelector("table")?.getAttribute("aria-rowcount");
            if (!scroller) throw new Error("virtual DataGrid scroller is missing");
            const scrollStart = performance.now();
            scroller.scrollTop = 8_000;
            scroller.dispatchEvent(new Event("scroll"));
            await grid.updateComplete;
            const scrollMs = performance.now() - scrollStart;
            const themeStart = performance.now();
            document.documentElement.dataset.auiTheme = "glass";
            document.documentElement.dataset.auiMode = "dark";
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const themeMs = performance.now() - themeStart;
            const frameStart = performance.now();
            let frames = 0;
            await new Promise<void>((resolve) => {
                const tick = () => {
                    frames += 1;
                    if (performance.now() - frameStart >= 500) resolve();
                    else requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
            host.remove();
            return { renderMs, scrollMs, themeMs, renderedRows, rowCount: Number(rowCount), fps: frames / 0.5 };
        });

        expect(result.rowCount).toBe(10_000);
        expect(result.renderedRows).toBeLessThanOrEqual(30);
        expect(result.renderMs).toBeLessThan(1_000);
        expect(result.scrollMs).toBeLessThan(500);
        expect(result.themeMs).toBeLessThan(500);
        expect(result.fps).toBeGreaterThan(20);
    });
});
