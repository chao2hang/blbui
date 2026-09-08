/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html, svg } from "lit";
import { AdminElement } from "@chaos_team/blbui-core";
import { normalizeGaugeValue, normalizePieData } from "./chart-adapters";

export interface AdminMetricItem {
    label: string;
    value: string;
    unit?: string;
    trend?: string;
    tone?: "default" | "success" | "danger" | "warning";
}

export class AdminMetricCardElement extends AdminElement {
    static properties = {
        label: { type: String },
        value: { type: String },
        unit: { type: String },
        trend: { type: String },
        tone: { type: String, reflect: true },
    };
    static styles = css`
        :host {
            display: block;
        }
        .card {
            min-height: 126px;
            padding: 15px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        .label {
            color: var(--aui-text-secondary);
            font: 10px/1 var(--aui-font-mono);
            letter-spacing: 0.13em;
            text-transform: uppercase;
        }
        .value {
            margin-top: 24px;
            color: var(--aui-text-primary);
            font: 300 30px/1 var(--aui-font-mono);
            font-variant-numeric: tabular-nums;
        }
        .unit {
            margin-left: 5px;
            color: var(--aui-text-muted);
            font-size: 11px;
        }
        .trend {
            margin-top: 8px;
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
        }
        :host([tone="success"]) .trend {
            color: var(--aui-success);
        }
        :host([tone="danger"]) .trend {
            color: var(--aui-danger);
        }
        :host([tone="warning"]) .trend {
            color: var(--aui-warning);
        }
    `;
    label = "";
    value = "";
    unit = "";
    trend = "";
    tone = "default";
    render() {
        return html`<div class="card">
            <div class="label">${this.label}</div>
            <div class="value">${this.value}<span class="unit">${this.unit}</span></div>
            ${this.trend ? html`<div class="trend">${this.trend}</div>` : null}
        </div>`;
    }
}

export class AdminMetricGridElement extends AdminElement {
    static properties = { items: { attribute: false }, columns: { type: Number } };
    static styles = css`
        :host {
            display: block;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(var(--aui-metric-columns, 4), minmax(0, 1fr));
            gap: 12px;
        }
        @media (max-width: 900px) {
            .grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
        @media (max-width: 520px) {
            .grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    items: AdminMetricItem[] = [];
    columns = 4;
    render() {
        return html`<div class="grid" style=${`--aui-metric-columns:${this.columns}`}>
            ${this.items.map(
                (item) =>
                    html`<aui-metric-card
                        label=${item.label}
                        value=${item.value}
                        unit=${item.unit ?? ""}
                        trend=${item.trend ?? ""}
                        tone=${item.tone ?? "default"}
                    ></aui-metric-card>`,
            )}
        </div>`;
    }
}

export class AdminBarChartElement extends AdminElement {
    static properties = {
        data: { attribute: false },
        height: { type: String },
        label: { type: String },
        showTooltip: { type: Boolean, attribute: "show-tooltip" },
    };
    static styles = css`
        :host {
            display: block;
        }
        .chart {
            position: relative;
            min-height: var(--aui-bar-height, 220px);
            display: flex;
            align-items: end;
            gap: 8px;
            padding: 16px 12px 24px;
            border: 1px solid var(--aui-border);
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 38px,
                var(--aui-grid-line-strong) 39px
            );
        }
        .bar-wrap {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: end;
            gap: 7px;
        }
        .bar {
            width: 100%;
            max-width: 38px;
            min-height: 3px;
            background: var(--aui-chart-bar, var(--aui-border-hover));
            cursor: pointer;
        }
        .bar:focus-visible {
            outline: 2px solid var(--aui-focus);
            outline-offset: 3px;
        }
        .bar[data-peak="true"] {
            background: var(--aui-text-primary);
        }
        .label {
            color: var(--aui-text-muted);
            font: 9px/1 var(--aui-font-mono);
        }
        .value {
            color: var(--aui-text-secondary);
            font: 9px/1 var(--aui-font-mono);
        }
        .tooltip {
            position: absolute;
            z-index: 2;
            top: 4px;
            left: 50%;
            width: max-content;
            max-width: min(220px, calc(100% - 8px));
            padding: 5px 7px;
            border: 1px solid var(--aui-border-hover);
            background: var(--aui-header);
            color: var(--aui-text-primary);
            font: 10px/1.25 var(--aui-font-mono);
            pointer-events: none;
            transform: translateX(-50%);
        }
    `;
    data: Array<{ label: string; value: number }> = [];
    height = "220px";
    label = "Chart";
    showTooltip = true;
    private activeIndex: number | null = null;

    private activate(index: number): void {
        if (!this.showTooltip) return;
        this.activeIndex = index;
        this.requestUpdate();
        this.dispatchDetail("aui-chart-point", { index, point: this.data[index] });
    }

    private clear(index: number): void {
        if (this.activeIndex !== index) return;
        this.activeIndex = null;
        this.requestUpdate();
    }

    render() {
        const max = Math.max(...this.data.map((item) => item.value), 1);
        const peak = max;
        const active = this.activeIndex === null ? undefined : this.data[this.activeIndex];
        return html`<div
            class="chart"
            style=${`--aui-bar-height:${this.height}`}
            role="group"
            aria-label=${this.label}
        >
            ${this.data.map(
                (item) =>
                    html`<div class="bar-wrap">
                        <span class="value">${item.value}</span
                        ><span
                            class="bar"
                            role="img"
                            tabindex=${this.showTooltip ? "0" : "-1"}
                            aria-label=${`${item.label}: ${item.value}`}
                            data-peak=${item.value === peak ? "true" : "false"}
                            style=${`height:${Math.max((item.value / max) * 78, 2)}%`}
                            @pointerenter=${() => this.activate(this.data.indexOf(item))}
                            @pointerleave=${() => this.clear(this.data.indexOf(item))}
                            @focus=${() => this.activate(this.data.indexOf(item))}
                            @blur=${() => this.clear(this.data.indexOf(item))}
                            @click=${() => this.activate(this.data.indexOf(item))}
                        ></span
                        ><span class="label">${item.label}</span>
                    </div>`,
            )}
            ${active ? html`<div class="tooltip" role="tooltip">${active.label}: ${active.value}</div>` : null}
        </div>`;
    }
}

export interface AdminLineChartPoint {
    label: string;
    value: number | null;
}

export class AdminLineChartElement extends AdminElement {
    static properties = {
        data: { attribute: false },
        height: { type: String },
        label: { type: String },
        color: { type: String },
        showPoints: { type: Boolean, attribute: "show-points" },
        showTooltip: { type: Boolean, attribute: "show-tooltip" },
    };
    static styles = css`
        :host {
            display: block;
        }
        .chart {
            position: relative;
            min-height: var(--aui-line-height, 220px);
            overflow: hidden;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        svg {
            display: block;
            width: 100%;
            height: 100%;
            min-height: inherit;
        }
        .grid-line {
            stroke: var(--aui-grid-line-strong);
            stroke-width: 0.5;
            vector-effect: non-scaling-stroke;
        }
        polyline {
            fill: none;
            stroke: var(--aui-line-color, var(--aui-primary));
            stroke-width: 2.5;
            vector-effect: non-scaling-stroke;
        }
        circle {
            fill: var(--aui-line-color, var(--aui-primary));
            stroke: var(--aui-surface);
            stroke-width: 1.5;
            vector-effect: non-scaling-stroke;
            cursor: pointer;
        }
        circle:focus-visible {
            stroke: var(--aui-focus);
            stroke-width: 2.5;
            outline: none;
        }
        circle.hit-only {
            fill: transparent;
            stroke: transparent;
        }
        .tooltip {
            position: absolute;
            z-index: 2;
            top: 7px;
            left: 50%;
            width: max-content;
            max-width: calc(100% - 16px);
            padding: 5px 7px;
            border: 1px solid var(--aui-border-hover);
            background: var(--aui-header);
            color: var(--aui-text-primary);
            font: 10px/1.25 var(--aui-font-mono);
            pointer-events: none;
            transform: translateX(-50%);
        }
        .labels {
            position: absolute;
            right: 10px;
            bottom: 7px;
            left: 10px;
            display: flex;
            justify-content: space-between;
            color: var(--aui-text-muted);
            font: 9px/1 var(--aui-font-mono);
        }
        .empty {
            display: grid;
            min-height: inherit;
            place-items: center;
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
    `;
    data: AdminLineChartPoint[] = [];
    height = "220px";
    label = "Line chart";
    color = "var(--aui-primary)";
    showPoints = true;
    showTooltip = true;
    private activeIndex: number | null = null;

    private activate(index: number): void {
        const point = this.data[index];
        if (!this.showTooltip || !point || point.value === null || !Number.isFinite(point.value)) return;
        this.activeIndex = index;
        this.requestUpdate();
        this.dispatchDetail("aui-chart-point", { index, point });
    }

    private clear(index: number): void {
        if (this.activeIndex !== index) return;
        this.activeIndex = null;
        this.requestUpdate();
    }

    render() {
        const values = this.data
            .map((point) => point.value)
            .filter(
                (value): value is number => typeof value === "number" && Number.isFinite(value),
            );
        if (!values.length)
            return html`<div
                class="chart"
                style=${`--aui-line-height:${this.height}`}
                role="img"
                aria-label=${this.label}
            >
                <div class="empty">No chart data</div>
            </div>`;
        let min = Math.min(...values, 0);
        let max = Math.max(...values, 0);
        if (min === max) {
            const padding = Math.max(Math.abs(min) * 0.1, 1);
            min -= padding;
            max += padding;
        }
        const range = max - min;
        const x = (index: number) =>
            this.data.length > 1 ? (index / (this.data.length - 1)) * 100 : 50;
        const y = (value: number) => 10 + ((max - value) / range) * 74;
        const segments: string[][] = [];
        let segment: string[] = [];
        this.data.forEach((point, index) => {
            if (point.value === null || !Number.isFinite(point.value)) {
                if (segment.length) segments.push(segment);
                segment = [];
                return;
            }
            segment.push(`${x(index)},${y(point.value)}`);
        });
        if (segment.length) segments.push(segment);
        const labels = this.data.filter(
            (_, index) => index === 0 || index === this.data.length - 1,
        );
        return html`<div
            class="chart"
            style=${`--aui-line-height:${this.height};--aui-line-color:${this.color}`}
            role="group"
            aria-label=${this.label}
        >
            ${svg`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden=${this.showTooltip ? "false" : "true"}>
                ${[20, 40, 60, 80].map((line) => svg`<line class="grid-line" x1="0" y1=${line} x2="100" y2=${line}></line>`)}
                ${segments.map((points) => svg`<polyline points=${points.join(" ")}></polyline>`)}
                ${this.data.map((point, index) => (point.value === null || !Number.isFinite(point.value) ? null : svg`<circle class=${this.showPoints ? "" : "hit-only"} cx=${x(index)} cy=${y(point.value)} r=${this.showPoints ? "2.2" : "4"} tabindex=${this.showTooltip ? "0" : "-1"} role="img" aria-label=${`${point.label}: ${point.value}`} @pointerenter=${() => this.activate(index)} @pointerleave=${() => this.clear(index)} @focus=${() => this.activate(index)} @blur=${() => this.clear(index)} @click=${() => this.activate(index)}></circle>`))}
            </svg>`}
            <div class="labels">${labels.map((point) => html`<span>${point.label}</span>`)}</div>
            ${this.activeIndex !== null && this.data[this.activeIndex]?.value !== null ? html`<div class="tooltip" role="tooltip">${this.data[this.activeIndex].label}: ${this.data[this.activeIndex].value}</div>` : null}
        </div>`;
    }
}

export interface AdminAreaChartPoint extends AdminLineChartPoint {}

function chartScale(data: AdminLineChartPoint[]): {
    min: number;
    max: number;
    range: number;
    x: (index: number) => number;
    y: (value: number) => number;
} | null {
    const values = data
        .map((point) => point.value)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    if (!values.length) return null;
    let min = Math.min(...values, 0);
    let max = Math.max(...values, 0);
    if (min === max) {
        const padding = Math.max(Math.abs(min) * 0.1, 1);
        min -= padding;
        max += padding;
    }
    const range = max - min;
    return {
        min,
        max,
        range,
        x: (index) => (data.length > 1 ? (index / (data.length - 1)) * 100 : 50),
        y: (value) => 10 + ((max - value) / range) * 74,
    };
}

function chartSegments(data: AdminLineChartPoint[], scale: NonNullable<ReturnType<typeof chartScale>>) {
    const segments: string[][] = [];
    let segment: string[] = [];
    data.forEach((point, index) => {
        if (point.value === null || !Number.isFinite(point.value)) {
            if (segment.length) segments.push(segment);
            segment = [];
            return;
        }
        segment.push(`${scale.x(index)},${scale.y(point.value)}`);
    });
    if (segment.length) segments.push(segment);
    return segments;
}

function chartLabels(data: AdminLineChartPoint[]) {
    return data.filter((_, index) => index === 0 || index === data.length - 1);
}

const chartGrid = () => [20, 40, 60, 80].map(
    (line) => svg`<line class="grid-line" x1="0" y1=${line} x2="100" y2=${line}></line>`,
);

const chartScales = css`
    .grid-line {
        stroke: var(--aui-grid-line-strong);
        stroke-width: 0.5;
        vector-effect: non-scaling-stroke;
    }
    .labels {
        position: absolute;
        right: 10px;
        bottom: 7px;
        left: 10px;
        display: flex;
        justify-content: space-between;
        color: var(--aui-text-muted);
        font: 9px/1 var(--aui-font-mono);
    }
    .empty {
        display: grid;
        min-height: inherit;
        place-items: center;
        color: var(--aui-text-muted);
        font: 10px/1 var(--aui-font-mono);
        text-transform: uppercase;
    }
`;

export class AdminAreaChartElement extends AdminElement {
    static properties = {
        data: { attribute: false },
        height: { type: String },
        label: { type: String },
        color: { type: String },
        showPoints: { type: Boolean, attribute: "show-points" },
        showTooltip: { type: Boolean, attribute: "show-tooltip" },
    };
    static styles = [
        css`
            :host {
                display: block;
            }
            .chart {
                position: relative;
                min-height: var(--aui-area-height, 220px);
                overflow: hidden;
                border: 1px solid var(--aui-border);
                background: var(--aui-surface);
            }
            svg {
                display: block;
                width: 100%;
                height: 100%;
                min-height: inherit;
            }
            polyline {
                fill: none;
                stroke: var(--aui-area-color, var(--aui-primary));
                stroke-width: 2.5;
                vector-effect: non-scaling-stroke;
            }
            polygon {
                fill: color-mix(in srgb, var(--aui-area-color, var(--aui-primary)) 18%, transparent);
                stroke: none;
            }
            circle {
                fill: var(--aui-area-color, var(--aui-primary));
                stroke: var(--aui-surface);
                stroke-width: 1.5;
                vector-effect: non-scaling-stroke;
                cursor: pointer;
            }
            circle:focus-visible {
                stroke: var(--aui-focus);
                stroke-width: 2.5;
                outline: none;
            }
            circle.hit-only {
                fill: transparent;
                stroke: transparent;
            }
            .tooltip {
                position: absolute;
                z-index: 2;
                top: 7px;
                left: 50%;
                width: max-content;
                max-width: calc(100% - 16px);
                padding: 5px 7px;
                border: 1px solid var(--aui-border-hover);
                background: var(--aui-header);
                color: var(--aui-text-primary);
                font: 10px/1.25 var(--aui-font-mono);
                pointer-events: none;
                transform: translateX(-50%);
            }
        `,
        chartScales,
    ];
    data: AdminAreaChartPoint[] = [];
    height = "220px";
    label = "Area chart";
    color = "var(--aui-primary)";
    showPoints = true;
    showTooltip = true;
    private activeIndex: number | null = null;

    private activate(index: number): void {
        const point = this.data[index];
        if (!this.showTooltip || !point || point.value === null || !Number.isFinite(point.value)) return;
        this.activeIndex = index;
        this.requestUpdate();
        this.dispatchDetail("aui-chart-point", { index, point });
    }

    private clear(index: number): void {
        if (this.activeIndex !== index) return;
        this.activeIndex = null;
        this.requestUpdate();
    }

    render() {
        const scale = chartScale(this.data);
        if (!scale)
            return html`<div class="chart" style=${`--aui-area-height:${this.height}`} role="img" aria-label=${this.label}>
                <div class="empty">No chart data</div>
            </div>`;
        const segments = chartSegments(this.data, scale);
        return html`<div class="chart" style=${`--aui-area-height:${this.height};--aui-area-color:${this.color}`} role="group" aria-label=${this.label}>
            ${svg`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden=${this.showTooltip ? "false" : "true"}>
                ${chartGrid()}
                ${segments.map((points) => {
                    const first = points[0]?.split(",");
                    const last = points.at(-1)?.split(",");
                    if (!first || !last) return null;
                    return svg`<polygon points=${`${first[0]},88 ${points.join(" ")} ${last[0]},88`}></polygon><polyline points=${points.join(" ")}></polyline>`;
                })}
                ${this.data.map((point, index) => point.value === null || !Number.isFinite(point.value) ? null : svg`<circle class=${this.showPoints ? "" : "hit-only"} cx=${scale.x(index)} cy=${scale.y(point.value)} r=${this.showPoints ? "2.2" : "4"} tabindex=${this.showTooltip ? "0" : "-1"} role="img" aria-label=${`${point.label}: ${point.value}`} @pointerenter=${() => this.activate(index)} @pointerleave=${() => this.clear(index)} @focus=${() => this.activate(index)} @blur=${() => this.clear(index)} @click=${() => this.activate(index)}></circle>`)}
            </svg>`}
            <div class="labels">${chartLabels(this.data).map((point) => html`<span>${point.label}</span>`)}</div>
            ${this.activeIndex !== null && this.data[this.activeIndex]?.value !== null ? html`<div class="tooltip" role="tooltip">${this.data[this.activeIndex].label}: ${this.data[this.activeIndex].value}</div>` : null}
        </div>`;
    }
}

export interface AdminPieChartItem {
    label: string;
    value: number;
    color?: string;
}

function polarPoint(cx: number, cy: number, radius: number, angle: number): [number, number] {
    const radians = ((angle - 90) * Math.PI) / 180;
    return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

function piePath(start: number, end: number, innerRadius: number): string {
    const outerStart = polarPoint(50, 50, 38, start);
    const outerEnd = polarPoint(50, 50, 38, end);
    const largeArc = end - start > 180 ? 1 : 0;
    if (innerRadius <= 0) {
        return `M 50 50 L ${outerStart[0]} ${outerStart[1]} A 38 38 0 ${largeArc} 1 ${outerEnd[0]} ${outerEnd[1]} Z`;
    }
    const innerEnd = polarPoint(50, 50, innerRadius, end);
    const innerStart = polarPoint(50, 50, innerRadius, start);
    return `M ${outerStart[0]} ${outerStart[1]} A 38 38 0 ${largeArc} 1 ${outerEnd[0]} ${outerEnd[1]} L ${innerEnd[0]} ${innerEnd[1]} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart[0]} ${innerStart[1]} Z`;
}

export class AdminPieChartElement extends AdminElement {
    static properties = {
        data: { attribute: false },
        height: { type: String },
        label: { type: String },
        donut: { type: Boolean },
        showLegend: { type: Boolean, attribute: "show-legend" },
        showTooltip: { type: Boolean, attribute: "show-tooltip" },
    };
    static styles = css`
        :host {
            display: block;
        }
        .chart {
            position: relative;
            display: grid;
            grid-template-columns: minmax(120px, 1fr) minmax(120px, 1fr);
            align-items: center;
            gap: 12px;
            min-height: var(--aui-pie-height, 220px);
            padding: 12px;
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        svg {
            display: block;
            width: 100%;
            max-height: 190px;
        }
        path {
            stroke: var(--aui-surface);
            stroke-width: 1;
            vector-effect: non-scaling-stroke;
            cursor: pointer;
        }
        path:focus-visible {
            stroke: var(--aui-focus);
            stroke-width: 2.5;
            outline: none;
        }
        .tooltip {
            position: absolute;
            z-index: 2;
            top: 7px;
            left: 25%;
            width: max-content;
            max-width: calc(100% - 16px);
            padding: 5px 7px;
            border: 1px solid var(--aui-border-hover);
            background: var(--aui-header);
            color: var(--aui-text-primary);
            font: 10px/1.25 var(--aui-font-mono);
            pointer-events: none;
            transform: translateX(-50%);
        }
        .legend {
            display: grid;
            gap: 7px;
            margin: 0;
            padding: 0;
            list-style: none;
            color: var(--aui-chart-legend);
            font: 10px/1.3 var(--aui-font-mono);
        }
        .legend-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .legend-label {
            display: flex;
            align-items: center;
            min-width: 0;
            gap: 6px;
        }
        .swatch {
            width: 8px;
            height: 8px;
            flex: 0 0 auto;
        }
        .empty {
            display: grid;
            grid-column: 1 / -1;
            min-height: inherit;
            place-items: center;
            color: var(--aui-text-muted);
            font: 10px/1 var(--aui-font-mono);
            text-transform: uppercase;
        }
        @media (max-width: 420px) {
            .chart {
                grid-template-columns: 1fr;
            }
            svg {
                max-height: 150px;
            }
        }
    `;
    data: AdminPieChartItem[] = [];
    height = "220px";
    label = "Pie chart";
    donut = false;
    showLegend = true;
    showTooltip = true;
    private activeIndex: number | null = null;

    private activate(index: number): void {
        if (!this.showTooltip || !this.data[index]) return;
        this.activeIndex = index;
        this.requestUpdate();
        this.dispatchDetail("aui-chart-point", { index, point: this.data[index] });
    }

    private clear(index: number): void {
        if (this.activeIndex !== index) return;
        this.activeIndex = null;
        this.requestUpdate();
    }

    render() {
        const entries = normalizePieData(this.data);
        const total = entries.reduce((sum, item) => sum + item.value, 0);
        if (!total)
            return html`<div class="chart" style=${`--aui-pie-height:${this.height}`} role="img" aria-label=${this.label}>
                <div class="empty">No chart data</div>
            </div>`;
        let angle = 0;
        const slices = entries.map((item, index) => {
            const start = angle;
            angle += (item.value / total) * 360;
            return { item, index, start, end: angle };
        });
        return html`<div class="chart" style=${`--aui-pie-height:${this.height}`} role="group" aria-label=${this.label}>
            ${svg`<svg viewBox="0 0 100 100" aria-hidden=${this.showTooltip ? "false" : "true"}>
                ${slices.map(({ item, index, start, end }) => svg`<path d=${piePath(start, end, this.donut ? 20 : 0)} fill=${item.color ?? `var(--aui-chart-series-${(index % 4) + 1}, var(--aui-primary))`} tabindex=${this.showTooltip ? "0" : "-1"} role="img" aria-label=${`${item.label}: ${Math.round((item.value / total) * 100)}%`} @pointerenter=${() => this.activate(index)} @pointerleave=${() => this.clear(index)} @focus=${() => this.activate(index)} @blur=${() => this.clear(index)} @click=${() => this.activate(index)}></path>`)}
            </svg>`}
            ${this.showLegend ? html`<ul class="legend" aria-label="${this.label} legend">
                ${slices.map(({ item }) => html`<li class="legend-item"><span class="legend-label"><i class="swatch" style=${`background:${item.color ?? "var(--aui-primary)"}`}></i><span>${item.label}</span></span><strong>${Math.round((item.value / total) * 100)}%</strong></li>`)}
            </ul>` : null}
            ${this.activeIndex !== null && slices[this.activeIndex] ? html`<div class="tooltip" role="tooltip">${slices[this.activeIndex].item.label}: ${slices[this.activeIndex].item.value} (${Math.round((slices[this.activeIndex].item.value / total) * 100)}%)</div>` : null}
        </div>`;
    }
}

function gaugeArc(start: number, end: number): string {
    const startPoint = polarPoint(50, 53, 36, start);
    const endPoint = polarPoint(50, 53, 36, end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${startPoint[0]} ${startPoint[1]} A 36 36 0 ${largeArc} 1 ${endPoint[0]} ${endPoint[1]}`;
}

export class AdminGaugeElement extends AdminElement {
    static properties = {
        value: { type: Number },
        min: { type: Number },
        max: { type: Number },
        height: { type: String },
        label: { type: String },
        unit: { type: String },
        color: { type: String },
    };
    static styles = css`
        :host {
            display: block;
        }
        .chart {
            position: relative;
            min-height: var(--aui-gauge-height, 220px);
            border: 1px solid var(--aui-border);
            background: var(--aui-surface);
        }
        svg {
            display: block;
            width: 100%;
            height: 100%;
            min-height: inherit;
        }
        path {
            fill: none;
            stroke-linecap: round;
            stroke-width: 7;
            vector-effect: non-scaling-stroke;
        }
        .track {
            stroke: var(--aui-border);
        }
        .value {
            fill: var(--aui-text-primary);
            font: 500 16px var(--aui-font-mono);
            text-anchor: middle;
        }
        .label {
            fill: var(--aui-text-secondary);
            font: 7px var(--aui-font-mono);
            letter-spacing: 0.08em;
            text-anchor: middle;
            text-transform: uppercase;
        }
        .range {
            position: absolute;
            right: 12px;
            bottom: 8px;
            left: 12px;
            display: flex;
            justify-content: space-between;
            color: var(--aui-text-muted);
            font: 9px var(--aui-font-mono);
        }
    `;
    value = 0;
    min = 0;
    max = 100;
    height = "220px";
    label = "Gauge";
    unit = "%";
    color = "var(--aui-primary)";

    render() {
        const normalized = normalizeGaugeValue(this.value, this.min, this.max);
        const { value: current, min: low, max: high, ratio: progress } = normalized;
        const display = `${Number.isInteger(current) ? current : current.toFixed(1)}${this.unit}`;
        return html`<div class="chart" style=${`--aui-gauge-height:${this.height}`} role="meter" aria-label=${this.label} aria-valuemin=${low} aria-valuemax=${high} aria-valuenow=${current}>
            ${svg`<svg viewBox="0 0 100 88" aria-hidden="true">
                <path class="track" d=${gaugeArc(-135, 135)}></path>
                <path d=${gaugeArc(-135, -135 + progress * 270)} stroke=${this.color}></path>
                <text class="value" x="50" y="54">${display}</text>
                <text class="label" x="50" y="65">${this.label}</text>
            </svg>`}
            <div class="range"><span>${low}</span><span>${high}</span></div>
        </div>`;
    }
}

export class AdminSparklineElement extends AdminElement {
    static properties = {
        values: { attribute: false },
        label: { type: String },
        color: { type: String },
    };
    static styles = css`
        :host {
            display: block;
        }
        svg {
            display: block;
            width: 100%;
            height: 52px;
            overflow: visible;
        }
        polyline {
            fill: none;
            stroke: var(--aui-sparkline-color, var(--aui-text-primary));
            stroke-width: 2;
            vector-effect: non-scaling-stroke;
        }
        .baseline {
            stroke: var(--aui-border);
            stroke-width: 1;
        }
    `;
    values: number[] = [];
    label = "Trend";
    color = "var(--aui-text-primary)";
    render() {
        const max = Math.max(...this.values, 1);
        const min = Math.min(...this.values, 0);
        const range = Math.max(max - min, 1);
        const points = this.values
            .map(
                (value, index) =>
                    `${this.values.length > 1 ? (index / (this.values.length - 1)) * 100 : 50},${48 - ((value - min) / range) * 42}`,
            )
            .join(" ");
        return svg`<svg
            viewBox="0 0 100 52"
            role="img"
            aria-label=${this.label}
            style=${`--aui-sparkline-color:${this.color}`}
        >
            <line class="baseline" x1="0" y1="49" x2="100" y2="49"></line>
            <polyline points=${points}></polyline>
        </svg>`;
    }
}
