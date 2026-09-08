/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement, nextUid } from "./base";

export type AdminToastVariant = "default" | "success" | "warning" | "danger" | "info";

export interface AdminToastItem {
    id: string;
    title: string;
    message: string;
    variant?: AdminToastVariant;
    duration?: number;
}

type ToastSyncMessage =
    | { source: string; type: "state"; items: AdminToastItem[] }
    | { source: string; type: "close"; id: string }
    | { source: string; type: "clear" };
type ToastSyncPayload =
    | { type: "state"; items: AdminToastItem[] }
    | { type: "close"; id: string }
    | { type: "clear" };

/**
 * A small, framework-neutral toast queue.
 *
 * `aui-toast` remains useful for one explicitly controlled notification. This
 * manager owns the common application-level concerns: queue limits,
 * persistence, and optional cross-tab synchronization. BroadcastChannel is
 * preferred, while storage events provide a browser-compatible fallback.
 */
export class AdminToastManagerElement extends AdminElement {
    static properties = {
        items: { attribute: false },
        position: { type: String, reflect: true },
        max: { type: Number },
        persistKey: { type: String, attribute: "persist-key" },
        syncTabs: { type: Boolean, attribute: "sync-tabs", reflect: true },
        channelName: { type: String, attribute: "channel-name" },
        label: { type: String },
    };

    static styles = css`
        :host {
            position: fixed;
            z-index: 110;
            inset: 0;
            display: block;
            pointer-events: none;
        }
        .stack {
            position: absolute;
            display: grid;
            width: min(420px, calc(100vw - 32px));
            gap: 8px;
            pointer-events: none;
        }
        :host([position="top-left"]) .stack {
            top: 16px;
            left: 16px;
        }
        :host([position="top-right"]) .stack {
            top: 16px;
            right: 16px;
        }
        :host([position="bottom-left"]) .stack {
            bottom: 16px;
            left: 16px;
        }
        :host([position="bottom-right"]) .stack {
            right: 16px;
            bottom: 16px;
        }
        aui-toast {
            position: relative;
            inset: auto;
            pointer-events: auto;
        }
        @media (max-width: 520px) {
            .stack {
                width: calc(100vw - 20px);
            }
            :host([position="top-left"]) .stack,
            :host([position="bottom-left"]) .stack {
                left: 10px;
            }
            :host([position="top-right"]) .stack,
            :host([position="bottom-right"]) .stack {
                right: 10px;
            }
        }
    `;

    items: AdminToastItem[] = [];
    position = "bottom-right";
    max = 5;
    persistKey = "";
    syncTabs = false;
    channelName = "blbui-toasts";
    label = "Notifications";

    private readonly source = nextUid("toast-manager");
    private channel: BroadcastChannel | null = null;
    private syncStorageKey = "";
    private applyingRemote = false;

    connectedCallback(): void {
        super.connectedCallback();
        this.restore();
        this.configureSync();
    }

    disconnectedCallback(): void {
        this.disconnectSync();
        super.disconnectedCallback();
    }

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has("persistKey") || changed.has("syncTabs") || changed.has("channelName")) {
            this.restore();
            this.configureSync();
        }
        if (changed.has("items") && !this.applyingRemote) {
            this.persist();
            this.dispatchChange();
        }
        if (changed.has("max") && this.items.length > this.max) {
            this.items = this.limit(this.items);
        }
    }

    /** Add a notification and return its stable id. */
    push(item: Omit<AdminToastItem, "id"> & { id?: string }): string {
        const id = item.id ?? nextUid("toast");
        const next = this.limit([
            ...this.items,
            {
                id,
                title: item.title,
                message: item.message,
                variant: item.variant ?? "default",
                duration: item.duration ?? 4000,
            },
        ]);
        this.commit(next, { type: "state", items: next });
        return id;
    }

    close(id: string): void {
        if (!this.items.some((item) => item.id === id)) return;
        this.commit(
            this.items.filter((item) => item.id !== id),
            { type: "close", id },
        );
    }

    clear(): void {
        if (!this.items.length) return;
        this.commit([], { type: "clear" });
    }

    private limit(items: AdminToastItem[]): AdminToastItem[] {
        const max = Number.isFinite(this.max) ? Math.max(1, Math.floor(this.max)) : 5;
        return items.slice(-max);
    }

    private commit(items: AdminToastItem[], message: ToastSyncPayload): void {
        this.items = this.limit(items);
        this.persist();
        this.broadcast({ ...message, source: this.source } as ToastSyncMessage);
        this.dispatchChange();
        this.requestUpdate();
    }

    private dispatchChange(): void {
        this.dispatchDetail("aui-toast-manager-change", { items: this.items });
    }

    private restore(): void {
        if (!this.persistKey || typeof localStorage === "undefined") return;
        try {
            const raw = localStorage.getItem(this.persistKey);
            if (!raw) return;
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;
            const items = parsed.filter((item): item is AdminToastItem => this.validItem(item));
            this.applyingRemote = true;
            this.items = this.limit(items);
            this.applyingRemote = false;
            this.requestUpdate();
        } catch {
            // Storage may be disabled or contain data from an older schema.
        }
    }

    private persist(): void {
        if (!this.persistKey || typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(this.persistKey, JSON.stringify(this.items));
        } catch {
            // Quota and privacy-mode failures should not break notifications.
        }
    }

    private validItem(value: unknown): value is AdminToastItem {
        if (!value || typeof value !== "object") return false;
        const item = value as Partial<AdminToastItem>;
        return (
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.message === "string"
        );
    }

    private readonly onStorage = (event: StorageEvent): void => {
        if (event.key === this.persistKey && event.newValue) {
            this.restore();
            return;
        }
        if (event.key !== this.syncStorageKey || !event.newValue) return;
        try {
            const message = JSON.parse(event.newValue) as ToastSyncMessage;
            this.receive(message);
        } catch {
            // Ignore malformed data from another application using the key.
        }
    };

    private configureSync(): void {
        this.disconnectSync();
        if (!this.syncTabs || typeof window === "undefined") return;
        this.syncStorageKey = `${this.channelName}:sync`;
        const BroadcastChannelCtor = globalThis.BroadcastChannel;
        if (typeof BroadcastChannelCtor === "function") {
            this.channel = new BroadcastChannelCtor(this.channelName);
            this.channel.addEventListener("message", (event: MessageEvent<ToastSyncMessage>) =>
                this.receive(event.data),
            );
        }
        window.addEventListener("storage", this.onStorage);
    }

    private disconnectSync(): void {
        this.channel?.close();
        this.channel = null;
        if (typeof window !== "undefined") window.removeEventListener("storage", this.onStorage);
        this.syncStorageKey = "";
    }

    private broadcast(message: ToastSyncMessage): void {
        if (!this.syncTabs || typeof window === "undefined") return;
        if (this.channel) {
            this.channel.postMessage(message);
            return;
        }
        try {
            localStorage.setItem(this.syncStorageKey, JSON.stringify(message));
        } catch {
            // Cross-tab sync is best effort when storage is unavailable.
        }
    }

    private receive(message: ToastSyncMessage): void {
        if (!message || message.source === this.source) return;
        this.applyingRemote = true;
        if (message.type === "state")
            this.items = this.limit(message.items.filter((item) => this.validItem(item)));
        else if (message.type === "close")
            this.items = this.items.filter((item) => item.id !== message.id);
        else this.items = [];
        this.applyingRemote = false;
        this.persist();
        this.dispatchChange();
        this.requestUpdate();
    }

    render() {
        return html`<div class="stack" role="region" aria-label=${this.label} aria-live="polite">
            ${this.items.map(
                (item) => html`<aui-toast
                    open
                    .title=${item.title}
                    .message=${item.message}
                    .variant=${item.variant ?? "default"}
                    .duration=${item.duration ?? 4000}
                    @aui-close=${() => this.close(item.id)}
                ></aui-toast>`,
            )}
        </div>`;
    }
}
