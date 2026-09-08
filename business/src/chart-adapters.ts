/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

export type AdminChartX = string | number;
export type AdminChartY = number | null;

export interface AdminChartDatum {
    x: AdminChartX;
    y: AdminChartY;
}

export interface AdminChartSeries {
    id: string;
    label: string;
    color?: string;
    data: AdminChartDatum[];
}

export interface AdminChartSeriesInput {
    id?: string;
    label?: string;
    color?: string;
    data: Array<
        | AdminChartDatum
        | { label: AdminChartX; value?: AdminChartY }
        | { x: AdminChartX; y?: AdminChartY; value?: AdminChartY }
    >;
}

export interface AdminChartDomain {
    x: { min: AdminChartX | undefined; max: AdminChartX | undefined };
    y: [number, number];
}

export interface AdminChartAdapter {
    series: AdminChartSeries[];
    domain: AdminChartDomain;
}

export interface NormalizeChartOptions {
    /** Include a zero baseline in the Y domain. Defaults to true. */
    includeZero?: boolean;
    /** Use this key when a source series does not provide an id. */
    idPrefix?: string;
}

function finiteValue(value: unknown): AdminChartY {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function datum(value: AdminChartSeriesInput["data"][number]): AdminChartDatum {
    if ("label" in value) return { x: value.label, y: finiteValue(value.value) };
    return {
        x: value.x,
        y: finiteValue("y" in value ? value.y : value.value),
    };
}

/**
 * Normalize common chart-library data shapes without importing a chart runtime.
 * Null values are kept as intentional gaps so line/area renderers can break the
 * path instead of connecting across missing telemetry.
 */
export function normalizeChartSeries(
    input: AdminChartSeriesInput | AdminChartSeriesInput[],
    options: NormalizeChartOptions = {},
): AdminChartSeries[] {
    const sources = Array.isArray(input) ? input : [input];
    const prefix = options.idPrefix ?? "series";
    return sources.map((source, index) => ({
        id: source.id?.trim() || `${prefix}-${index + 1}`,
        label: source.label?.trim() || source.id?.trim() || `Series ${index + 1}`,
        ...(source.color ? { color: source.color } : {}),
        data: source.data.map(datum),
    }));
}

function numericValues(series: AdminChartSeries[]): number[] {
    return series.flatMap((entry) =>
        entry.data.flatMap((point) => (point.y === null ? [] : [point.y])),
    );
}

function expandFlatDomain(min: number, max: number): [number, number] {
    if (min !== max) return [min, max];
    const padding = Math.max(Math.abs(min) * 0.1, 1);
    return [min - padding, max + padding];
}

/** Compute stable rendering bounds for any normalized series collection. */
export function getChartDomain(
    series: AdminChartSeries[],
    options: Pick<NormalizeChartOptions, "includeZero"> = {},
): AdminChartDomain {
    const values = numericValues(series);
    if (!values.length) return { x: { min: undefined, max: undefined }, y: [0, 1] };

    let min = Math.min(...values);
    let max = Math.max(...values);
    if (options.includeZero !== false) {
        min = Math.min(min, 0);
        max = Math.max(max, 0);
    }
    return {
        x: {
            min: series[0]?.data[0]?.x,
            max: series.at(-1)?.data.at(-1)?.x,
        },
        y: expandFlatDomain(min, max),
    };
}

/** Normalize source data and calculate domains in one adapter call. */
export function fromChartData(
    input: AdminChartSeriesInput | AdminChartSeriesInput[],
    options: NormalizeChartOptions = {},
): AdminChartAdapter {
    const series = normalizeChartSeries(input, options);
    return { series, domain: getChartDomain(series, options) };
}
