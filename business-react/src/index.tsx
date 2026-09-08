/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import type {
    AdminAuditEntry,
    AdminBusinessColumn,
    AdminFormField,
    AdminPermissionMap,
    AdminPermissionResource,
    AdminPermissionRole,
    AdminWizardStep,
    AdminBulkAction,
    AdminImportRow,
} from "@chaos_team/blbui-business";
export { fromTable, getAdapterSelection, virtualizeRows } from "@chaos_team/blbui-business";
export {
    fromChartData,
    fromPieData,
    getChartDomain,
    normalizeChartSeries,
    normalizeGaugeValue,
    normalizePieData,
} from "@chaos_team/blbui-business";
export type {
    AdminAdapterSelection,
    AdminDataGridAdapter,
    AdminTableLike,
    AdminVirtualRows,
} from "@chaos_team/blbui-business";
export type {
    AdminChartAdapter,
    AdminChartDatum,
    AdminChartDomain,
    AdminChartSeries,
    AdminChartSeriesInput,
    AdminGaugeValue,
    AdminPieAdapter,
    AdminPieDatum,
    NormalizeChartOptions,
} from "@chaos_team/blbui-business";
export {
    connectEditorAdapter,
    readEditorState,
    writeEditorState,
} from "@chaos_team/blbui-business";
export type {
    AdminEditorAdapter,
    AdminEditorSelection,
    AdminEditorState,
} from "@chaos_team/blbui-business";
import "@chaos_team/blbui-business/styles.css";

type CustomElement = HTMLElement & Record<string, unknown>;
type CommonProps = { children?: ReactNode; className?: string; [key: string]: unknown };

function useBusinessElement(
    properties: Record<string, unknown>,
    events: Record<string, ((detail: never) => void) | undefined> = {},
): { ref: (node: CustomElement | null) => void } {
    const element = useRef<CustomElement | null>(null);
    useEffect(() => {
        registerBusinessElements();
        const node = element.current;
        if (!node) return;
        for (const [name, value] of Object.entries(properties)) {
            if (value !== undefined) Reflect.set(node, name, value);
        }
        const cleanups: Array<() => void> = [];
        for (const [name, callback] of Object.entries(events)) {
            if (!callback) continue;
            const handler = (event: Event) =>
                (callback as (detail: unknown) => void)((event as CustomEvent).detail);
            node.addEventListener(name, handler);
            cleanups.push(() => node.removeEventListener(name, handler));
        }
        return () => cleanups.forEach((cleanup) => cleanup());
    }, [properties, events]);
    return {
        ref: (node: CustomElement | null) => {
            element.current = node;
        },
    };
}

/** Everything that is not an explicitly handled prop (id, style, aria-*, data-*, ...). */
function restProps(props: CommonProps, known: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
        if (!known.includes(key) && key !== "children" && value !== undefined) result[key] = value;
    }
    return result;
}

function slotNode(name: string, content: ReactNode): ReactNode {
    return content
        ? createElement("span", { slot: name, key: name, style: { display: "contents" } }, content)
        : null;
}

export interface AdminCrudPageProps extends CommonProps {
    title?: string;
    description?: string;
    loading?: boolean;
    actions?: ReactNode;
    filters?: ReactNode;
    toolbar?: ReactNode;
    pagination?: ReactNode;
}
export function AdminCrudPage(props: AdminCrudPageProps) {
    const { ref } = useBusinessElement({
        title: props.title,
        description: props.description,
        loading: props.loading,
    });
    const rest = restProps(props, [
        "title",
        "description",
        "loading",
        "actions",
        "filters",
        "toolbar",
        "pagination",
    ]);
    return createElement("aui-crud-page", { ...rest, ref, className: props.className }, [
        slotNode("actions", props.actions),
        slotNode("filters", props.filters),
        slotNode("toolbar", props.toolbar),
        props.children,
        slotNode("pagination", props.pagination),
    ]);
}

export interface AdminCrudToolbarProps extends CommonProps {
    selected?: number;
    searchPlaceholder?: string;
    searchValue?: string;
    loading?: boolean;
    onSearch?: (value: string) => void;
    onRefresh?: () => void;
}
export function AdminCrudToolbar(props: AdminCrudToolbarProps) {
    const { ref } = useBusinessElement(
        {
            selected: props.selected,
            searchPlaceholder: props.searchPlaceholder,
            searchValue: props.searchValue,
            loading: props.loading,
        },
        {
            "aui-search": props.onSearch
                ? (detail: { value: string }) => props.onSearch?.(detail.value)
                : undefined,
            "aui-refresh": props.onRefresh ? () => props.onRefresh?.() : undefined,
        },
    );
    const rest = restProps(props, [
        "selected",
        "searchPlaceholder",
        "searchValue",
        "loading",
        "onSearch",
        "onRefresh",
    ]);
    return createElement(
        "aui-crud-toolbar",
        { ...rest, ref, className: props.className },
        props.children,
    );
}

export interface AdminAdvancedTableProps extends CommonProps {
    columns?: AdminBusinessColumn[];
    rows?: Array<Record<string, unknown> & { id?: string | number }>;
    selectable?: boolean;
    loading?: boolean;
    emptyLabel?: string;
    selectedKeys?: Array<string | number>;
    onSelectionChange?: (keys: Array<string | number>) => void;
    onSortChange?: (detail: { key: string; direction: string }) => void;
}
export function AdminAdvancedTable(props: AdminAdvancedTableProps) {
    const { ref } = useBusinessElement(
        {
            columns: props.columns,
            rows: props.rows,
            selectable: props.selectable,
            loading: props.loading,
            emptyLabel: props.emptyLabel,
            selectedKeys: props.selectedKeys,
        },
        {
            "aui-selection-change": props.onSelectionChange
                ? (detail: { keys: Array<string | number> }) =>
                      props.onSelectionChange?.(detail.keys)
                : undefined,
            "aui-sort-change": props.onSortChange
                ? (detail: { key: string; direction: string }) => props.onSortChange?.(detail)
                : undefined,
        },
    );
    const rest = restProps(props, [
        "columns",
        "rows",
        "selectable",
        "loading",
        "emptyLabel",
        "selectedKeys",
        "onSelectionChange",
        "onSortChange",
    ]);
    return createElement("aui-advanced-table", { ...rest, ref, className: props.className });
}

export interface AdminFormBuilderProps extends CommonProps {
    fields?: AdminFormField[];
    submitLabel?: string;
    loading?: boolean;
    onSubmit?: (values: Record<string, string | number | boolean>) => void;
    onChange?: (detail: {
        name: string;
        value: string | number | boolean;
        values: Record<string, string | number | boolean>;
    }) => void;
}
export function AdminFormBuilder(props: AdminFormBuilderProps) {
    const { ref } = useBusinessElement(
        { fields: props.fields, submitLabel: props.submitLabel, loading: props.loading },
        {
            "aui-form-submit": props.onSubmit
                ? (detail: { values: Record<string, string | number | boolean> }) =>
                      props.onSubmit?.(detail.values)
                : undefined,
            "aui-form-change": props.onChange
                ? (detail: unknown) => props.onChange?.(detail as never)
                : undefined,
        },
    );
    const rest = restProps(props, ["fields", "submitLabel", "loading", "onSubmit", "onChange"]);
    return createElement("aui-form-builder", { ...rest, ref, className: props.className });
}

export interface AdminApprovalTimelineProps extends CommonProps {
    items?: Array<{ title: string; description?: string; status?: string; time?: string }>;
    active?: number;
}
export function AdminApprovalTimeline(props: AdminApprovalTimelineProps) {
    const { ref } = useBusinessElement({
        items: props.items,
        active: props.active,
    });
    const rest = restProps(props, ["items", "active"]);
    return createElement("aui-approval-timeline", { ...rest, ref, className: props.className });
}

export interface AdminMetricCardProps extends CommonProps {
    label: string;
    value: string;
    unit?: string;
    trend?: string;
    tone?: string;
}
export function AdminMetricCard(props: AdminMetricCardProps) {
    const { ref } = useBusinessElement({
        label: props.label,
        value: props.value,
        unit: props.unit,
        trend: props.trend,
        tone: props.tone,
    });
    const rest = restProps(props, ["label", "value", "unit", "trend", "tone"]);
    return createElement("aui-metric-card", { ...rest, ref, className: props.className });
}

export interface AdminMetricGridProps extends CommonProps {
    items?: Array<{ label: string; value: string; unit?: string; trend?: string; tone?: string }>;
    columns?: number;
}
export function AdminMetricGrid(props: AdminMetricGridProps) {
    const { ref } = useBusinessElement({
        items: props.items,
        columns: props.columns,
    });
    const rest = restProps(props, ["items", "columns"]);
    return createElement("aui-metric-grid", { ...rest, ref, className: props.className });
}

export interface AdminBarChartProps extends CommonProps {
    data?: Array<{ label: string; value: number }>;
    height?: string;
    label?: string;
    showTooltip?: boolean;
    onPoint?: (detail: { index: number; point: { label: string; value: number } }) => void;
}
export function AdminBarChart(props: AdminBarChartProps) {
    const { ref } = useBusinessElement(
        {
            data: props.data,
            height: props.height,
            label: props.label,
            showTooltip: props.showTooltip,
        },
        {
            "aui-chart-point": props.onPoint,
        },
    );
    const rest = restProps(props, ["data", "height", "label", "showTooltip", "onPoint"]);
    return createElement("aui-bar-chart", { ...rest, ref, className: props.className });
}

export interface AdminSparklineProps extends CommonProps {
    values?: number[];
    label?: string;
    color?: string;
}
export interface AdminLineChartProps extends CommonProps {
    data?: Array<{ label: string; value: number | null }>;
    series?: Array<{
        id: string;
        label: string;
        color?: string;
        data: Array<{ label: string; value: number | null }>;
    }>;
    height?: string;
    label?: string;
    color?: string;
    showPoints?: boolean;
    showTooltip?: boolean;
    onPoint?: (detail: {
        index: number;
        point: { label: string; value: number | null };
        seriesId?: string;
        seriesLabel?: string;
    }) => void;
}
export function AdminLineChart(props: AdminLineChartProps) {
    const { ref } = useBusinessElement(
        {
            data: props.data,
            series: props.series,
            height: props.height,
            label: props.label,
            color: props.color,
            showPoints: props.showPoints,
            showTooltip: props.showTooltip,
        },
        {
            "aui-chart-point": props.onPoint,
        },
    );
    const rest = restProps(props, [
        "data",
        "series",
        "height",
        "label",
        "color",
        "showPoints",
        "showTooltip",
        "onPoint",
    ]);
    return createElement("aui-line-chart", { ...rest, ref, className: props.className });
}

export interface AdminAreaChartProps extends CommonProps {
    data?: Array<{ label: string; value: number | null }>;
    series?: Array<{
        id: string;
        label: string;
        color?: string;
        data: Array<{ label: string; value: number | null }>;
    }>;
    height?: string;
    label?: string;
    color?: string;
    showPoints?: boolean;
    showTooltip?: boolean;
    onPoint?: (detail: {
        index: number;
        point: { label: string; value: number | null };
        seriesId?: string;
        seriesLabel?: string;
    }) => void;
}
export function AdminAreaChart(props: AdminAreaChartProps) {
    const { ref } = useBusinessElement(
        {
            data: props.data,
            series: props.series,
            height: props.height,
            label: props.label,
            color: props.color,
            showPoints: props.showPoints,
            showTooltip: props.showTooltip,
        },
        {
            "aui-chart-point": props.onPoint,
        },
    );
    const rest = restProps(props, [
        "data",
        "series",
        "height",
        "label",
        "color",
        "showPoints",
        "showTooltip",
        "onPoint",
    ]);
    return createElement("aui-area-chart", { ...rest, ref, className: props.className });
}

export interface AdminPieChartItem {
    label: string;
    value: number;
    color?: string;
}
export interface AdminPieChartProps extends CommonProps {
    data?: AdminPieChartItem[];
    height?: string;
    label?: string;
    donut?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    onPoint?: (detail: { index: number; point: AdminPieChartItem }) => void;
}
export function AdminPieChart(props: AdminPieChartProps) {
    const { ref } = useBusinessElement(
        {
            data: props.data,
            height: props.height,
            label: props.label,
            donut: props.donut,
            showLegend: props.showLegend,
            showTooltip: props.showTooltip,
        },
        {
            "aui-chart-point": props.onPoint,
        },
    );
    const rest = restProps(props, [
        "data",
        "height",
        "label",
        "donut",
        "showLegend",
        "showTooltip",
        "onPoint",
    ]);
    return createElement("aui-pie-chart", { ...rest, ref, className: props.className });
}

export interface AdminGaugeProps extends CommonProps {
    value?: number;
    min?: number;
    max?: number;
    height?: string;
    label?: string;
    unit?: string;
    color?: string;
}
export function AdminGauge(props: AdminGaugeProps) {
    const { ref } = useBusinessElement({
        value: props.value,
        min: props.min,
        max: props.max,
        height: props.height,
        label: props.label,
        unit: props.unit,
        color: props.color,
    });
    const rest = restProps(props, ["value", "min", "max", "height", "label", "unit", "color"]);
    return createElement("aui-gauge", { ...rest, ref, className: props.className });
}

export function AdminSparkline(props: AdminSparklineProps) {
    const { ref } = useBusinessElement({
        values: props.values,
        label: props.label,
        color: props.color,
    });
    const rest = restProps(props, ["values", "label", "color"]);
    return createElement("aui-sparkline", { ...rest, ref, className: props.className });
}

export interface AdminFormWizardProps extends CommonProps {
    steps?: AdminWizardStep[];
    active?: string;
    completed?: string[];
    linear?: boolean;
    nextLabel?: string;
    previousLabel?: string;
    finishLabel?: string;
    onChange?: (detail: { from: string; to: string; index: number }) => void;
    onComplete?: (detail: { id: string; completed: string[] }) => void;
}
export function AdminFormWizard(props: AdminFormWizardProps) {
    const { ref } = useBusinessElement(
        {
            steps: props.steps,
            active: props.active,
            completed: props.completed,
            linear: props.linear,
            nextLabel: props.nextLabel,
            previousLabel: props.previousLabel,
            finishLabel: props.finishLabel,
        },
        {
            "aui-wizard-change": props.onChange
                ? (detail: { from: string; to: string; index: number }) => props.onChange?.(detail)
                : undefined,
            "aui-wizard-complete": props.onComplete
                ? (detail: { id: string; completed: string[] }) => props.onComplete?.(detail)
                : undefined,
        },
    );
    const rest = restProps(props, [
        "steps",
        "active",
        "completed",
        "linear",
        "nextLabel",
        "previousLabel",
        "finishLabel",
        "onChange",
        "onComplete",
    ]);
    return createElement(
        "aui-form-wizard",
        { ...rest, ref, className: props.className },
        props.children,
    );
}

export interface AdminPermissionMatrixProps extends CommonProps {
    roles?: AdminPermissionRole[];
    resources?: AdminPermissionResource[];
    permissions?: AdminPermissionMap;
    readOnly?: boolean;
    emptyLabel?: string;
    onChange?: (detail: {
        resourceId: string;
        roleId: string;
        permission: string;
        permissions: AdminPermissionMap;
    }) => void;
}
export function AdminPermissionMatrix(props: AdminPermissionMatrixProps) {
    const { ref } = useBusinessElement(
        {
            roles: props.roles,
            resources: props.resources,
            permissions: props.permissions,
            readOnly: props.readOnly,
            emptyLabel: props.emptyLabel,
        },
        {
            "aui-permission-change": props.onChange
                ? (detail: {
                      resourceId: string;
                      roleId: string;
                      permission: string;
                      permissions: AdminPermissionMap;
                  }) => props.onChange?.(detail)
                : undefined,
        },
    );
    const rest = restProps(props, [
        "roles",
        "resources",
        "permissions",
        "readOnly",
        "emptyLabel",
        "onChange",
    ]);
    return createElement("aui-permission-matrix", { ...rest, ref, className: props.className });
}

export interface AdminAuditLogProps extends CommonProps {
    entries?: AdminAuditEntry[];
    loading?: boolean;
    error?: boolean;
    query?: string;
    status?: string;
    emptyLabel?: string;
    loadingLabel?: string;
    errorLabel?: string;
    hasMore?: boolean;
    onFilterChange?: (detail: { query: string; status: string }) => void;
    onLoadMore?: (detail: { query: string; status: string }) => void;
}
export function AdminAuditLog(props: AdminAuditLogProps) {
    const { ref } = useBusinessElement(
        {
            entries: props.entries,
            loading: props.loading,
            error: props.error,
            query: props.query,
            status: props.status,
            emptyLabel: props.emptyLabel,
            loadingLabel: props.loadingLabel,
            errorLabel: props.errorLabel,
            hasMore: props.hasMore,
        },
        {
            "aui-audit-filter-change": props.onFilterChange
                ? (detail: { query: string; status: string }) => props.onFilterChange?.(detail)
                : undefined,
            "aui-audit-load-more": props.onLoadMore
                ? (detail: { query: string; status: string }) => props.onLoadMore?.(detail)
                : undefined,
        },
    );
    const rest = restProps(props, [
        "entries",
        "loading",
        "error",
        "query",
        "status",
        "emptyLabel",
        "loadingLabel",
        "errorLabel",
        "hasMore",
        "onFilterChange",
        "onLoadMore",
    ]);
    return createElement("aui-audit-log", { ...rest, ref, className: props.className });
}

export interface AdminImportDialogProps extends CommonProps {
    open?: boolean;
    title?: string;
    accept?: string;
    maxSize?: number;
    loading?: boolean;
    rows?: AdminImportRow[];
    error?: string;
    submitLabel?: string;
    cancelLabel?: string;
    onParse?: (detail: { file: File; rows: AdminImportRow[] }) => void;
    onSubmit?: (rows: AdminImportRow[]) => void;
    onCancel?: () => void;
}
export function AdminImportDialog(props: AdminImportDialogProps) {
    const { ref } = useBusinessElement(
        {
            open: props.open,
            title: props.title,
            accept: props.accept,
            maxSize: props.maxSize,
            loading: props.loading,
            rows: props.rows,
            error: props.error,
            submitLabel: props.submitLabel,
            cancelLabel: props.cancelLabel,
        },
        {
            "aui-import-parse": props.onParse
                ? (detail: { file: File; rows: AdminImportRow[] }) => props.onParse?.(detail)
                : undefined,
            "aui-import-submit": props.onSubmit
                ? (detail: { rows: AdminImportRow[] }) => props.onSubmit?.(detail.rows)
                : undefined,
            "aui-import-cancel": props.onCancel ? () => props.onCancel?.() : undefined,
        },
    );
    const rest = restProps(props, [
        "open",
        "title",
        "accept",
        "maxSize",
        "loading",
        "rows",
        "error",
        "submitLabel",
        "cancelLabel",
        "onParse",
        "onSubmit",
        "onCancel",
    ]);
    return createElement("aui-import-dialog", { ...rest, ref, className: props.className });
}

export interface AdminExportButtonProps extends CommonProps {
    data?: unknown[] | Record<string, unknown>;
    format?: "csv" | "json";
    filename?: string;
    label?: string;
    disabled?: boolean;
    loading?: boolean;
    onExport?: (detail: {
        data: unknown;
        format: string;
        filename: string;
        content: string;
    }) => void;
}
export function AdminExportButton(props: AdminExportButtonProps) {
    const { ref } = useBusinessElement(
        {
            data: props.data,
            format: props.format,
            filename: props.filename,
            label: props.label,
            disabled: props.disabled,
            loading: props.loading,
        },
        {
            "aui-export": props.onExport
                ? (detail: never) =>
                      props.onExport?.(
                          detail as AdminExportButtonProps["onExport"] extends (
                              value: infer T,
                          ) => unknown
                              ? T
                              : never,
                      )
                : undefined,
        },
    );
    const rest = restProps(props, [
        "data",
        "format",
        "filename",
        "label",
        "disabled",
        "loading",
        "onExport",
    ]);
    return createElement("aui-export-button", { ...rest, ref, className: props.className });
}

export interface AdminBulkActionsToolbarProps extends CommonProps {
    selected?: number;
    actions?: AdminBulkAction[];
    loading?: boolean;
    clearLabel?: string;
    onAction?: (detail: { id: string; action: AdminBulkAction; selected: number }) => void;
    onClear?: (detail: { selected: number }) => void;
}
export function AdminBulkActionsToolbar(props: AdminBulkActionsToolbarProps) {
    const { ref } = useBusinessElement(
        {
            selected: props.selected,
            actions: props.actions,
            loading: props.loading,
            clearLabel: props.clearLabel,
        },
        {
            "aui-bulk-action": props.onAction
                ? (detail: { id: string; action: AdminBulkAction; selected: number }) =>
                      props.onAction?.(detail)
                : undefined,
            "aui-bulk-clear": props.onClear
                ? (detail: { selected: number }) => props.onClear?.(detail)
                : undefined,
        },
    );
    const rest = restProps(props, [
        "selected",
        "actions",
        "loading",
        "clearLabel",
        "onAction",
        "onClear",
    ]);
    return createElement(
        "aui-bulk-actions-toolbar",
        { ...rest, ref, className: props.className },
        props.children,
    );
}
