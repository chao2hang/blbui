/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminFunnelChart, AdminGanttChart, AdminHeatmap } from "../business-react/src/index";
import { registerBusinessElements } from "../business/src/register";

type BusinessElement = HTMLElement & {
    data?: unknown;
    tasks?: unknown;
    updateComplete?: Promise<unknown>;
};

afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
});

describe("business React chart bindings", () => {
    it("passes object props through DOM properties and forwards heatmap events", async () => {
        registerBusinessElements();
        const data = [
            { x: "00", y: "API", value: 18 },
            { x: "06", y: "API", value: 34 },
        ];
        const onPoint = vi.fn();
        const view = render(<AdminHeatmap data={data} label="Request density" onPoint={onPoint} />);
        const element = view.container.querySelector("aui-heatmap") as BusinessElement;

        await waitFor(() => expect(element.data).toBe(data));
        await element.updateComplete;
        element.shadowRoot?.querySelector<HTMLButtonElement>('[role="gridcell"]')?.click();
        expect(onPoint).toHaveBeenCalledWith({ index: 0, point: data[0] });

        const nextData = [{ x: "12", y: "EDGE", value: 72 }];
        view.rerender(<AdminHeatmap data={nextData} label="Edge density" onPoint={onPoint} />);
        await waitFor(() => expect(element.data).toBe(nextData));
    });

    it("keeps funnel callbacks synchronized after rerender and removes them on unmount", async () => {
        registerBusinessElements();
        const data = [
            { label: "DISCOVERED", value: 100 },
            { label: "ACTIVE", value: 40 },
        ];
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();
        const view = render(<AdminFunnelChart data={data} onPoint={firstHandler} />);
        const element = view.container.querySelector("aui-funnel-chart") as BusinessElement;

        await waitFor(() => expect(element.data).toBe(data));
        await element.updateComplete;
        element.shadowRoot?.querySelector<HTMLButtonElement>(".bar")?.click();
        expect(firstHandler).toHaveBeenCalledWith({ index: 0, point: data[0] });

        view.rerender(<AdminFunnelChart data={data} onPoint={secondHandler} />);
        await waitFor(() => expect(secondHandler).not.toHaveBeenCalled());
        element.shadowRoot?.querySelector<HTMLButtonElement>(".bar")?.click();
        expect(firstHandler).toHaveBeenCalledTimes(1);
        expect(secondHandler).toHaveBeenCalledWith({ index: 0, point: data[0] });

        view.unmount();
        element.dispatchEvent(
            new CustomEvent("aui-chart-point", {
                detail: { index: 0, point: data[0] },
            }),
        );
        expect(secondHandler).toHaveBeenCalledTimes(1);
    });

    it("passes gantt task arrays through DOM properties and forwards task events", async () => {
        registerBusinessElements();
        const tasks = [
            { id: "schema", label: "Schema", start: 0, end: 25, status: "done" as const },
            { id: "rollout", label: "Rollout", start: 20, end: 80, status: "active" as const },
        ];
        const onTask = vi.fn();
        const view = render(<AdminGanttChart tasks={tasks} onTask={onTask} min={0} max={100} />);
        const element = view.container.querySelector("aui-gantt-chart") as BusinessElement;

        await waitFor(() => expect(element.tasks).toBe(tasks));
        await element.updateComplete;
        element.shadowRoot?.querySelector<HTMLButtonElement>(".task")?.click();
        expect(onTask).toHaveBeenCalledWith({ id: "schema", task: tasks[0] });
    });
});
