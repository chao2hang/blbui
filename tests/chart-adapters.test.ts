/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { describe, expect, it } from "vitest";
import {
    fromChartData,
    fromPieData,
    getChartDomain,
    normalizeChartSeries,
    normalizeGaugeValue,
    normalizePieData,
} from "../business/src/chart-adapters";

describe("business chart adapter contract", () => {
    it("normalizes bar, line and telemetry shapes while preserving gaps", () => {
        const result = normalizeChartSeries([
            {
                id: "requests",
                label: "Requests",
                data: [
                    { label: "00:00", value: 12 },
                    { label: "04:00", value: undefined },
                ],
            },
            {
                data: [
                    { x: 0, y: -2 },
                    { x: 1, value: 4 },
                ],
            },
        ]);

        expect(result).toEqual([
            {
                id: "requests",
                label: "Requests",
                data: [
                    { x: "00:00", y: 12 },
                    { x: "04:00", y: null },
                ],
            },
            {
                id: "series-2",
                label: "Series 2",
                data: [
                    { x: 0, y: -2 },
                    { x: 1, y: 4 },
                ],
            },
        ]);
    });

    it("calculates zero-inclusive and explicit non-zero domains", () => {
        const series = normalizeChartSeries({
            data: [
                { x: "A", y: 10 },
                { x: "B", y: 20 },
            ],
        });
        expect(getChartDomain(series).y).toEqual([0, 20]);
        expect(getChartDomain(series, { includeZero: false }).y).toEqual([10, 20]);
        expect(getChartDomain(series).x).toEqual({ min: "A", max: "B" });
    });

    it("handles empty and flat data deterministically", () => {
        expect(getChartDomain([])).toEqual({ x: { min: undefined, max: undefined }, y: [0, 1] });
        const flat = fromChartData({
            id: "latency",
            data: [
                { x: 1, y: 100 },
                { x: 2, y: 100 },
            ],
        });
        expect(flat.domain.y).toEqual([0, 100]);
        expect(flat.series[0]?.id).toBe("latency");
    });

    it("normalizes pie data and gauge ranges without a chart runtime", () => {
        expect(
            normalizePieData([
                { label: " API ", value: 3 },
                { label: "Empty", value: 0 },
                { label: "Invalid", value: Number.NaN },
            ]),
        ).toEqual([{ label: "API", value: 3 }]);
        expect(fromPieData([{ label: "API", value: 3 }, { label: "Worker", value: 1 }])).toEqual({
            data: [{ label: "API", value: 3 }, { label: "Worker", value: 1 }],
            total: 4,
        });
        expect(normalizeGaugeValue(120, 0, 100)).toEqual({
            value: 100,
            min: 0,
            max: 100,
            ratio: 1,
        });
        expect(normalizeGaugeValue(Number.NaN, 10, 10)).toEqual({
            value: 10,
            min: 10,
            max: 11,
            ratio: 0,
        });
    });
});
