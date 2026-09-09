/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import {
    createElement,
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
    type Ref,
    type RefObject,
} from "react";
import { registerAdminElements } from "@chaos_team/blbui-core/register";
import type {
    AdminAlertVariant,
    AdminCascaderOption,
    AdminDataGridColumn,
    AdminDataGridBatchAction,
    AdminDataGridSortDirection,
    AdminDescriptionItem,
    AdminKanbanColumn,
    AdminListItem,
    AdminLogEntry,
    AdminMenuEntry,
    AdminMenuItem,
    AdminNotificationItem,
    AdminOption,
    AdminStatus,
    AdminTransferOption,
    AdminUploadItem,
    AdminTreeNode,
    AdminTreeTableNode,
    AdminListViewItem,
    AdminToastItem,
    AdminComboboxSearch,
    AdminFilterField,
    AdminFilterRule,
    AdminFilterNode,
    AdminQueryRule,
    AdminQueryNode,
    AdminFormLayout,
    AdminSchemaFormField,
    AdminSchemaFormValue,
    AdminAsyncStateProps,
} from "@chaos_team/blbui-core";

import "@chaos_team/blbui-core/styles.css";

type ElementProps = {
    children?: ReactNode;
    className?: string;
    id?: string;
    [key: string]: unknown;
};
type CustomElement = HTMLElement & Record<string, unknown>;

function renderSlot(name: string, content: ReactNode): ReactNode {
    return content
        ? createElement("span", { slot: name, key: name, style: { display: "contents" } }, content)
        : null;
}

type Binding = {
    element: RefObject<CustomElement | null>;
    setRef: (node: CustomElement | null) => void;
};

let registered = false;
function ensureRegistered(): void {
    if (!registered && typeof customElements !== "undefined") {
        registerAdminElements();
        registered = true;
    }
}

function useBinding(
    externalRef: Ref<HTMLElement> | undefined,
    properties: Record<string, unknown> = {},
    events: Record<string, ((detail: never) => void) | undefined> = {},
): Binding {
    ensureRegistered();
    useEffect(() => ensureRegistered(), []);
    const element = useRef<CustomElement | null>(null);
    const setRef = useCallback(
        (node: CustomElement | null) => {
            element.current = node;
            if (typeof externalRef === "function") externalRef(node);
            else if (externalRef) Reflect.set(externalRef, "current", node);
        },
        [externalRef],
    );
    useEffect(() => {
        const node = element.current;
        if (!node) return;
        for (const [name, value] of Object.entries(properties)) {
            if (value !== undefined) Reflect.set(node, name, value);
        }
    }, [properties, element]);
    useEffect(() => {
        const node = element.current;
        if (!node) return;
        const cleanups: Array<() => void> = [];
        for (const [name, callback] of Object.entries(events)) {
            if (!callback) continue;
            const handler = (event: Event) =>
                (callback as (detail: unknown) => void)((event as CustomEvent).detail);
            node.addEventListener(name, handler);
            cleanups.push(() => node.removeEventListener(name, handler));
        }
        return () => cleanups.forEach((cleanup) => cleanup());
    }, [events, element]);
    return { element, setRef };
}

function elementProps(
    props: ElementProps,
    properties: string[],
    events: string[] = [],
): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
        if (
            !properties.includes(key) &&
            !events.includes(key) &&
            key !== "children" &&
            value !== undefined
        ) {
            result[key] = value;
        }
    }
    return result;
}

export interface AdminComboboxProps extends ElementProps {
    options?: AdminOption[];
    value?: string;
    query?: string;
    selectedLabel?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    open?: boolean;
    loading?: boolean;
    error?: boolean;
    loadingLabel?: string;
    emptyLabel?: string;
    errorLabel?: string;
    onSearch?: AdminComboboxSearch;
    onChange?: (value: string) => void;
    onQueryChange?: (query: string) => void;
    onOpenChange?: (open: boolean) => void;
    onSearchError?: (detail: { query: string; error: unknown }) => void;
}
export function AdminCombobox(props: AdminComboboxProps) {
    const {
        options,
        value,
        query,
        selectedLabel,
        name,
        placeholder,
        disabled,
        open,
        loading,
        error,
        loadingLabel,
        emptyLabel,
        errorLabel,
        onSearch,
        onChange,
        onQueryChange,
        onOpenChange,
        onSearchError,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        {
            options,
            value,
            query,
            selectedLabel,
            name,
            placeholder,
            disabled,
            open,
            loading,
            error,
            loadingLabel,
            emptyLabel,
            errorLabel,
            search: onSearch,
        },
        {
            "aui-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
            "aui-query-change": onQueryChange
                ? (detail: { query: string }) => onQueryChange(detail.query)
                : undefined,
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
            "aui-search-error": onSearchError,
        },
    );
    return createElement("aui-combobox", {
        ...elementProps(
            props,
            [
                "options",
                "value",
                "query",
                "selectedLabel",
                "name",
                "placeholder",
                "disabled",
                "open",
                "loading",
                "error",
                "loadingLabel",
                "emptyLabel",
                "errorLabel",
            ],
            ["onSearch", "onChange", "onQueryChange", "onOpenChange", "onSearchError"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminMultiSelectProps extends ElementProps {
    options?: AdminOption[];
    values?: string[];
    placeholder?: string;
    disabled?: boolean;
    open?: boolean;
    onChange?: (values: string[]) => void;
}
export function AdminMultiSelect(props: AdminMultiSelectProps) {
    const { options, values, placeholder, disabled, open, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { options, values, placeholder, disabled, open },
        {
            "aui-change": onChange
                ? (detail: { values: string[] }) => onChange(detail.values)
                : undefined,
        },
    );
    return createElement("aui-multi-select", {
        ...elementProps(
            props,
            ["options", "values", "placeholder", "disabled", "open"],
            ["onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminCommandProps extends ElementProps {
    items?: AdminOption[];
    open?: boolean;
    placeholder?: string;
    onSelect?: (value: string) => void;
}
export function AdminCommand(props: AdminCommandProps) {
    const { items, open, placeholder, onSelect, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, open, placeholder },
        { "aui-command": onSelect ? (detail: { id: string }) => onSelect(detail.id) : undefined },
    );
    return createElement("aui-command", {
        ...elementProps(props, ["items", "open", "placeholder"], ["onSelect"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminDateRangeProps extends ElementProps {
    presets?: Array<{ id: string; label: string; start: string; end: string }>;
    start?: string;
    end?: string;
    startLabel?: string;
    endLabel?: string;
    min?: string;
    max?: string;
    presetLabel?: string;
    clearable?: boolean;
    required?: boolean;
    disabled?: boolean;
    onChange?: (range: { start: string; end: string }) => void;
    onPreset?: (detail: {
        preset: { id: string; label: string; start: string; end: string };
        start: string;
        end: string;
    }) => void;
    onValidationChange?: (detail: { valid: boolean; error: string }) => void;
}
export function AdminDateRange(props: AdminDateRangeProps) {
    const {
        presets,
        start,
        end,
        startLabel,
        endLabel,
        min,
        max,
        presetLabel,
        clearable,
        required,
        disabled,
        onChange,
        onPreset,
        onValidationChange,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        {
            presets,
            start,
            end,
            startLabel,
            endLabel,
            min,
            max,
            presetLabel,
            clearable,
            required,
            disabled,
        },
        {
            "aui-range-change": onChange
                ? (detail: { start: string; end: string }) => onChange(detail)
                : undefined,
            "aui-range-validation": onValidationChange,
            "aui-range-preset": onPreset,
        },
    );
    return createElement("aui-date-range", {
        ...elementProps(
            props,
            [
                "presets",
                "start",
                "end",
                "startLabel",
                "endLabel",
                "min",
                "max",
                "presetLabel",
                "clearable",
                "required",
                "disabled",
            ],
            ["onChange", "onPreset", "onValidationChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminTagInputProps extends ElementProps {
    values?: string[];
    placeholder?: string;
    disabled?: boolean;
    onChange?: (values: string[]) => void;
}
export function AdminTagInput(props: AdminTagInputProps) {
    const { values, placeholder, disabled, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { values, placeholder, disabled },
        {
            "aui-tags-change": onChange
                ? (detail: { values: string[] }) => onChange(detail.values)
                : undefined,
        },
    );
    return createElement("aui-tag-input", {
        ...elementProps(props, ["values", "placeholder", "disabled"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminStackProps extends ElementProps {
    direction?: "vertical" | "horizontal";
    gap?: string;
    align?: string;
    justify?: string;
}
export function AdminStack(props: AdminStackProps) {
    const { direction, gap, align, justify, ...rest } = props;
    const { setRef } = useBinding(undefined, { direction, gap, align, justify });
    return createElement(
        "aui-stack",
        { ...elementProps(props, ["direction", "gap", "align", "justify"]), ...rest, ref: setRef },
        props.children,
    );
}

export interface AdminGridProps extends ElementProps {
    columns?: number;
    gap?: string;
    minWidth?: string;
}
export function AdminGrid(props: AdminGridProps) {
    const { columns, gap, minWidth, ...rest } = props;
    const { setRef } = useBinding(undefined, { columns, gap, minWidth });
    return createElement(
        "aui-grid",
        { ...elementProps(props, ["columns", "gap", "minWidth"]), ...rest, ref: setRef },
        props.children,
    );
}

export interface AdminAlertProps extends ElementProps {
    variant?: AdminAlertVariant;
    title?: string;
    description?: string;
    closable?: boolean;
    onClose?: () => void;
}
export function AdminAlert(props: AdminAlertProps) {
    const { children, variant, title, description, closable, onClose, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { variant, title, description, closable },
        { "aui-close": onClose ? () => onClose() : undefined },
    );
    return createElement(
        "aui-alert",
        {
            ...elementProps(props, ["variant", "title", "description", "closable"], ["onClose"]),
            ...rest,
            ref: setRef,
        },
        children,
    );
}

export interface AdminIconButtonProps extends ElementProps {
    label: string;
    icon?: string;
    variant?: "default" | "danger";
    size?: "sm" | "md";
    disabled?: boolean;
    onPress?: () => void;
}
export function AdminIconButton(props: AdminIconButtonProps) {
    const { label, icon, variant, size, disabled, onPress, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { label, icon, variant, size, disabled },
        { "aui-press": onPress ? () => onPress() : undefined },
    );
    return createElement("aui-icon-button", {
        ...elementProps(props, ["label", "icon", "variant", "size", "disabled"], ["onPress"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminProgressProps extends ElementProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
}
export function AdminProgress(props: AdminProgressProps) {
    const { value, max, label, showValue, ...rest } = props;
    const { setRef } = useBinding(undefined, { value, max, label, showValue });
    return createElement("aui-progress", {
        ...elementProps(props, ["value", "max", "label", "showValue"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminRatingProps extends ElementProps {
    value?: number;
    max?: number;
    readOnly?: boolean;
    onChange?: (value: number) => void;
}
export function AdminRating(props: AdminRatingProps) {
    const { value, max, readOnly, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, max, readonly: readOnly },
        {
            "aui-rating-change": onChange
                ? (detail: { value: number }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-rating", {
        ...elementProps(props, ["value", "max", "readOnly"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}

export function AdminKbd(props: ElementProps) {
    const { setRef } = useBinding(undefined);
    return createElement("aui-kbd", { ...elementProps(props, []), ref: setRef }, props.children);
}
export interface AdminResultProps extends ElementProps {
    status?: "info" | "success" | "warning" | "error";
    title: string;
    description?: string;
}
export function AdminResult(props: AdminResultProps) {
    const { status, title, description, ...rest } = props;
    const { setRef } = useBinding(undefined, { status, title, description });
    return createElement(
        "aui-result",
        { ...elementProps(props, ["status", "title", "description"]), ...rest, ref: setRef },
        props.children,
    );
}

export interface AdminFieldProps extends ElementProps {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
}
export function AdminField(props: AdminFieldProps) {
    const { label, description, error, required, ...rest } = props;
    const { setRef } = useBinding(undefined, { label, description, error, required });
    return createElement(
        "aui-field",
        {
            ...elementProps(props, ["label", "description", "error", "required"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}
export function AdminInputGroup(props: ElementProps) {
    const { setRef } = useBinding(undefined);
    return createElement(
        "aui-input-group",
        { ...elementProps(props, []), ref: setRef },
        props.children,
    );
}

export interface AdminRadioGroupProps extends ElementProps {
    options?: AdminOption[];
    value?: string;
    orientation?: "horizontal" | "vertical";
    onChange?: (value: string) => void;
}
export function AdminRadioGroup(props: AdminRadioGroupProps) {
    const { options, value, orientation, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { options, value, orientation },
        {
            "aui-radio-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement(
        "aui-radio-group",
        {
            ...elementProps(props, ["options", "value", "orientation"], ["onChange"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}
export interface AdminSliderProps extends ElementProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    showValue?: boolean;
    disabled?: boolean;
    onChange?: (value: number) => void;
}
export function AdminSlider(props: AdminSliderProps) {
    const { value, min, max, step, label, showValue, disabled, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, min, max, step, label, showValue, disabled },
        {
            "aui-slider-change": onChange
                ? (detail: { value: number }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-slider", {
        ...elementProps(
            props,
            ["value", "min", "max", "step", "label", "showValue", "disabled"],
            ["onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}
export interface AdminPasswordInputProps extends ElementProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    revealLabel?: string;
    hideLabel?: string;
    onValueChange?: (value: string) => void;
}
export function AdminPasswordInput(props: AdminPasswordInputProps) {
    const { value, placeholder, disabled, revealLabel, hideLabel, onValueChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, placeholder, disabled, revealLabel, hideLabel },
        {
            "aui-input": onValueChange
                ? (detail: { value: string }) => onValueChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-password-input", {
        ...elementProps(
            props,
            ["value", "placeholder", "disabled", "revealLabel", "hideLabel"],
            ["onValueChange"],
        ),
        ...rest,
        ref: setRef,
    });
}
export interface AdminFileUploadProps extends ElementProps {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    label?: string;
    hint?: string;
    onFilesChange?: (files: File[]) => void;
}
export function AdminFileUpload(props: AdminFileUploadProps) {
    const { accept, multiple, disabled, label, hint, onFilesChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { accept, multiple, disabled, label, hint },
        {
            "aui-files-change": onFilesChange
                ? (detail: { files: File[] }) => onFilesChange(detail.files)
                : undefined,
        },
    );
    return createElement("aui-file-upload", {
        ...elementProps(
            props,
            ["accept", "multiple", "disabled", "label", "hint"],
            ["onFilesChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminAccordionProps extends ElementProps {
    items?: Array<{ id: string; label: string; content: string; disabled?: boolean }>;
    multiple?: boolean;
}
export function AdminAccordion(props: AdminAccordionProps) {
    const { items, multiple, ...rest } = props;
    const { setRef } = useBinding(undefined, { items, multiple });
    return createElement(
        "aui-accordion",
        { ...elementProps(props, ["items", "multiple"]), ...rest, ref: setRef },
        props.children,
    );
}
export interface AdminStepperProps extends ElementProps {
    items?: Array<{ label: string; description?: string }>;
    active?: number;
    orientation?: "horizontal" | "vertical";
}
export function AdminStepper(props: AdminStepperProps) {
    const { items, active, orientation, ...rest } = props;
    const { setRef } = useBinding(undefined, { items, active, orientation });
    return createElement("aui-stepper", {
        ...elementProps(props, ["items", "active", "orientation"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminSegmentedProps extends ElementProps {
    items?: AdminListItem[];
    value?: string;
    onChange?: (value: string) => void;
}
export function AdminSegmented(props: AdminSegmentedProps) {
    const { items, value, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, value },
        {
            "aui-segment-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-segmented", {
        ...elementProps(props, ["items", "value"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminListProps extends ElementProps {
    items?: AdminListItem[];
    selected?: string;
    selectable?: boolean;
    onChange?: (id: string) => void;
}
export function AdminList(props: AdminListProps) {
    const { items, selected, selectable, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, selected, selectable },
        {
            "aui-list-change": onChange
                ? (detail: { id: string }) => onChange(detail.id)
                : undefined,
        },
    );
    return createElement("aui-list", {
        ...elementProps(props, ["items", "selected", "selectable"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminTreeProps extends ElementProps {
    nodes?: AdminTreeNode[];
    selected?: string;
    expanded?: string[];
    onChange?: (id: string) => void;
}
export function AdminTree(props: AdminTreeProps) {
    const { nodes, selected, expanded, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { nodes, selected, expanded },
        {
            "aui-tree-change": onChange
                ? (detail: { id: string }) => onChange(detail.id)
                : undefined,
        },
    );
    return createElement("aui-tree", {
        ...elementProps(props, ["nodes", "selected", "expanded"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminTimelineProps extends ElementProps {
    items?: Array<{ title: string; time?: string; description?: string; status?: AdminStatus }>;
}
export function AdminTimeline(props: AdminTimelineProps) {
    const { items, ...rest } = props;
    const { setRef } = useBinding(undefined, { items });
    return createElement("aui-timeline", {
        ...elementProps(props, ["items"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminTooltipProps extends ElementProps {
    content?: string;
    side?: "top" | "bottom";
}
export function AdminTooltip(props: AdminTooltipProps) {
    const { content, side, ...rest } = props;
    const { setRef } = useBinding(undefined, { content, side });
    return createElement(
        "aui-tooltip",
        { ...elementProps(props, ["content", "side"]), ...rest, ref: setRef },
        props.children,
    );
}
export interface AdminPopoverProps extends ElementProps {
    open?: boolean;
    title?: string;
    onOpenChange?: (open: boolean) => void;
}
export function AdminPopover(props: AdminPopoverProps) {
    const { open, title, onOpenChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { open, title },
        {
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-popover",
        { ...elementProps(props, ["open", "title"], ["onOpenChange"]), ...rest, ref: setRef },
        props.children,
    );
}
export interface AdminDropdownProps extends ElementProps {
    items?: AdminMenuItem[];
    open?: boolean;
    onSelect?: (id: string) => void;
    onOpenChange?: (open: boolean) => void;
}
export function AdminDropdown(props: AdminDropdownProps) {
    const { items, open, onSelect, onOpenChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, open },
        {
            "aui-menu-select": onSelect
                ? (detail: { id: string }) => onSelect(detail.id)
                : undefined,
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-dropdown",
        {
            ...elementProps(props, ["items", "open"], ["onSelect", "onOpenChange"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}
export interface AdminDrawerProps extends ElementProps {
    open?: boolean;
    title?: string;
    side?: "left" | "right";
    width?: string;
    mobileMode?: "overlay" | "full";
    onOpenChange?: (open: boolean) => void;
}
export function AdminDrawer(props: AdminDrawerProps) {
    const { open, title, side, width, mobileMode, onOpenChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { open, title, side, width, mobileMode },
        {
            "aui-close": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-drawer",
        {
            ...elementProps(
                props,
                ["open", "title", "side", "width", "mobileMode"],
                ["onOpenChange"],
            ),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminFormProps extends ElementProps {
    layout?: AdminFormLayout;
    loading?: boolean;
    submitLabel?: string;
    resetLabel?: string;
    showActions?: boolean;
    noValidate?: boolean;
    onSubmit?: (detail: { valid: boolean }) => void;
    onInvalid?: () => void;
    onReset?: () => void;
    actions?: ReactNode;
}
export function AdminForm(props: AdminFormProps) {
    const {
        children,
        layout,
        loading,
        submitLabel,
        resetLabel,
        showActions,
        noValidate,
        onSubmit,
        onInvalid,
        onReset,
        actions,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { layout, loading, submitLabel, resetLabel, showActions, noValidate },
        {
            "aui-submit": onSubmit,
            "aui-invalid": onInvalid,
            "aui-reset": onReset,
        },
    );
    return createElement(
        "aui-form",
        {
            ...elementProps(
                props,
                [
                    "layout",
                    "loading",
                    "submitLabel",
                    "resetLabel",
                    "showActions",
                    "noValidate",
                    "actions",
                ],
                ["onSubmit", "onInvalid", "onReset"],
            ),
            ...rest,
            ref: setRef,
        },
        [children, renderSlot("actions", actions)],
    );
}

export interface AdminFormItemProps extends ElementProps {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    name?: string;
}
export function AdminFormItem(props: AdminFormItemProps) {
    const { children, label, description, error, required, name, ...rest } = props;
    const { setRef } = useBinding(undefined, { label, description, error, required, name });
    return createElement(
        "aui-form-item",
        {
            ...elementProps(props, ["label", "description", "error", "required", "name"]),
            ...rest,
            ref: setRef,
        },
        children,
    );
}

export interface AdminSchemaFormProps extends ElementProps {
    fields?: AdminSchemaFormField[];
    values?: Record<string, AdminSchemaFormValue>;
    layout?: AdminFormLayout;
    loading?: boolean;
    submitLabel?: string;
    resetLabel?: string;
    onChange?: (detail: {
        name: string;
        value: AdminSchemaFormValue;
        values: Record<string, AdminSchemaFormValue>;
    }) => void;
    onSubmit?: (detail: { valid: boolean; values: Record<string, AdminSchemaFormValue> }) => void;
    onReset?: (values: Record<string, AdminSchemaFormValue>) => void;
}
export function AdminSchemaForm(props: AdminSchemaFormProps) {
    const {
        fields,
        values,
        layout,
        loading,
        submitLabel,
        resetLabel,
        onChange,
        onSubmit,
        onReset,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { fields, values, layout, loading, submitLabel, resetLabel },
        {
            "aui-change": onChange,
            "aui-submit": onSubmit,
            "aui-reset": onReset,
        },
    );
    return createElement("aui-schema-form", {
        ...elementProps(
            props,
            ["fields", "values", "layout", "loading", "submitLabel", "resetLabel"],
            ["onChange", "onSubmit", "onReset"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminTruncatedTextProps extends ElementProps {
    text?: string;
    lines?: number;
    label?: string;
}
export function AdminTruncatedText(props: AdminTruncatedTextProps) {
    const { children, text, lines, label, ...rest } = props;
    const { setRef } = useBinding(undefined, { text, lines, label });
    return createElement(
        "aui-truncated-text",
        { ...elementProps(props, ["text", "lines", "label"]), ...rest, ref: setRef },
        children,
    );
}

export interface AdminLoadingOverlayProps extends ElementProps {
    open?: boolean;
    label?: string;
    fullscreen?: boolean;
}
export function AdminLoadingOverlay(props: AdminLoadingOverlayProps) {
    const { children, open, label, fullscreen, ...rest } = props;
    const { setRef } = useBinding(undefined, { open, label, fullscreen });
    return createElement(
        "aui-loading-overlay",
        { ...elementProps(props, ["open", "label", "fullscreen"]), ...rest, ref: setRef },
        children,
    );
}

export interface AdminProgressRingProps extends ElementProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    showValue?: boolean;
}
export function AdminProgressRing(props: AdminProgressRingProps) {
    const { value, max, size, strokeWidth, label, showValue, ...rest } = props;
    const { setRef } = useBinding(undefined, { value, max, size, strokeWidth, label, showValue });
    return createElement("aui-progress-ring", {
        ...elementProps(props, ["value", "max", "size", "strokeWidth", "label", "showValue"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminColumnSettingsProps extends ElementProps {
    columns?: AdminDataGridColumn[];
    visibleKeys?: string[];
    open?: boolean;
    title?: string;
    closeLabel?: string;
    onChange?: (detail: { keys: string[]; columns: AdminDataGridColumn[] }) => void;
    onOpenChange?: (open: boolean) => void;
}
export function AdminColumnSettings(props: AdminColumnSettingsProps) {
    const { columns, visibleKeys, open, title, closeLabel, onChange, onOpenChange, ...rest } =
        props;
    const { setRef } = useBinding(
        undefined,
        { columns, visibleKeys, open, title, closeLabel },
        {
            "aui-column-settings-change": onChange,
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement("aui-column-settings", {
        ...elementProps(
            props,
            ["columns", "visibleKeys", "open", "title", "closeLabel"],
            ["onChange", "onOpenChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminToastProps extends ElementProps {
    open?: boolean;
    title?: string;
    message?: string;
    variant?: AdminAlertVariant | "default";
    duration?: number;
    onClose?: () => void;
}

export interface AdminToastManagerProps extends ElementProps {
    items?: AdminToastItem[];
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    max?: number;
    persistKey?: string;
    syncTabs?: boolean;
    channelName?: string;
    label?: string;
    onChange?: (items: AdminToastItem[]) => void;
}
export function AdminToastManager(props: AdminToastManagerProps) {
    const { items, position, max, persistKey, syncTabs, channelName, label, onChange, ...rest } =
        props;
    const { setRef } = useBinding(
        undefined,
        { items, position, max, persistKey, syncTabs, channelName, label },
        {
            "aui-toast-manager-change": onChange
                ? (detail: { items: AdminToastItem[] }) => onChange(detail.items)
                : undefined,
        },
    );
    return createElement("aui-toast-manager", {
        ...elementProps(
            props,
            ["items", "position", "max", "persistKey", "syncTabs", "channelName", "label"],
            ["onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}
export function AdminToast(props: AdminToastProps) {
    const { open, title, message, variant, duration, onClose, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { open, title, message, variant, duration },
        { "aui-close": onClose ? () => onClose() : undefined },
    );
    return createElement(
        "aui-toast",
        {
            ...elementProps(
                props,
                ["open", "title", "message", "variant", "duration"],
                ["onClose"],
            ),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminDataListProps extends ElementProps {
    items?: Array<{ label: string; value: string }>;
    columns?: number;
}
export function AdminDataList(props: AdminDataListProps) {
    const { items, columns, ...rest } = props;
    const { setRef } = useBinding(undefined, { items, columns });
    return createElement("aui-data-list", {
        ...elementProps(props, ["items", "columns"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminCalendarProps extends ElementProps {
    value?: string;
    min?: string;
    max?: string;
    label?: string;
    onChange?: (value: string) => void;
}
export function AdminCalendar(props: AdminCalendarProps) {
    const { value, min, max, label, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, min, max, label },
        {
            "aui-date-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-calendar", {
        ...elementProps(props, ["value", "min", "max", "label"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminSearchProps extends ElementProps {
    value?: string;
    placeholder?: string;
    debounce?: number;
    onSearch?: (value: string) => void;
}
export function AdminSearch(props: AdminSearchProps) {
    const { value, placeholder, debounce, onSearch, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, placeholder, debounce },
        {
            "aui-search": onSearch
                ? (detail: { value: string }) => onSearch(detail.value)
                : undefined,
        },
    );
    return createElement("aui-search", {
        ...elementProps(props, ["value", "placeholder", "debounce"], ["onSearch"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminCalendarGridProps extends ElementProps {
    month?: number;
    year?: number;
    selected?: string;
    onChange?: (value: string) => void;
}
export function AdminCalendarGrid(props: AdminCalendarGridProps) {
    const { month, year, selected, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { month, year, selected },
        {
            "aui-date-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-calendar-grid", {
        ...elementProps(props, ["month", "year", "selected"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}
export interface AdminChartContainerProps extends ElementProps {
    title?: string;
    description?: string;
    height?: string;
    legend?: Array<{ label: string; color?: string; value?: string }>;
    tooltip?: string;
}
export function AdminChartContainer(props: AdminChartContainerProps) {
    const { title, description, height, legend, tooltip, ...rest } = props;
    const { setRef } = useBinding(undefined, { title, description, height, legend, tooltip });
    return createElement(
        "aui-chart-container",
        {
            ...elementProps(props, ["title", "description", "height", "legend", "tooltip"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminTreeTableProps extends ElementProps {
    columns?: AdminDataGridColumn[];
    nodes?: AdminTreeTableNode[];
    expanded?: Array<string | number>;
    selected?: string | number | null;
    selectable?: boolean;
    emptyLabel?: string;
    onToggle?: (detail: { id: string | number; expanded: boolean }) => void;
    onSelect?: (detail: { id: string | number; node: AdminTreeTableNode }) => void;
}
export function AdminTreeTable(props: AdminTreeTableProps) {
    const {
        columns,
        nodes,
        expanded,
        selected,
        selectable,
        emptyLabel,
        onToggle,
        onSelect,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { columns, nodes, expanded, selected, selectable, emptyLabel },
        { "aui-tree-table-toggle": onToggle, "aui-tree-table-select": onSelect },
    );
    return createElement("aui-tree-table", {
        ...elementProps(
            props,
            ["columns", "nodes", "expanded", "selected", "selectable", "emptyLabel"],
            ["onToggle", "onSelect"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminListViewProps extends ElementProps, AdminAsyncStateProps {
    items?: AdminListViewItem[];
    loading?: boolean;
    error?: boolean;
    selectable?: boolean;
    selectedKeys?: Array<string | number>;
    loadingLabel?: string;
    emptyLabel?: string;
    errorLabel?: string;
    onRetry?: (detail: { source: string; reason: "error" | "permission-denied" }) => void;
    onSelect?: (detail: {
        id: string | number;
        item: AdminListViewItem;
        selectedKeys: Array<string | number>;
    }) => void;
}
export function AdminListView(props: AdminListViewProps) {
    const {
        children,
        items,
        loading,
        error,
        selectable,
        selectedKeys,
        loadingLabel,
        emptyLabel,
        errorLabel,
        permissionDenied,
        permissionDeniedLabel,
        retryable,
        retryLabel,
        onRetry,
        onSelect,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        {
            items,
            loading,
            error,
            selectable,
            selectedKeys,
            loadingLabel,
            emptyLabel,
            errorLabel,
            permissionDenied,
            permissionDeniedLabel,
            retryable,
            retryLabel,
        },
        { "aui-list-view-select": onSelect, "aui-retry": onRetry },
    );
    return createElement(
        "aui-list-view",
        {
            ...elementProps(
                props,
                [
                    "items",
                    "loading",
                    "error",
                    "selectable",
                    "selectedKeys",
                    "loadingLabel",
                    "emptyLabel",
                    "errorLabel",
                    "permissionDenied",
                    "permissionDeniedLabel",
                    "retryable",
                    "retryLabel",
                ],
                ["onSelect", "onRetry"],
            ),
            ...rest,
            ref: setRef,
        },
        children,
    );
}

export interface AdminFilterBuilderProps extends ElementProps {
    fields?: AdminFilterField[];
    filters?: AdminFilterNode[];
    maxRules?: number;
    maxDepth?: number;
    addLabel?: string;
    addGroupLabel?: string;
    clearLabel?: string;
    applyLabel?: string;
    onChange?: (detail: { filters: AdminFilterRule[] }) => void;
    onSubmit?: (detail: { filters: AdminFilterRule[] }) => void;
}
export function AdminFilterBuilder(props: AdminFilterBuilderProps) {
    const {
        fields,
        filters,
        maxRules,
        maxDepth,
        addLabel,
        addGroupLabel,
        clearLabel,
        applyLabel,
        onChange,
        onSubmit,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { fields, filters, maxRules, maxDepth, addLabel, addGroupLabel, clearLabel, applyLabel },
        { "aui-filter-builder-change": onChange, "aui-filter-builder-submit": onSubmit },
    );
    return createElement("aui-filter-builder", {
        ...elementProps(
            props,
            [
                "fields",
                "filters",
                "maxRules",
                "maxDepth",
                "addLabel",
                "addGroupLabel",
                "clearLabel",
                "applyLabel",
            ],
            ["onChange", "onSubmit"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminQueryBuilderProps extends ElementProps {
    fields?: AdminFilterField[];
    rules?: AdminQueryNode[];
    logic?: "and" | "or";
    maxDepth?: number;
    applyLabel?: string;
    onChange?: (detail: { logic: "and" | "or"; rules: AdminQueryRule[] }) => void;
    onSubmit?: (detail: { logic: "and" | "or"; rules: AdminQueryRule[] }) => void;
}
export function AdminQueryBuilder(props: AdminQueryBuilderProps) {
    const { fields, rules, logic, maxDepth, applyLabel, onChange, onSubmit, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { fields, rules, logic, maxDepth, applyLabel },
        { "aui-query-change": onChange, "aui-query-submit": onSubmit },
    );
    return createElement("aui-query-builder", {
        ...elementProps(
            props,
            ["fields", "rules", "logic", "maxDepth", "applyLabel"],
            ["onChange", "onSubmit"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminJsonViewerProps extends ElementProps {
    value: unknown;
    title?: string;
    expanded?: boolean;
}
export function AdminJsonViewer(props: AdminJsonViewerProps) {
    const { value, title, expanded, ...rest } = props;
    const { setRef } = useBinding(undefined, { value, title, expanded });
    return createElement(
        "aui-json-viewer",
        { ...elementProps(props, ["value", "title", "expanded"]), ...rest, ref: setRef },
        props.children,
    );
}
export interface AdminLogViewerProps extends ElementProps {
    entries?: AdminLogEntry[];
    follow?: boolean;
}
export function AdminLogViewer(props: AdminLogViewerProps) {
    const { entries, follow, ...rest } = props;
    const { setRef } = useBinding(undefined, { entries, follow });
    return createElement(
        "aui-log-viewer",
        { ...elementProps(props, ["entries", "follow"]), ...rest, ref: setRef },
        props.children,
    );
}
export interface AdminDataGridProps extends ElementProps, AdminAsyncStateProps {
    columns?: AdminDataGridColumn[];
    rows?: Array<Record<string, unknown> & { id?: string | number }>;
    loading?: boolean;
    error?: boolean;
    selectable?: boolean;
    mobileCards?: boolean;
    virtual?: boolean;
    serverSide?: boolean;
    emptyLabel?: string;
    loadingLabel?: string;
    errorLabel?: string;
    onRetry?: (detail: { source: string; reason: "error" | "permission-denied" }) => void;
    sortKey?: string;
    sortDirection?: AdminDataGridSortDirection;
    selectedKeys?: Array<string | number>;
    filters?: Record<string, string>;
    batchActions?: AdminDataGridBatchAction[];
    page?: number;
    pageSize?: number;
    total?: number;
    pageSizeOptions?: number[];
    rowHeight?: number;
    virtualOverscan?: number;
    rowKey?: string;
    onSortChange?: (detail: { key: string; direction: AdminDataGridSortDirection }) => void;
    onFilterChange?: (detail: {
        filters: Record<string, string>;
        key: string;
        value: string;
    }) => void;
    onSelectionChange?: (detail: { keys: Array<string | number> }) => void;
    onBatchAction?: (detail: {
        id: string;
        keys: Array<string | number>;
        rows: Array<Record<string, unknown>>;
    }) => void;
    onPageChange?: (detail: { page: number; pageSize: number; total: number }) => void;
}
export function AdminDataGrid(props: AdminDataGridProps) {
    const {
        children,
        columns,
        rows,
        loading,
        error,
        selectable,
        mobileCards,
        virtual,
        serverSide,
        emptyLabel,
        loadingLabel,
        errorLabel,
        permissionDenied,
        permissionDeniedLabel,
        retryable,
        retryLabel,
        sortKey,
        sortDirection,
        selectedKeys,
        filters,
        batchActions,
        page,
        pageSize,
        total,
        pageSizeOptions,
        rowHeight,
        virtualOverscan,
        rowKey,
        onSortChange,
        onFilterChange,
        onSelectionChange,
        onBatchAction,
        onPageChange,
        onRetry,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        {
            columns,
            rows,
            loading,
            error,
            selectable,
            mobileCards,
            virtual,
            serverSide,
            emptyLabel,
            loadingLabel,
            errorLabel,
            permissionDenied,
            permissionDeniedLabel,
            retryable,
            retryLabel,
            sortKey,
            sortDirection,
            selectedKeys,
            filters,
            batchActions,
            page,
            pageSize,
            total,
            pageSizeOptions,
            rowHeight,
            virtualOverscan,
            rowKey,
        },
        {
            "aui-sort-change": onSortChange,
            "aui-filter-change": onFilterChange,
            "aui-selection-change": onSelectionChange,
            "aui-batch-action": onBatchAction,
            "aui-page-change": onPageChange,
            "aui-retry": onRetry,
        },
    );
    return createElement(
        "aui-data-grid",
        {
            ...elementProps(
                props,
                [
                    "columns",
                    "rows",
                    "loading",
                    "error",
                    "selectable",
                    "mobileCards",
                    "virtual",
                    "serverSide",
                    "emptyLabel",
                    "loadingLabel",
                    "errorLabel",
                    "permissionDenied",
                    "permissionDeniedLabel",
                    "retryable",
                    "retryLabel",
                    "sortKey",
                    "sortDirection",
                    "selectedKeys",
                    "filters",
                    "batchActions",
                    "page",
                    "pageSize",
                    "total",
                    "pageSizeOptions",
                    "rowHeight",
                    "virtualOverscan",
                    "rowKey",
                ],
                [
                    "onSortChange",
                    "onFilterChange",
                    "onSelectionChange",
                    "onBatchAction",
                    "onPageChange",
                    "onRetry",
                ],
            ),
            ...rest,
            ref: setRef,
        },
        children,
    );
}
export interface AdminKanbanProps extends ElementProps {
    columns?: AdminKanbanColumn[];
    onChange?: (detail: { itemId: string; columnId: string }) => void;
}
export function AdminKanban(props: AdminKanbanProps) {
    const { columns, onChange, ...rest } = props;
    const { setRef } = useBinding(undefined, { columns }, { "aui-kanban-change": onChange });
    return createElement("aui-kanban", {
        ...elementProps(props, ["columns"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}

export function AdminSpinner(props: ElementProps) {
    const { setRef } = useBinding(undefined);
    return createElement(
        "aui-spinner",
        { ...elementProps(props, []), ref: setRef },
        props.children,
    );
}

export interface AdminContainerProps extends ElementProps {
    maxWidth?: string;
    centered?: boolean;
}
export function AdminContainer(props: AdminContainerProps) {
    const { maxWidth, centered, ...rest } = props;
    const { setRef } = useBinding(undefined, { maxWidth, centered });
    return createElement("aui-container", {
        ...elementProps(props, ["maxWidth", "centered"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminSplitterProps extends ElementProps {
    direction?: "horizontal" | "vertical";
    initial?: number;
    min?: number;
    before?: ReactNode;
    after?: ReactNode;
    onSplit?: (percent: number) => void;
}
export function AdminSplitter(props: AdminSplitterProps) {
    const { direction, initial, min, before, after, onSplit, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { direction, initial, min },
        {
            "aui-splitter-change": onSplit
                ? (detail: { percent: number }) => onSplit(detail.percent)
                : undefined,
        },
    );
    return createElement(
        "aui-splitter",
        {
            ...elementProps(props, ["direction", "initial", "min", "before", "after"], ["onSplit"]),
            ...rest,
            ref: setRef,
        },
        [
            before !== undefined
                ? createElement("span", { slot: "before", key: "before" }, before)
                : null,
            after !== undefined
                ? createElement("span", { slot: "after", key: "after" }, after)
                : null,
            props.children,
        ],
    );
}

export interface AdminToggleProps extends ElementProps {
    pressed?: boolean;
    disabled?: boolean;
    label?: string;
    onToggle?: (pressed: boolean) => void;
}
export function AdminToggle(props: AdminToggleProps) {
    const { pressed, disabled, label, onToggle, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { pressed, disabled, label },
        {
            "aui-toggle-change": onToggle
                ? (detail: { pressed: boolean }) => onToggle(detail.pressed)
                : undefined,
        },
    );
    return createElement(
        "aui-toggle",
        {
            ...elementProps(props, ["pressed", "disabled", "label"], ["onToggle"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminToggleGroupProps extends ElementProps {
    items?: Array<{ id: string; label: string; disabled?: boolean }>;
    value?: string;
    values?: string[];
    multiple?: boolean;
    onChange?: (detail: { value: string; values?: string[] }) => void;
}
export function AdminToggleGroup(props: AdminToggleGroupProps) {
    const { items, value, values, multiple, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, value, values, multiple },
        {
            "aui-toggle-group-change": onChange
                ? (detail: { value: string; values?: string[] }) => onChange(detail)
                : undefined,
        },
    );
    return createElement("aui-toggle-group", {
        ...elementProps(props, ["items", "value", "values", "multiple"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminCollapsibleProps extends ElementProps {
    open?: boolean;
    title?: string;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export function AdminCollapsible(props: AdminCollapsibleProps) {
    const { open, title, disabled, onOpenChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { open, title, disabled },
        {
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-collapsible",
        {
            ...elementProps(props, ["open", "title", "disabled"], ["onOpenChange"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminAspectRatioProps extends ElementProps {
    ratio?: string;
}
export function AdminAspectRatio(props: AdminAspectRatioProps) {
    const { ratio, ...rest } = props;
    const { setRef } = useBinding(undefined, { ratio });
    return createElement(
        "aui-aspect-ratio",
        { ...elementProps(props, ["ratio"]), ...rest, ref: setRef },
        props.children,
    );
}

export interface AdminScrollAreaProps extends ElementProps {
    orientation?: "vertical" | "horizontal" | "both";
    maxHeight?: string;
}
export function AdminScrollArea(props: AdminScrollAreaProps) {
    const { orientation, maxHeight, ...rest } = props;
    const { setRef } = useBinding(undefined, { orientation, maxHeight });
    return createElement(
        "aui-scroll-area",
        { ...elementProps(props, ["orientation", "maxHeight"]), ...rest, ref: setRef },
        props.children,
    );
}

export interface AdminNumberInputProps extends ElementProps {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    disabled?: boolean;
    onChange?: (value: number) => void;
}
export function AdminNumberInput(props: AdminNumberInputProps) {
    const { value, min, max, step, label, disabled, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, min, max, step, label, disabled },
        {
            "aui-number-change": onChange
                ? (detail: { value: number }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-number-input", {
        ...elementProps(props, ["value", "min", "max", "step", "label", "disabled"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminCodeBlockProps extends ElementProps {
    code?: string;
    language?: string;
    copyLabel?: string;
    onCopy?: (text: string) => void;
}
export function AdminCodeBlock(props: AdminCodeBlockProps) {
    const { code, language, copyLabel, onCopy, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { code, language, copyLabel },
        { "aui-copy": onCopy ? (detail: { text: string }) => onCopy(detail.text) : undefined },
    );
    return createElement(
        "aui-code-block",
        {
            ...elementProps(props, ["code", "language", "copyLabel"], ["onCopy"]),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminColorPickerProps extends ElementProps {
    value?: string;
    label?: string;
    disabled?: boolean;
    onColorChange?: (value: string) => void;
}
export function AdminColorPicker(props: AdminColorPickerProps) {
    const { value, label, disabled, onColorChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, label, disabled },
        {
            "aui-color-change": onColorChange
                ? (detail: { value: string }) => onColorChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-color-picker", {
        ...elementProps(props, ["value", "label", "disabled"], ["onColorChange"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminColorTagProps extends ElementProps {
    color?: string;
    label?: string;
}
export function AdminColorTag(props: AdminColorTagProps) {
    const { color, label, ...rest } = props;
    const { setRef } = useBinding(undefined, { color, label });
    return createElement(
        "aui-color-tag",
        { ...elementProps(props, ["color", "label"]), ...rest, ref: setRef },
        props.children,
    );
}

export interface AdminMenuProps extends ElementProps {
    items?: AdminMenuEntry[];
    value?: string;
    orientation?: "vertical" | "horizontal";
    compact?: boolean;
    onSelect?: (id: string, item: AdminMenuEntry) => void;
}
export function AdminMenu(props: AdminMenuProps) {
    const { items, value, orientation, compact, onSelect, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, value, orientation, compact },
        {
            "aui-menu-select": onSelect
                ? (detail: { id: string; item: AdminMenuEntry }) => onSelect(detail.id, detail.item)
                : undefined,
        },
    );
    return createElement("aui-menu", {
        ...elementProps(props, ["items", "value", "orientation", "compact"], ["onSelect"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminSidebarProps extends ElementProps {
    open?: boolean;
    title?: string;
    width?: string;
    closeLabel?: string;
    footer?: ReactNode;
    onOpenChange?: (open: boolean) => void;
}
export function AdminSidebar(props: AdminSidebarProps) {
    const { children, open, title, width, closeLabel, footer, onOpenChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { open, title, width, closeLabel },
        {
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-sidebar",
        {
            ...elementProps(
                props,
                ["open", "title", "width", "closeLabel", "footer"],
                ["onOpenChange"],
            ),
            ...rest,
            ref: setRef,
        },
        [children, renderSlot("footer", footer)],
    );
}

export interface AdminNavbarProps extends ElementProps {
    title?: string;
    sticky?: boolean;
    bordered?: boolean;
    brand?: ReactNode;
    actions?: ReactNode;
}
export function AdminNavbar(props: AdminNavbarProps) {
    const { children, title, sticky, bordered, brand, actions, ...rest } = props;
    const { setRef } = useBinding(undefined, { title, sticky, bordered });
    return createElement(
        "aui-navbar",
        {
            ...elementProps(props, ["title", "sticky", "bordered", "brand", "actions"]),
            ...rest,
            ref: setRef,
        },
        [renderSlot("brand", brand), children, renderSlot("actions", actions)],
    );
}

export interface AdminDatePickerProps extends ElementProps {
    value?: string;
    min?: string;
    max?: string;
    label?: string;
    disabled?: boolean;
    picker?: "native" | "custom";
    onChange?: (value: string) => void;
}
export function AdminDatePicker(props: AdminDatePickerProps) {
    const { value, min, max, label, disabled, picker, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, min, max, label, disabled, picker },
        {
            "aui-date-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-date-picker", {
        ...elementProps(
            props,
            ["value", "min", "max", "label", "disabled", "picker"],
            ["onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminTimePickerProps extends ElementProps {
    value?: string;
    min?: string;
    max?: string;
    step?: number;
    label?: string;
    disabled?: boolean;
    picker?: "native" | "custom";
    onChange?: (value: string) => void;
}
export function AdminTimePicker(props: AdminTimePickerProps) {
    const { value, min, max, step, label, disabled, picker, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { value, min, max, step, label, disabled, picker },
        {
            "aui-time-change": onChange
                ? (detail: { value: string }) => onChange(detail.value)
                : undefined,
        },
    );
    return createElement("aui-time-picker", {
        ...elementProps(
            props,
            ["value", "min", "max", "step", "label", "disabled", "picker"],
            ["onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminPinInputProps extends ElementProps {
    length?: number;
    value?: string;
    masked?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (value: string, complete: boolean) => void;
}
export function AdminPinInput(props: AdminPinInputProps) {
    const { length, value, masked, disabled, label, onChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { length, value, masked, disabled, label },
        {
            "aui-pin-change": onChange
                ? (detail: { value: string; complete: boolean }) =>
                      onChange(detail.value, detail.complete)
                : undefined,
        },
    );
    return createElement("aui-pin-input", {
        ...elementProps(props, ["length", "value", "masked", "disabled", "label"], ["onChange"]),
        ...rest,
        ref: setRef,
    });
}

export interface AdminDescriptionsProps extends ElementProps {
    items?: AdminDescriptionItem[];
    columns?: number;
    bordered?: boolean;
    compact?: boolean;
}
export function AdminDescriptions(props: AdminDescriptionsProps) {
    const { children, items, columns, bordered, compact, ...rest } = props;
    const { setRef } = useBinding(undefined, { items, columns, bordered, compact });
    return createElement(
        "aui-descriptions",
        {
            ...elementProps(props, ["items", "columns", "bordered", "compact"]),
            ...rest,
            ref: setRef,
        },
        children,
    );
}

export interface AdminCascaderProps extends ElementProps {
    options?: AdminCascaderOption[];
    value?: string[];
    placeholder?: string;
    disabled?: boolean;
    open?: boolean;
    searchable?: boolean;
    onChange?: (value: string[], options: AdminCascaderOption[]) => void;
    onOpenChange?: (open: boolean) => void;
}
export function AdminCascader(props: AdminCascaderProps) {
    const {
        options,
        value,
        placeholder,
        disabled,
        open,
        searchable,
        onChange,
        onOpenChange,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { options, value, placeholder, disabled, open, searchable },
        {
            "aui-cascader-change": onChange
                ? (detail: { value: string[]; options: AdminCascaderOption[] }) =>
                      onChange(detail.value, detail.options)
                : undefined,
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement("aui-cascader", {
        ...elementProps(
            props,
            ["options", "value", "placeholder", "disabled", "open", "searchable"],
            ["onChange", "onOpenChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminTransferProps extends ElementProps {
    options?: AdminTransferOption[];
    values?: string[];
    sourceTitle?: string;
    targetTitle?: string;
    searchable?: boolean;
    disabled?: boolean;
    onChange?: (values: string[], added: string[], removed: string[]) => void;
}
export function AdminTransfer(props: AdminTransferProps) {
    const { options, values, sourceTitle, targetTitle, searchable, disabled, onChange, ...rest } =
        props;
    const { setRef } = useBinding(
        undefined,
        { options, values, sourceTitle, targetTitle, searchable, disabled },
        {
            "aui-transfer-change": onChange
                ? (detail: { values: string[]; added: string[]; removed: string[] }) =>
                      onChange(detail.values, detail.added, detail.removed)
                : undefined,
        },
    );
    return createElement("aui-transfer", {
        ...elementProps(
            props,
            ["options", "values", "sourceTitle", "targetTitle", "searchable", "disabled"],
            ["onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminContextMenuProps extends ElementProps {
    items?: AdminMenuEntry[];
    open?: boolean;
    x?: number;
    y?: number;
    label?: string;
    onSelect?: (id: string, item: AdminMenuEntry) => void;
    onOpenChange?: (open: boolean) => void;
}
export function AdminContextMenu(props: AdminContextMenuProps) {
    const { items, open, x, y, label, onSelect, onOpenChange, ...rest } = props;
    const { setRef } = useBinding(
        undefined,
        { items, open, x, y, label },
        {
            "aui-menu-select": onSelect
                ? (detail: { id: string; item: AdminMenuEntry }) => onSelect(detail.id, detail.item)
                : undefined,
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-context-menu",
        {
            ...elementProps(
                props,
                ["items", "open", "x", "y", "label"],
                ["onSelect", "onOpenChange"],
            ),
            ...rest,
            ref: setRef,
        },
        props.children,
    );
}

export interface AdminHoverCardProps extends ElementProps {
    title?: string;
    side?: "top" | "bottom" | "left" | "right";
    delay?: number;
    closeDelay?: number;
    open?: boolean;
    trigger?: ReactNode;
    content?: ReactNode;
    onOpenChange?: (open: boolean) => void;
}
export function AdminHoverCard(props: AdminHoverCardProps) {
    const {
        children,
        title,
        side,
        delay,
        closeDelay,
        open,
        trigger,
        content,
        onOpenChange,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { title, side, delay, closeDelay, open },
        {
            "aui-open-change": onOpenChange
                ? (detail: { open: boolean }) => onOpenChange(detail.open)
                : undefined,
        },
    );
    return createElement(
        "aui-hover-card",
        {
            ...elementProps(
                props,
                ["title", "side", "delay", "closeDelay", "open", "trigger", "content"],
                ["onOpenChange"],
            ),
            ...rest,
            ref: setRef,
        },
        [renderSlot("trigger", trigger ?? children), renderSlot("content", content)],
    );
}

export interface AdminNotificationCenterProps extends ElementProps {
    notifications?: AdminNotificationItem[];
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    max?: number;
    persistKey?: string;
    clearLabel?: string;
    onClose?: (id: string) => void;
    onAction?: (id: string, item: AdminNotificationItem) => void;
    onChange?: (notifications: AdminNotificationItem[]) => void;
}
export function AdminNotificationCenter(props: AdminNotificationCenterProps) {
    const {
        notifications,
        position,
        max,
        persistKey,
        clearLabel,
        onClose,
        onAction,
        onChange,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { notifications, position, max, persistKey, clearLabel },
        {
            "aui-notification-close": onClose
                ? (detail: { id: string }) => onClose(detail.id)
                : undefined,
            "aui-notification-action": onAction
                ? (detail: { id: string; item: AdminNotificationItem }) =>
                      onAction(detail.id, detail.item)
                : undefined,
            "aui-notifications-change": onChange
                ? (detail: { notifications: AdminNotificationItem[] }) =>
                      onChange(detail.notifications)
                : undefined,
        },
    );
    return createElement("aui-notification-center", {
        ...elementProps(
            props,
            ["notifications", "position", "max", "persistKey", "clearLabel"],
            ["onClose", "onAction", "onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminUploadListProps extends ElementProps {
    files?: AdminUploadItem[];
    removable?: boolean;
    retryable?: boolean;
    previewable?: boolean;
    compact?: boolean;
    disabled?: boolean;
    emptyLabel?: string;
    onRemove?: (id: string, file: AdminUploadItem) => void;
    onRetry?: (id: string, file: AdminUploadItem) => void;
    onPreview?: (id: string, file: AdminUploadItem) => void;
    onChange?: (files: AdminUploadItem[]) => void;
}
export function AdminUploadList(props: AdminUploadListProps) {
    const {
        files,
        removable,
        retryable,
        previewable,
        compact,
        disabled,
        emptyLabel,
        onRemove,
        onRetry,
        onPreview,
        onChange,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { files, removable, retryable, previewable, compact, disabled, emptyLabel },
        {
            "aui-upload-remove": onRemove
                ? (detail: { id: string; file: AdminUploadItem }) =>
                      onRemove(detail.id, detail.file)
                : undefined,
            "aui-upload-retry": onRetry
                ? (detail: { id: string; file: AdminUploadItem }) => onRetry(detail.id, detail.file)
                : undefined,
            "aui-upload-preview": onPreview
                ? (detail: { id: string; file: AdminUploadItem }) =>
                      onPreview(detail.id, detail.file)
                : undefined,
            "aui-upload-change": onChange
                ? (detail: { files: AdminUploadItem[] }) => onChange(detail.files)
                : undefined,
        },
    );
    return createElement("aui-upload-list", {
        ...elementProps(
            props,
            ["files", "removable", "retryable", "previewable", "compact", "disabled", "emptyLabel"],
            ["onRemove", "onRetry", "onPreview", "onChange"],
        ),
        ...rest,
        ref: setRef,
    });
}

export interface AdminFilePreviewProps extends ElementProps {
    file?: AdminUploadItem | null;
    open?: boolean;
    title?: string;
    closeLabel?: string;
    downloadLabel?: string;
    downloadable?: boolean;
    onClose?: (file: AdminUploadItem | null) => void;
    onDownload?: (file: AdminUploadItem) => void;
}
export function AdminFilePreview(props: AdminFilePreviewProps) {
    const {
        file,
        open,
        title,
        closeLabel,
        downloadLabel,
        downloadable,
        onClose,
        onDownload,
        ...rest
    } = props;
    const { setRef } = useBinding(
        undefined,
        { file, open, title, closeLabel, downloadLabel, downloadable },
        {
            "aui-file-preview-close": onClose
                ? (detail: { file: AdminUploadItem | null }) => onClose(detail.file)
                : undefined,
            "aui-file-download": onDownload
                ? (detail: { file: AdminUploadItem }) => onDownload(detail.file)
                : undefined,
        },
    );
    return createElement("aui-file-preview", {
        ...elementProps(
            props,
            ["file", "open", "title", "closeLabel", "downloadLabel", "downloadable"],
            ["onClose", "onDownload"],
        ),
        ...rest,
        ref: setRef,
    });
}
