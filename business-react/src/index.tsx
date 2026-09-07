/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { registerBusinessElements } from "@chaos_team/blbui-business/register";
import type { AdminBusinessColumn, AdminFormField } from "@chaos_team/blbui-business";
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
  return createElement("aui-crud-toolbar", { ...rest, ref, className: props.className }, props.children);
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
        ? (detail: { keys: Array<string | number> }) => props.onSelectionChange?.(detail.keys)
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
  onChange?: (detail: { name: string; value: string | number | boolean; values: Record<string, string | number | boolean> }) => void;
}
export function AdminFormBuilder(props: AdminFormBuilderProps) {
  const { ref } = useBusinessElement(
    { fields: props.fields, submitLabel: props.submitLabel, loading: props.loading },
    {
      "aui-form-submit": props.onSubmit
        ? (detail: { values: Record<string, string | number | boolean> }) =>
            props.onSubmit?.(detail.values)
        : undefined,
      "aui-form-change": props.onChange ? (detail: unknown) => props.onChange?.(detail as never) : undefined,
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
}
export function AdminBarChart(props: AdminBarChartProps) {
  const { ref } = useBusinessElement({
    data: props.data,
    height: props.height,
    label: props.label,
  });
  const rest = restProps(props, ["data", "height", "label"]);
  return createElement("aui-bar-chart", { ...rest, ref, className: props.className });
}

export interface AdminSparklineProps extends CommonProps {
  values?: number[];
  label?: string;
  color?: string;
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
