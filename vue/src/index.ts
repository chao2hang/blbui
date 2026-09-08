/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import {
    defineComponent,
    h,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    type PropType,
    type VNode,
} from "vue";
import { registerAdminElements } from "@chaos_team/blbui-core/register";
import type {
    AdminButtonSize,
    AdminButtonVariant,
    AdminCascaderOption,
    AdminMenuEntry,
    AdminNavItem,
    AdminNotificationItem,
    AdminSelectOption,
    AdminStatus,
    AdminTabItem,
    AdminTransferOption,
    AdminUploadItem,
    AdminDataGridColumn,
    AdminFormLayout,
    AdminSchemaFormField,
    AdminSchemaFormValue,
} from "@chaos_team/blbui-core";

import "@chaos_team/blbui-core/styles.css";

type AdminElement = HTMLElement & Record<string, unknown>;

type ElementOptions = {
    tag: string;
    properties?: string[];
    event?: string;
    eventProp?: string;
    events?: Array<{ name: string; prop: string }>;
    slots?: string[];
};

function syncAdminElement(
    element: AdminElement | null,
    properties: string[],
    props: Record<string, unknown>,
): void {
    if (!element) return;
    for (const property of properties) {
        if (props[property] !== undefined) element[property] = props[property];
    }
}

function registerVueAdminElementLifecycle(
    element: { value: AdminElement | null },
    options: ElementOptions,
    props: Record<string, unknown>,
    handlers: Record<string, unknown>,
): void {
    // `props` is the live reactive proxy: reading it inside `sync` (invoked by
    // onUpdated) always sees the parent's current prop values. A setup-time
    // snapshot would freeze parent-driven updates after the first render.
    const sync = () => syncAdminElement(element.value, options.properties ?? [], props);
    onMounted(() => {
        registerAdminElements();
        sync();
        const bindings = [
            ...(options.event && options.eventProp
                ? [{ name: options.event, prop: options.eventProp }]
                : []),
            ...(options.events ?? []),
        ];
        const cleanups: Array<() => void> = [];
        for (const binding of bindings) {
            const callback = handlers[binding.prop];
            if (typeof callback !== "function") continue;
            const handler = (event: Event) =>
                (callback as (detail: unknown) => void)((event as CustomEvent).detail);
            element.value?.addEventListener(binding.name, handler);
            cleanups.push(() => element.value?.removeEventListener(binding.name, handler));
        }
        onBeforeUnmount(() => cleanups.forEach((cleanup) => cleanup()));
    });
    onUpdated(sync);
}

function createAdminVNode(
    options: ElementOptions,
    element: { value: AdminElement | null },
    props: Record<string, unknown>,
    slots: Record<string, (() => VNode[] | undefined) | undefined>,
) {
    const attributes: Record<string, unknown> = {
        ref: (node: AdminElement | null) => {
            element.value = node;
        },
    };
    for (const [key, value] of Object.entries(props)) {
        if (
            key !== "children" &&
            !options.properties?.includes(key) &&
            key !== options.eventProp &&
            !(options.events ?? []).some((event) => event.prop === key) &&
            value !== undefined
        ) {
            attributes[key] = value;
        }
    }
    const children: VNode[] = [];
    for (const slotName of options.slots ?? []) {
        const slot = slots[slotName]?.();
        if (slot?.length)
            children.push(
                ...slot.map((node) =>
                    h("span", { slot: slotName, style: "display:contents" }, [node]),
                ),
            );
    }
    const defaultSlot = slots.default?.();
    if (defaultSlot?.length) children.push(...defaultSlot);
    return h(options.tag, attributes, children);
}

function setupVueAdminComponent(
    options: ElementOptions,
    props: Record<string, unknown>,
    context: { attrs: Record<string, unknown>; slots: Record<string, unknown> },
    slots: Record<string, (() => VNode[] | undefined) | undefined>,
    handlers: Record<string, unknown> = {},
) {
    const vueContext = context;
    const element = { value: null as AdminElement | null };
    registerVueAdminElementLifecycle(element, options, props, handlers);
    return () =>
        createAdminVNode(options, element, { ...props, ...vueContext.attrs }, {
            ...slots,
            ...vueContext.slots,
        } as Record<string, (() => VNode[] | undefined) | undefined>);
}

type AdminEventSpec = {
    name: string;
    emit: string;
    map?: (detail: unknown) => unknown[];
    /** Also emit `update:<model>` with the same arguments (v-model support). */
    model?: string;
};

function adminElement(spec: {
    name: string;
    tag: string;
    properties?: string[];
    events?: AdminEventSpec[];
    slots?: string[];
    props?: Record<string, unknown>;
    emits?: string[];
}) {
    return defineComponent({
        name: spec.name,
        inheritAttrs: false,
        props: (spec.props ?? {}) as unknown as import("vue").ComponentObjectPropsOptions,
        emits: spec.emits,
        setup(props, context) {
            const handlers: Record<string, unknown> = {};
            for (const event of spec.events ?? []) {
                handlers[`on${event.emit}`] = (detail: unknown) => {
                    const args = event.map ? event.map(detail) : [detail];
                    context.emit(event.emit, ...args);
                    if (event.model) context.emit(`update:${event.model}`, ...args);
                };
            }
            return setupVueAdminComponent(
                {
                    tag: spec.tag,
                    properties: spec.properties,
                    events: (spec.events ?? []).map((event) => ({
                        name: event.name,
                        prop: `on${event.emit}`,
                    })),
                    slots: spec.slots,
                },
                props,
                context,
                {},
                handlers,
            );
        },
    });
}

const objectArray = { type: Array as PropType<unknown[]> };

export const AdminButton = defineComponent({
    name: "AdminButton",
    inheritAttrs: false,
    props: {
        variant: { type: String as PropType<AdminButtonVariant>, default: "secondary" },
        size: { type: String as PropType<AdminButtonSize>, default: "default" },
        loading: Boolean,
        disabled: Boolean,
        type: { type: String as PropType<"button" | "submit" | "reset">, default: "button" },
    },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-button", properties: ["variant", "size", "loading", "disabled", "type"] },
            props,
            context,
            {},
        );
    },
});

export const AdminCard = defineComponent({
    name: "AdminCard",
    inheritAttrs: false,
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-card", slots: ["header", "footer"] },
            props,
            context,
            {},
        );
    },
});

export const AdminInput = defineComponent({
    name: "AdminInput",
    inheritAttrs: false,
    props: {
        value: String,
        type: { type: String, default: "text" },
        name: String,
        placeholder: String,
        disabled: Boolean,
        invalid: Boolean,
    },
    emits: ["update:value", "value-change"],
    setup(props, context) {
        const onValueChange = (detail: { value: string }) => {
            context.emit("update:value", detail.value);
            context.emit("value-change", detail.value);
        };
        return setupVueAdminComponent(
            {
                tag: "aui-input",
                properties: ["value", "type", "name", "placeholder", "disabled", "invalid"],
                event: "aui-input",
                eventProp: "onValueChange",
            },
            props,
            context,
            {},
            { onValueChange },
        );
    },
});

export const AdminSelect = defineComponent({
    name: "AdminSelect",
    inheritAttrs: false,
    props: {
        value: String,
        name: String,
        disabled: Boolean,
        invalid: Boolean,
        options: { type: Array as PropType<AdminSelectOption[]>, default: () => [] },
    },
    emits: ["update:value", "value-change"],
    setup(props, context) {
        const onValueChange = (detail: { value: string }) => {
            context.emit("update:value", detail.value);
            context.emit("value-change", detail.value);
        };
        return setupVueAdminComponent(
            {
                tag: "aui-select",
                properties: ["value", "name", "disabled", "invalid", "options"],
                event: "aui-change",
                eventProp: "onValueChange",
            },
            props,
            context,
            {},
            { onValueChange },
        );
    },
});

export const AdminTextarea = defineComponent({
    name: "AdminTextarea",
    inheritAttrs: false,
    props: {
        value: String,
        name: String,
        placeholder: String,
        rows: { type: Number, default: 4 },
        disabled: Boolean,
        invalid: Boolean,
    },
    emits: ["update:value", "value-change"],
    setup(props, context) {
        const onValueChange = (detail: { value: string }) => {
            context.emit("update:value", detail.value);
            context.emit("value-change", detail.value);
        };
        return setupVueAdminComponent(
            {
                tag: "aui-textarea",
                properties: ["value", "name", "placeholder", "rows", "disabled", "invalid"],
                event: "aui-input",
                eventProp: "onValueChange",
            },
            props,
            context,
            {},
            { onValueChange },
        );
    },
});

function checkableComponent(tag: "aui-checkbox" | "aui-switch", name: string) {
    return defineComponent({
        name,
        inheritAttrs: false,
        props: { checked: Boolean, disabled: Boolean, label: String },
        emits: ["update:checked", "checked-change"],
        setup(props, context) {
            const onCheckedChange = (detail: { checked: boolean }) => {
                context.emit("update:checked", detail.checked);
                context.emit("checked-change", detail.checked);
            };
            return setupVueAdminComponent(
                {
                    tag,
                    properties: ["checked", "disabled", "label"],
                    event: "aui-checked-change",
                    eventProp: "onCheckedChange",
                },
                props,
                context,
                {},
                { onCheckedChange },
            );
        },
    });
}

export const AdminCheckbox = checkableComponent("aui-checkbox", "AdminCheckbox");
export const AdminSwitch = checkableComponent("aui-switch", "AdminSwitch");

export const AdminSkeleton = defineComponent({
    name: "AdminSkeleton",
    inheritAttrs: false,
    props: { width: String, height: String },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-skeleton", properties: ["width", "height"] },
            props,
            context,
            {},
        );
    },
});

export const AdminSeparator = defineComponent({
    name: "AdminSeparator",
    inheritAttrs: false,
    props: { vertical: Boolean },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-separator", properties: ["vertical"] },
            props,
            context,
            {},
        );
    },
});

export const AdminCopyableText = defineComponent({
    name: "AdminCopyableText",
    inheritAttrs: false,
    props: { text: { type: String, required: true }, copyLabel: String, copiedLabel: String },
    emits: ["copy"],
    setup(props, context) {
        const onCopy = (detail: { text: string }) => context.emit("copy", detail.text);
        return setupVueAdminComponent(
            {
                tag: "aui-copyable-text",
                properties: ["text", "copyLabel", "copiedLabel"],
                event: "aui-copy",
                eventProp: "onCopy",
            },
            props,
            context,
            {},
            { onCopy },
        );
    },
});

export const AdminStatusTag = defineComponent({
    name: "AdminStatusTag",
    inheritAttrs: false,
    props: { status: { type: String as PropType<AdminStatus>, default: "default" } },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-status-tag", properties: ["status"] },
            props,
            context,
            {},
        );
    },
});

function stateComponent(tag: string, name: string) {
    return defineComponent({
        name,
        inheritAttrs: false,
        props: { title: String, description: String },
        setup(props, context) {
            return setupVueAdminComponent(
                { tag, properties: ["title", "description"] },
                props,
                context,
                {},
            );
        },
    });
}

export const AdminEmptyState = stateComponent("aui-empty-state", "AdminEmptyState");
export const AdminErrorState = stateComponent("aui-error-state", "AdminErrorState");

export const AdminPage = defineComponent({
    name: "AdminPage",
    inheritAttrs: false,
    props: { title: { type: String, required: true }, description: String },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-page", properties: ["title", "description"], slots: ["actions"] },
            props,
            context,
            {},
        );
    },
});

export const AdminPageHeader = defineComponent({
    name: "AdminPageHeader",
    inheritAttrs: false,
    props: { title: { type: String, required: true }, description: String },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-page-header", properties: ["title", "description"], slots: ["actions"] },
            props,
            context,
            {},
        );
    },
});

export const AdminStat = defineComponent({
    name: "AdminStat",
    inheritAttrs: false,
    props: {
        label: { type: String, required: true },
        value: { type: String, required: true },
        unit: String,
        trend: String,
        tone: String,
    },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-stat", properties: ["label", "value", "unit", "trend", "tone"] },
            props,
            context,
            {},
        );
    },
});

export const AdminFilterBar = defineComponent({
    name: "AdminFilterBar",
    inheritAttrs: false,
    setup(props, context) {
        return setupVueAdminComponent({ tag: "aui-filter-bar" }, props, context, {});
    },
});

export const AdminTable = defineComponent({
    name: "AdminTable",
    inheritAttrs: false,
    props: {
        loading: Boolean,
        empty: Boolean,
        error: Boolean,
        loadingLabel: String,
        emptyLabel: String,
        errorLabel: String,
    },
    setup(props, context) {
        return setupVueAdminComponent(
            {
                tag: "aui-table",
                properties: [
                    "loading",
                    "empty",
                    "error",
                    "loadingLabel",
                    "emptyLabel",
                    "errorLabel",
                ],
            },
            props,
            context,
            {},
        );
    },
});

export const AdminPagination = defineComponent({
    name: "AdminPagination",
    inheritAttrs: false,
    props: {
        page: { type: Number, default: 1 },
        totalPages: { type: Number, default: 1 },
        total: { type: Number, default: 0 },
        pageSize: { type: Number, default: 10 },
        previousLabel: { type: String, default: "PREV" },
        nextLabel: { type: String, default: "NEXT" },
    },
    emits: ["page-change"],
    setup(props, context) {
        const onPageChange = (detail: { page: number }) => context.emit("page-change", detail.page);
        return setupVueAdminComponent(
            {
                tag: "aui-pagination",
                properties: [
                    "page",
                    "totalPages",
                    "total",
                    "pageSize",
                    "previousLabel",
                    "nextLabel",
                ],
                event: "aui-page-change",
                eventProp: "onPageChange",
            },
            props,
            context,
            {},
            { onPageChange },
        );
    },
});

export const AdminTabs = defineComponent({
    name: "AdminTabs",
    inheritAttrs: false,
    props: {
        items: { type: Array as PropType<AdminTabItem[]>, default: () => [] },
        active: String,
    },
    emits: ["tab-change"],
    setup(props, context) {
        const onTabChange = (detail: { id: string }) => context.emit("tab-change", detail.id);
        return setupVueAdminComponent(
            {
                tag: "aui-tabs",
                properties: ["items", "active"],
                event: "aui-tab-change",
                eventProp: "onTabChange",
            },
            props,
            context,
            {},
            { onTabChange },
        );
    },
});

export const AdminConfirmDialog = defineComponent({
    name: "AdminConfirmDialog",
    inheritAttrs: false,
    props: {
        open: Boolean,
        title: String,
        description: String,
        confirmLabel: { type: String, default: "Confirm" },
        cancelLabel: { type: String, default: "Cancel" },
        loading: Boolean,
        danger: Boolean,
    },
    emits: ["update:open", "confirm", "cancel", "close"],
    setup(props, context) {
        const onConfirm = () => context.emit("confirm");
        const onCancel = () => {
            context.emit("update:open", false);
            context.emit("cancel");
        };
        const onOpenChange = (detail: { open: boolean }) => {
            context.emit("update:open", detail.open);
            context.emit("close", detail.open);
        };
        return setupVueAdminComponent(
            {
                tag: "aui-confirm-dialog",
                properties: [
                    "open",
                    "title",
                    "description",
                    "confirmLabel",
                    "cancelLabel",
                    "loading",
                    "danger",
                ],
                events: [
                    { name: "aui-confirm", prop: "onConfirm" },
                    { name: "aui-cancel", prop: "onCancel" },
                    { name: "aui-close", prop: "onOpenChange" },
                ],
            },
            props,
            context,
            {},
            { onConfirm, onCancel, onOpenChange },
        );
    },
});

export const AdminDialog = defineComponent({
    name: "AdminDialog",
    inheritAttrs: false,
    props: {
        open: Boolean,
        title: String,
        description: String,
        closeLabel: { type: String, default: "Close" },
    },
    emits: ["update:open", "close"],
    setup(props, context) {
        const onOpenChange = (detail: { open: boolean }) => {
            context.emit("update:open", detail.open);
            context.emit("close", detail.open);
        };
        return setupVueAdminComponent(
            {
                tag: "aui-dialog",
                properties: ["open", "title", "description", "closeLabel"],
                event: "aui-close",
                eventProp: "onOpenChange",
                slots: ["footer", "title", "description"],
            },
            props,
            context,
            {},
            { onOpenChange },
        );
    },
});

export const AdminNav = defineComponent({
    name: "AdminNav",
    inheritAttrs: false,
    props: { items: { type: Array as PropType<AdminNavItem[]>, default: () => [] } },
    emits: ["navigate"],
    setup(props, context) {
        const onNavigate = (detail: { id: string }) => context.emit("navigate", detail.id);
        return setupVueAdminComponent(
            {
                tag: "aui-nav",
                properties: ["items"],
                event: "aui-nav-change",
                eventProp: "onNavigate",
            },
            props,
            context,
            {},
            { onNavigate },
        );
    },
});

export const AdminMenu = adminElement({
    name: "AdminMenu",
    tag: "aui-menu",
    properties: ["items", "value", "orientation", "compact"],
    events: [
        {
            name: "aui-menu-select",
            emit: "select",
            map: (detail) => [(detail as { id: string }).id, (detail as { item: unknown }).item],
        },
    ],
    emits: ["select"],
    props: { items: objectArray, value: String, orientation: String, compact: Boolean },
});

export const AdminSidebar = adminElement({
    name: "AdminSidebar",
    tag: "aui-sidebar",
    properties: ["open", "title", "width", "closeLabel"],
    events: [
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    slots: ["footer"],
    emits: ["open-change", "update:open"],
    props: {
        open: { type: Boolean, default: true },
        title: { type: String, default: "Navigation" },
        width: { type: String, default: "256px" },
        closeLabel: { type: String, default: "Close navigation" },
    },
});

export const AdminNavbar = adminElement({
    name: "AdminNavbar",
    tag: "aui-navbar",
    properties: ["title", "sticky", "bordered"],
    slots: ["brand", "actions"],
    props: { title: String, sticky: Boolean, bordered: { type: Boolean, default: true } },
});

export const AdminDatePicker = adminElement({
    name: "AdminDatePicker",
    tag: "aui-date-picker",
    properties: ["value", "min", "max", "label", "disabled"],
    events: [
        {
            name: "aui-date-change",
            emit: "date-change",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["date-change", "update:value"],
    props: { value: String, min: String, max: String, label: String, disabled: Boolean },
});

export const AdminTimePicker = adminElement({
    name: "AdminTimePicker",
    tag: "aui-time-picker",
    properties: ["value", "min", "max", "step", "label", "disabled"],
    events: [
        {
            name: "aui-time-change",
            emit: "time-change",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["time-change", "update:value"],
    props: {
        value: String,
        min: String,
        max: String,
        step: Number,
        label: String,
        disabled: Boolean,
    },
});

export const AdminPinInput = adminElement({
    name: "AdminPinInput",
    tag: "aui-pin-input",
    properties: ["length", "value", "masked", "disabled", "label"],
    events: [
        {
            name: "aui-pin-change",
            emit: "pin-change",
            map: (detail) => [detail],
            model: "value",
        },
    ],
    emits: ["pin-change", "update:value"],
    props: { length: Number, value: String, masked: Boolean, disabled: Boolean, label: String },
});

export const AdminDescriptions = adminElement({
    name: "AdminDescriptions",
    tag: "aui-descriptions",
    properties: ["items", "columns", "bordered", "compact"],
    props: { items: objectArray, columns: Number, bordered: Boolean, compact: Boolean },
});

export const AdminCascader = adminElement({
    name: "AdminCascader",
    tag: "aui-cascader",
    properties: ["options", "value", "placeholder", "disabled", "open", "searchable"],
    events: [
        {
            name: "aui-cascader-change",
            emit: "change",
            map: (detail) => [
                (detail as { value: string[]; options: AdminCascaderOption[] }).value,
            ],
            model: "value",
        },
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    emits: ["change", "update:value", "open-change", "update:open"],
    props: {
        options: { type: Array as PropType<AdminCascaderOption[]>, default: () => [] },
        value: { type: Array as PropType<string[]>, default: () => [] },
        placeholder: String,
        disabled: Boolean,
        open: Boolean,
        searchable: Boolean,
    },
});

export const AdminTransfer = adminElement({
    name: "AdminTransfer",
    tag: "aui-transfer",
    properties: ["options", "values", "sourceTitle", "targetTitle", "searchable", "disabled"],
    events: [
        {
            name: "aui-transfer-change",
            emit: "change",
            map: (detail) => [(detail as { values: string[] }).values],
            model: "values",
        },
    ],
    emits: ["change", "update:values"],
    props: {
        options: { type: Array as PropType<AdminTransferOption[]>, default: () => [] },
        values: { type: Array as PropType<string[]>, default: () => [] },
        sourceTitle: String,
        targetTitle: String,
        searchable: Boolean,
        disabled: Boolean,
    },
});

export const AdminContextMenu = adminElement({
    name: "AdminContextMenu",
    tag: "aui-context-menu",
    properties: ["items", "open", "x", "y", "label"],
    events: [
        {
            name: "aui-menu-select",
            emit: "select",
            map: (detail) => [
                (detail as { id: string }).id,
                (detail as { item: AdminMenuEntry }).item,
            ],
        },
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    emits: ["select", "open-change", "update:open"],
    props: {
        items: { type: Array as PropType<AdminMenuEntry[]>, default: () => [] },
        open: Boolean,
        x: Number,
        y: Number,
        label: String,
    },
});

export const AdminHoverCard = adminElement({
    name: "AdminHoverCard",
    tag: "aui-hover-card",
    properties: ["open", "title", "side", "delay", "closeDelay"],
    events: [
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    slots: ["trigger", "content"],
    emits: ["open-change", "update:open"],
    props: {
        open: Boolean,
        title: String,
        side: String,
        delay: Number,
        closeDelay: Number,
    },
});

export const AdminNotificationCenter = adminElement({
    name: "AdminNotificationCenter",
    tag: "aui-notification-center",
    properties: ["notifications", "position", "max", "persistKey", "clearLabel"],
    events: [
        {
            name: "aui-notification-close",
            emit: "close",
            map: (detail) => [(detail as { id: string }).id],
        },
        {
            name: "aui-notification-action",
            emit: "action",
            map: (detail) => [
                (detail as { id: string }).id,
                (detail as { item: AdminNotificationItem }).item,
            ],
        },
        {
            name: "aui-notifications-change",
            emit: "change",
            map: (detail) => [(detail as { notifications: AdminNotificationItem[] }).notifications],
        },
    ],
    emits: ["close", "action", "change"],
    props: {
        notifications: { type: Array as PropType<AdminNotificationItem[]>, default: () => [] },
        position: String,
        max: Number,
        persistKey: String,
        clearLabel: String,
    },
});

export const AdminUploadList = adminElement({
    name: "AdminUploadList",
    tag: "aui-upload-list",
    properties: [
        "files",
        "removable",
        "retryable",
        "previewable",
        "compact",
        "disabled",
        "emptyLabel",
    ],
    events: [
        {
            name: "aui-upload-remove",
            emit: "remove",
            map: (detail) => [
                (detail as { id: string }).id,
                (detail as { file: AdminUploadItem }).file,
            ],
        },
        {
            name: "aui-upload-retry",
            emit: "retry",
            map: (detail) => [
                (detail as { id: string }).id,
                (detail as { file: AdminUploadItem }).file,
            ],
        },
        {
            name: "aui-upload-preview",
            emit: "preview",
            map: (detail) => [
                (detail as { id: string }).id,
                (detail as { file: AdminUploadItem }).file,
            ],
        },
        {
            name: "aui-upload-change",
            emit: "change",
            map: (detail) => [(detail as { files: AdminUploadItem[] }).files],
            model: "files",
        },
    ],
    emits: ["remove", "retry", "preview", "change", "update:files"],
    props: {
        files: { type: Array as PropType<AdminUploadItem[]>, default: () => [] },
        removable: { type: Boolean, default: true },
        retryable: { type: Boolean, default: true },
        previewable: { type: Boolean, default: true },
        compact: Boolean,
        disabled: Boolean,
        emptyLabel: String,
    },
});

export const AdminFilePreview = adminElement({
    name: "AdminFilePreview",
    tag: "aui-file-preview",
    properties: ["file", "open", "title", "closeLabel", "downloadLabel", "downloadable"],
    events: [
        {
            name: "aui-file-preview-close",
            emit: "close",
            map: (detail) => [(detail as { file: AdminUploadItem | null }).file],
            model: "open",
        },
        {
            name: "aui-file-download",
            emit: "download",
            map: (detail) => [(detail as { file: AdminUploadItem }).file],
        },
    ],
    emits: ["close", "update:open", "download"],
    props: {
        file: { type: Object as PropType<AdminUploadItem | null>, default: null },
        open: Boolean,
        title: String,
        closeLabel: String,
        downloadLabel: String,
        downloadable: { type: Boolean, default: true },
    },
});

export const AdminBreadcrumb = defineComponent({
    name: "AdminBreadcrumb",
    inheritAttrs: false,
    props: {
        items: {
            type: Array as PropType<Array<string | { label: string; href?: string }>>,
            default: () => [],
        },
        maxItems: Number,
        overflowLabel: String,
    },
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-breadcrumb", properties: ["items", "maxItems", "overflowLabel"] },
            props,
            context,
            {},
        );
    },
});

export const AdminShell = defineComponent({
    name: "AdminShell",
    inheritAttrs: false,
    setup(props, context) {
        return setupVueAdminComponent(
            { tag: "aui-shell", slots: ["sidebar", "header"] },
            props,
            context,
            {},
        );
    },
});

export const AdminAccordion = adminElement({
    name: "AdminAccordion",
    tag: "aui-accordion",
    properties: ["items", "multiple"],
    props: {
        items: {
            type: Array as PropType<
                Array<{ id: string; label: string; content: string; disabled?: boolean }>
            >,
            default: () => [],
        },
        multiple: Boolean,
    },
});

export const AdminAlert = adminElement({
    name: "AdminAlert",
    tag: "aui-alert",
    properties: ["variant", "title", "description", "closable", "open"],
    events: [
        {
            name: "aui-close",
            emit: "close",
            map: (detail) => [(detail as { open: boolean })?.open ?? false],
            model: "open",
        },
    ],
    slots: ["title"],
    emits: ["close", "update:open"],
    props: {
        variant: String,
        title: String,
        description: String,
        closable: Boolean,
        open: { type: Boolean, default: true },
    },
});

export const AdminAspectRatio = adminElement({
    name: "AdminAspectRatio",
    tag: "aui-aspect-ratio",
    properties: ["ratio"],
    props: { ratio: { type: String, default: "16 / 9" } },
});

export const AdminAvatar = adminElement({
    name: "AdminAvatar",
    tag: "aui-avatar",
    properties: ["src", "alt", "initials", "size"],
    props: { src: String, alt: String, initials: String, size: String },
});

export const AdminBadge = adminElement({
    name: "AdminBadge",
    tag: "aui-badge",
    properties: ["variant", "dot"],
    props: { variant: String, dot: Boolean },
});

export const AdminCalendar = adminElement({
    name: "AdminCalendar",
    tag: "aui-calendar",
    properties: ["value", "min", "max", "label"],
    events: [
        {
            name: "aui-date-change",
            emit: "date-change",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["date-change", "update:value"],
    props: { value: String, min: String, max: String, label: String },
});

export const AdminCalendarGrid = adminElement({
    name: "AdminCalendarGrid",
    tag: "aui-calendar-grid",
    properties: ["month", "year", "selected"],
    events: [
        {
            name: "aui-date-change",
            emit: "date-change",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["date-change", "update:value"],
    props: { month: Number, year: Number, selected: String },
});

export const AdminChartContainer = adminElement({
    name: "AdminChartContainer",
    tag: "aui-chart-container",
    properties: ["title", "description", "height", "legend", "tooltip"],
    slots: ["actions"],
    props: {
        title: String,
        description: String,
        height: String,
        legend: objectArray,
        tooltip: String,
    },
});

export const AdminCodeBlock = adminElement({
    name: "AdminCodeBlock",
    tag: "aui-code-block",
    properties: ["code", "language", "copyLabel"],
    events: [
        { name: "aui-copy", emit: "copy", map: (detail) => [(detail as { text: string }).text] },
    ],
    emits: ["copy"],
    props: { code: String, language: String, copyLabel: String },
});

export const AdminCollapsible = adminElement({
    name: "AdminCollapsible",
    tag: "aui-collapsible",
    properties: ["open", "title", "disabled"],
    events: [
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    slots: ["title"],
    emits: ["open-change", "update:open"],
    props: { open: Boolean, title: String, disabled: Boolean },
});

export const AdminColorPicker = adminElement({
    name: "AdminColorPicker",
    tag: "aui-color-picker",
    properties: ["value", "label", "disabled"],
    events: [
        {
            name: "aui-color-change",
            emit: "color-change",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["color-change", "update:value"],
    props: { value: String, label: String, disabled: Boolean },
});

export const AdminColorTag = adminElement({
    name: "AdminColorTag",
    tag: "aui-color-tag",
    properties: ["color", "label"],
    props: { color: String, label: String },
});

export const AdminCombobox = adminElement({
    name: "AdminCombobox",
    tag: "aui-combobox",
    properties: ["options", "value", "placeholder", "disabled", "open"],
    events: [
        {
            name: "aui-change",
            emit: "change",
            map: (detail) => [(detail as { value: string }).value],
        },
    ],
    emits: ["change"],
    props: {
        options: objectArray,
        value: String,
        placeholder: String,
        disabled: Boolean,
        open: Boolean,
    },
});

export const AdminCommand = adminElement({
    name: "AdminCommand",
    tag: "aui-command",
    properties: ["items", "open", "placeholder"],
    events: [
        { name: "aui-command", emit: "command" },
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    emits: ["command", "open-change", "update:open"],
    props: { items: objectArray, open: { type: Boolean, default: true }, placeholder: String },
});

export const AdminContainer = adminElement({
    name: "AdminContainer",
    tag: "aui-container",
    properties: ["maxWidth", "centered"],
    props: { maxWidth: String, centered: Boolean },
});

export const AdminDataGrid = adminElement({
    name: "AdminDataGrid",
    tag: "aui-data-grid",
    properties: [
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
    events: [
        { name: "aui-sort-change", emit: "sort-change" },
        { name: "aui-filter-change", emit: "filter-change" },
        { name: "aui-selection-change", emit: "selection-change" },
        { name: "aui-batch-action", emit: "batch-action" },
        { name: "aui-page-change", emit: "page-change" },
    ],
    emits: ["sort-change", "filter-change", "selection-change", "batch-action", "page-change"],
    props: {
        columns: objectArray,
        rows: objectArray,
        loading: Boolean,
        error: Boolean,
        selectable: Boolean,
        mobileCards: Boolean,
        virtual: Boolean,
        serverSide: Boolean,
        emptyLabel: String,
        loadingLabel: String,
        errorLabel: String,
        sortKey: String,
        sortDirection: String,
        selectedKeys: objectArray,
        filters: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
        batchActions: objectArray,
        page: Number,
        pageSize: Number,
        total: Number,
        pageSizeOptions: objectArray,
        rowHeight: Number,
        virtualOverscan: Number,
        rowKey: String,
    },
});

export const AdminDataList = adminElement({
    name: "AdminDataList",
    tag: "aui-data-list",
    properties: ["items", "columns"],
    props: { items: objectArray, columns: Number },
});

export const AdminTreeTable = adminElement({
    name: "AdminTreeTable",
    tag: "aui-tree-table",
    properties: ["columns", "nodes", "expanded", "selected", "selectable", "emptyLabel"],
    events: [
        { name: "aui-tree-table-toggle", emit: "toggle" },
        { name: "aui-tree-table-select", emit: "select" },
    ],
    emits: ["toggle", "select"],
    props: {
        columns: objectArray,
        nodes: objectArray,
        expanded: objectArray,
        selected: [String, Number],
        selectable: Boolean,
        emptyLabel: String,
    },
});

export const AdminListView = adminElement({
    name: "AdminListView",
    tag: "aui-list-view",
    properties: [
        "items",
        "loading",
        "error",
        "selectable",
        "selectedKeys",
        "loadingLabel",
        "emptyLabel",
        "errorLabel",
    ],
    events: [{ name: "aui-list-view-select", emit: "select" }],
    emits: ["select"],
    props: {
        items: objectArray,
        loading: Boolean,
        error: Boolean,
        selectable: Boolean,
        selectedKeys: objectArray,
        loadingLabel: String,
        emptyLabel: String,
        errorLabel: String,
    },
});

export const AdminFilterBuilder = adminElement({
    name: "AdminFilterBuilder",
    tag: "aui-filter-builder",
    properties: ["fields", "filters", "maxRules", "addLabel", "clearLabel", "applyLabel"],
    events: [
        { name: "aui-filter-builder-change", emit: "change" },
        { name: "aui-filter-builder-submit", emit: "submit" },
    ],
    emits: ["change", "submit"],
    props: {
        fields: objectArray,
        filters: objectArray,
        maxRules: Number,
        addLabel: String,
        clearLabel: String,
        applyLabel: String,
    },
});

export const AdminQueryBuilder = adminElement({
    name: "AdminQueryBuilder",
    tag: "aui-query-builder",
    properties: ["fields", "rules", "logic", "applyLabel"],
    events: [
        { name: "aui-query-change", emit: "change" },
        { name: "aui-query-submit", emit: "submit" },
    ],
    emits: ["change", "submit"],
    props: { fields: objectArray, rules: objectArray, logic: String, applyLabel: String },
});

export const AdminDateRange = adminElement({
    name: "AdminDateRange",
    tag: "aui-date-range",
    properties: [
        "start",
        "end",
        "startLabel",
        "endLabel",
        "min",
        "max",
        "required",
        "disabled",
        "invalid",
        "error",
    ],
    events: [
        { name: "aui-range-change", emit: "range-change" },
        { name: "aui-range-validation", emit: "validation-change" },
    ],
    emits: ["range-change", "validation-change"],
    props: {
        start: String,
        end: String,
        startLabel: String,
        endLabel: String,
        min: String,
        max: String,
        required: Boolean,
        disabled: Boolean,
        invalid: Boolean,
        error: String,
    },
});

export const AdminDrawer = adminElement({
    name: "AdminDrawer",
    tag: "aui-drawer",
    properties: ["open", "title", "side", "width", "mobileMode"],
    events: [
        {
            name: "aui-close",
            emit: "close",
            map: (detail) => [(detail as { open: boolean }).open ?? false],
            model: "open",
        },
    ],
    slots: ["trigger", "title", "footer"],
    emits: ["close", "update:open"],
    props: { open: Boolean, title: String, side: String, width: String, mobileMode: String },
});

export const AdminForm = adminElement({
    name: "AdminForm",
    tag: "aui-form",
    properties: ["layout", "loading", "submitLabel", "resetLabel", "showActions", "noValidate"],
    events: [
        { name: "aui-submit", emit: "submit" },
        { name: "aui-invalid", emit: "invalid" },
        { name: "aui-reset", emit: "reset" },
    ],
    slots: ["actions"],
    emits: ["submit", "invalid", "reset"],
    props: {
        layout: String as PropType<AdminFormLayout>,
        loading: Boolean,
        submitLabel: String,
        resetLabel: String,
        showActions: { type: Boolean, default: true },
        noValidate: Boolean,
    },
});

export const AdminFormItem = adminElement({
    name: "AdminFormItem",
    tag: "aui-form-item",
    properties: ["label", "description", "error", "required", "name"],
    props: { label: String, description: String, error: String, required: Boolean, name: String },
});

export const AdminSchemaForm = adminElement({
    name: "AdminSchemaForm",
    tag: "aui-schema-form",
    properties: ["fields", "values", "layout", "loading", "submitLabel", "resetLabel"],
    events: [
        { name: "aui-change", emit: "change" },
        { name: "aui-submit", emit: "submit" },
        {
            name: "aui-reset",
            emit: "reset",
            map: (detail) => [(detail as { values: Record<string, AdminSchemaFormValue> }).values],
        },
    ],
    emits: ["change", "submit", "reset"],
    props: {
        fields: { type: Array as PropType<AdminSchemaFormField[]>, default: () => [] },
        values: {
            type: Object as PropType<Record<string, AdminSchemaFormValue>>,
            default: undefined,
        },
        layout: String as PropType<AdminFormLayout>,
        loading: Boolean,
        submitLabel: String,
        resetLabel: String,
    },
});

export const AdminTruncatedText = adminElement({
    name: "AdminTruncatedText",
    tag: "aui-truncated-text",
    properties: ["text", "lines", "label"],
    props: { text: String, lines: Number, label: String },
});

export const AdminLoadingOverlay = adminElement({
    name: "AdminLoadingOverlay",
    tag: "aui-loading-overlay",
    properties: ["open", "label", "fullscreen"],
    props: { open: Boolean, label: String, fullscreen: Boolean },
});

export const AdminProgressRing = adminElement({
    name: "AdminProgressRing",
    tag: "aui-progress-ring",
    properties: ["value", "max", "size", "strokeWidth", "label", "showValue"],
    props: {
        value: Number,
        max: Number,
        size: Number,
        strokeWidth: Number,
        label: String,
        showValue: Boolean,
    },
});

export const AdminColumnSettings = adminElement({
    name: "AdminColumnSettings",
    tag: "aui-column-settings",
    properties: ["columns", "visibleKeys", "open", "title", "closeLabel"],
    events: [
        { name: "aui-column-settings-change", emit: "change" },
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    emits: ["change", "open-change", "update:open"],
    props: {
        columns: { type: Array as PropType<AdminDataGridColumn[]>, default: () => [] },
        visibleKeys: { type: Array as PropType<string[]>, default: () => [] },
        open: Boolean,
        title: String,
        closeLabel: String,
    },
});

export const AdminDropdown = adminElement({
    name: "AdminDropdown",
    tag: "aui-dropdown",
    properties: ["items", "open"],
    events: [
        {
            name: "aui-menu-select",
            emit: "menu-select",
            map: (detail) => [(detail as { id: string }).id],
        },
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    slots: ["trigger"],
    emits: ["menu-select", "open-change", "update:open"],
    props: { items: objectArray, open: Boolean },
});

export const AdminField = adminElement({
    name: "AdminField",
    tag: "aui-field",
    properties: ["label", "description", "error", "required"],
    props: { label: String, description: String, error: String, required: Boolean },
});

export const AdminFileUpload = adminElement({
    name: "AdminFileUpload",
    tag: "aui-file-upload",
    properties: ["accept", "multiple", "disabled", "label", "hint"],
    events: [{ name: "aui-files-change", emit: "files-change" }],
    emits: ["files-change"],
    props: { accept: String, multiple: Boolean, disabled: Boolean, label: String, hint: String },
});

export const AdminGrid = adminElement({
    name: "AdminGrid",
    tag: "aui-grid",
    properties: ["columns", "gap", "minWidth"],
    props: { columns: Number, gap: String, minWidth: String },
});

export const AdminIconButton = adminElement({
    name: "AdminIconButton",
    tag: "aui-icon-button",
    properties: ["label", "icon", "variant", "size", "disabled"],
    props: { label: String, icon: String, variant: String, size: String, disabled: Boolean },
});

export const AdminInputGroup = adminElement({
    name: "AdminInputGroup",
    tag: "aui-input-group",
    slots: ["prefix", "suffix"],
});

export const AdminJsonViewer = adminElement({
    name: "AdminJsonViewer",
    tag: "aui-json-viewer",
    properties: ["value", "title", "expanded"],
    props: {
        value: { type: null as unknown as PropType<unknown> },
        title: String,
        expanded: Boolean,
    },
});

export const AdminKanban = adminElement({
    name: "AdminKanban",
    tag: "aui-kanban",
    properties: ["columns"],
    events: [{ name: "aui-kanban-change", emit: "kanban-change" }],
    emits: ["kanban-change"],
    props: { columns: objectArray },
});

export const AdminKbd = adminElement({
    name: "AdminKbd",
    tag: "aui-kbd",
});

export const AdminList = adminElement({
    name: "AdminList",
    tag: "aui-list",
    properties: ["items", "selected", "selectable"],
    events: [
        {
            name: "aui-list-change",
            emit: "list-change",
            map: (detail) => [(detail as { id: string }).id],
        },
    ],
    emits: ["list-change"],
    props: { items: objectArray, selected: String, selectable: Boolean },
});

export const AdminLogViewer = adminElement({
    name: "AdminLogViewer",
    tag: "aui-log-viewer",
    properties: ["entries", "follow"],
    props: { entries: objectArray, follow: Boolean },
});

export const AdminMultiSelect = adminElement({
    name: "AdminMultiSelect",
    tag: "aui-multi-select",
    properties: ["options", "values", "placeholder", "disabled", "open"],
    events: [
        {
            name: "aui-change",
            emit: "change",
            map: (detail) => [(detail as { values: string[] }).values],
        },
    ],
    emits: ["change"],
    props: {
        options: objectArray,
        values: objectArray,
        placeholder: String,
        disabled: Boolean,
        open: Boolean,
    },
});

export const AdminNumberInput = adminElement({
    name: "AdminNumberInput",
    tag: "aui-number-input",
    properties: ["value", "min", "max", "step", "label", "disabled"],
    events: [
        {
            name: "aui-number-change",
            emit: "change",
            map: (detail) => [(detail as { value: number }).value],
            model: "value",
        },
    ],
    emits: ["change", "update:value"],
    props: {
        value: Number,
        min: Number,
        max: Number,
        step: Number,
        label: String,
        disabled: Boolean,
    },
});

export const AdminPasswordInput = adminElement({
    name: "AdminPasswordInput",
    tag: "aui-password-input",
    properties: ["value", "placeholder", "disabled", "revealLabel", "hideLabel"],
    events: [
        {
            name: "aui-input",
            emit: "value-change",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["value-change", "update:value"],
    props: {
        value: String,
        placeholder: String,
        disabled: Boolean,
        revealLabel: String,
        hideLabel: String,
    },
});

export const AdminPopover = adminElement({
    name: "AdminPopover",
    tag: "aui-popover",
    properties: ["open", "title"],
    events: [
        {
            name: "aui-open-change",
            emit: "open-change",
            map: (detail) => [(detail as { open: boolean }).open],
            model: "open",
        },
    ],
    slots: ["trigger", "content"],
    emits: ["open-change", "update:open"],
    props: { open: Boolean, title: String },
});

export const AdminProgress = adminElement({
    name: "AdminProgress",
    tag: "aui-progress",
    properties: ["value", "max", "label", "showValue"],
    props: { value: Number, max: Number, label: String, showValue: Boolean },
});

export const AdminRadioGroup = adminElement({
    name: "AdminRadioGroup",
    tag: "aui-radio-group",
    properties: ["options", "value", "orientation"],
    events: [
        {
            name: "aui-radio-change",
            emit: "change",
            map: (detail) => [(detail as { value: string }).value],
        },
    ],
    emits: ["change"],
    props: { options: objectArray, value: String, orientation: String },
});

export const AdminRating = adminElement({
    name: "AdminRating",
    tag: "aui-rating",
    properties: ["value", "max", "readonly"],
    events: [
        {
            name: "aui-rating-change",
            emit: "rating-change",
            map: (detail) => [(detail as { value: number }).value],
            model: "value",
        },
    ],
    emits: ["rating-change", "update:value"],
    props: { value: Number, max: Number, readonly: Boolean },
});

export const AdminResult = adminElement({
    name: "AdminResult",
    tag: "aui-result",
    properties: ["status", "title", "description"],
    props: { status: String, title: String, description: String },
});

export const AdminScrollArea = adminElement({
    name: "AdminScrollArea",
    tag: "aui-scroll-area",
    properties: ["orientation", "maxHeight"],
    props: { orientation: String, maxHeight: String },
});

export const AdminSearch = adminElement({
    name: "AdminSearch",
    tag: "aui-search",
    properties: ["value", "placeholder", "debounce"],
    events: [
        {
            name: "aui-search",
            emit: "search",
            map: (detail) => [(detail as { value: string }).value],
            model: "value",
        },
    ],
    emits: ["search", "update:value"],
    props: { value: String, placeholder: String, debounce: Number },
});

export const AdminSegmented = adminElement({
    name: "AdminSegmented",
    tag: "aui-segmented",
    properties: ["items", "value"],
    events: [
        {
            name: "aui-segment-change",
            emit: "change",
            map: (detail) => [(detail as { value: string }).value],
        },
    ],
    emits: ["change"],
    props: { items: objectArray, value: String },
});

export const AdminSlider = adminElement({
    name: "AdminSlider",
    tag: "aui-slider",
    properties: ["value", "min", "max", "step", "label", "showValue", "disabled"],
    events: [
        {
            name: "aui-slider-change",
            emit: "change",
            map: (detail) => [(detail as { value: number }).value],
            model: "value",
        },
    ],
    emits: ["change", "update:value"],
    props: {
        value: Number,
        min: Number,
        max: Number,
        step: Number,
        label: String,
        showValue: Boolean,
        disabled: Boolean,
    },
});

export const AdminSpinner = adminElement({
    name: "AdminSpinner",
    tag: "aui-spinner",
});

export const AdminSplitter = adminElement({
    name: "AdminSplitter",
    tag: "aui-splitter",
    properties: ["direction", "initial", "min"],
    events: [
        {
            name: "aui-splitter-change",
            emit: "splitter-change",
            map: (detail) => [(detail as { percent: number }).percent],
        },
    ],
    slots: ["before", "after"],
    emits: ["splitter-change"],
    props: { direction: String, initial: Number, min: Number },
});

export const AdminStack = adminElement({
    name: "AdminStack",
    tag: "aui-stack",
    properties: ["direction", "gap", "align", "justify"],
    props: { direction: String, gap: String, align: String, justify: String },
});

export const AdminStepper = adminElement({
    name: "AdminStepper",
    tag: "aui-stepper",
    properties: ["items", "active", "orientation"],
    props: { items: objectArray, active: Number, orientation: String },
});

export const AdminTagInput = adminElement({
    name: "AdminTagInput",
    tag: "aui-tag-input",
    properties: ["values", "placeholder", "disabled"],
    events: [
        {
            name: "aui-tags-change",
            emit: "tags-change",
            map: (detail) => [(detail as { values: string[] }).values],
        },
    ],
    emits: ["tags-change"],
    props: { values: objectArray, placeholder: String, disabled: Boolean },
});

export const AdminTimeline = adminElement({
    name: "AdminTimeline",
    tag: "aui-timeline",
    properties: ["items"],
    props: { items: objectArray },
});

export const AdminToast = adminElement({
    name: "AdminToast",
    tag: "aui-toast",
    properties: ["open", "title", "message", "variant", "duration"],
    events: [
        {
            name: "aui-close",
            emit: "close",
            map: (detail) => [(detail as { open: boolean }).open ?? false],
            model: "open",
        },
    ],
    emits: ["close", "update:open"],
    props: { open: Boolean, title: String, message: String, variant: String, duration: Number },
});

export const AdminToggle = adminElement({
    name: "AdminToggle",
    tag: "aui-toggle",
    properties: ["pressed", "disabled", "label"],
    events: [
        {
            name: "aui-toggle-change",
            emit: "toggle-change",
            map: (detail) => [(detail as { pressed: boolean }).pressed],
            model: "pressed",
        },
    ],
    emits: ["toggle-change", "update:pressed"],
    props: { pressed: Boolean, disabled: Boolean, label: String },
});

export const AdminToggleGroup = adminElement({
    name: "AdminToggleGroup",
    tag: "aui-toggle-group",
    properties: ["items", "value", "values", "multiple"],
    events: [{ name: "aui-toggle-group-change", emit: "toggle-group-change" }],
    emits: ["toggle-group-change"],
    props: { items: objectArray, value: String, values: objectArray, multiple: Boolean },
});

export const AdminTooltip = adminElement({
    name: "AdminTooltip",
    tag: "aui-tooltip",
    properties: ["content", "side"],
    props: { content: String, side: String },
});

export const AdminTree = adminElement({
    name: "AdminTree",
    tag: "aui-tree",
    properties: ["nodes", "selected", "expanded"],
    events: [
        {
            name: "aui-tree-change",
            emit: "tree-change",
            map: (detail) => [(detail as { id: string }).id],
        },
    ],
    emits: ["tree-change"],
    props: { nodes: objectArray, selected: String, expanded: objectArray },
});

export { registerAdminElements };
export type {
    AdminButtonSize,
    AdminButtonVariant,
    AdminNavItem,
    AdminSelectOption,
    AdminStatus,
    AdminTabItem,
};
