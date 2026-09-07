/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

/**
 * Small framework-neutral range helper for virtual list adapters.
 * It deliberately has no DOM or rendering dependency; applications can pair
 * it with TanStack Virtual, ResizeObserver, or their own scroll container.
 */
export interface AdminVirtualRange {
    start: number;
    end: number;
    top: number;
    bottom: number;
}

export function getAdminVirtualRange(
    count: number,
    scrollTop: number,
    viewportHeight: number,
    rowHeight: number,
    overscan = 4,
): AdminVirtualRange {
    const safeCount = Math.max(0, Math.floor(count));
    const safeHeight = Math.max(1, rowHeight);
    const safeViewport = Math.max(1, viewportHeight);
    const safeOverscan = Math.max(0, Math.floor(overscan));
    const first = Math.max(0, Math.floor(Math.max(0, scrollTop) / safeHeight) - safeOverscan);
    const visible = Math.ceil(safeViewport / safeHeight) + safeOverscan * 2;
    const end = Math.min(safeCount, first + visible);
    return {
        start: first,
        end,
        top: first * safeHeight,
        bottom: Math.max(0, (safeCount - end) * safeHeight),
    };
}
