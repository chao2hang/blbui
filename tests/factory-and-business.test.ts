/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { createApp, h, nextTick, type App } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerAdminElements } from "../core/src/register";
import { registerBusinessElements } from "../business/src/register";
import {
  AdminDataList,
  AdminDrawer,
  AdminProgress,
  AdminSlider,
  AdminToggle,
} from "../vue/src/index";

type AnyElement = HTMLElement & Record<string, unknown>;

function mountComponent(render: () => unknown) {
  const host = document.createElement("div");
  document.body.append(host);
  const app: App = createApp({ setup: () => render });
  app.config.warnHandler = () => {};
  app.mount(host);
  return { app, host };
}

function emitDetail(el: AnyElement, name: string, detail: unknown): void {
  el.dispatchEvent(new CustomEvent(name, { detail }));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("vue factory bindings", () => {
  it("syncs scalar and array properties to factory components", async () => {
    registerAdminElements();
    mountComponent(() => h(AdminProgress, { value: 42, max: 100, label: "LOAD" }));
    const progress = document.querySelector("aui-progress") as AnyElement;
    expect(progress.value).toBe(42);
    expect(progress.max).toBe(100);
    expect(progress.label).toBe("LOAD");

    const rows = [{ id: "1", name: "A" }];
    mountComponent(() => h(AdminDataList, { items: rows, columns: 2 }));
    const list = document.querySelector("aui-data-list") as AnyElement;
    expect(list.columns).toBe(2);
    expect(list.items).toBe(rows);
  });

  it("emits value-change style events plus update:value for v-model", async () => {
    registerAdminElements();
    const onChange = vi.fn();
    const onModel = vi.fn();
    mountComponent(() =>
      h(AdminSlider, {
        value: 5,
        min: 0,
        max: 100,
        onChange,
        "onUpdate:value": onModel,
      }),
    );
    const el = document.querySelector("aui-slider") as AnyElement;
    emitDetail(el, "aui-slider-change", { value: 42 });
    expect(onChange).toHaveBeenCalledWith(42);
    expect(onModel).toHaveBeenCalledWith(42);
  });

  it("emits toggle-change plus update:pressed", async () => {
    registerAdminElements();
    const onToggle = vi.fn();
    const onModel = vi.fn();
    mountComponent(() =>
      h(AdminToggle, {
        pressed: false,
        label: "X",
        onToggleChange: onToggle,
        "onUpdate:pressed": onModel,
      }),
    );
    const el = document.querySelector("aui-toggle") as AnyElement;
    emitDetail(el, "aui-toggle-change", { pressed: true });
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(onModel).toHaveBeenCalledWith(true);
  });

  it("emits close plus update:open(false) for drawers", async () => {
    registerAdminElements();
    const onClose = vi.fn();
    const onModel = vi.fn();
    mountComponent(() => h(AdminDrawer, { open: true, title: "T", onClose, "onUpdate:open": onModel }));
    const el = document.querySelector("aui-drawer") as AnyElement;
    emitDetail(el, "aui-close", { open: false });
    expect(onClose).toHaveBeenCalledWith(false);
    expect(onModel).toHaveBeenCalledWith(false);
  });
});

describe("business form builder", () => {
  it("associates field labels with generated controls by id", async () => {
    registerAdminElements();
    registerBusinessElements();
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = "<aui-form-builder></aui-form-builder>";
    const el = host.querySelector("aui-form-builder") as AnyElement;
    el.fields = [
      { name: "hostname", label: "HOSTNAME", type: "text" },
      { name: "region", label: "REGION", type: "select", options: [{ value: "eu", label: "EU" }] },
    ];
    await nextTick();
    const shadow = el.shadowRoot;
    expect(shadow).not.toBeNull();
    for (const name of ["hostname", "region"]) {
      const input = shadow!.querySelector(`[id="${name}"]`) as HTMLElement | null;
      const label = shadow!.querySelector(`label[for="${name}"]`) as HTMLElement | null;
      expect(input, `control #${name}`).not.toBeNull();
      expect(label, `label for #${name}`).not.toBeNull();
    }
    });
});

describe("business content editors", () => {
    it("renders Markdown preview and exposes controlled input/change events", async () => {
        registerAdminElements();
        registerBusinessElements();
        const editor = document.createElement("aui-markdown-editor") as HTMLElement & {
            value: string;
            preview: boolean;
            updateComplete: Promise<boolean>;
        };
        editor.value = "# Release\n\n**Ready**";
        editor.preview = true;
        document.body.append(editor);
        await editor.updateComplete;
        expect(editor.shadowRoot?.querySelector("h1")?.textContent).toContain("Release");
        expect(editor.shadowRoot?.querySelector("strong")?.textContent).toBe("Ready");

        const input = editor.shadowRoot?.querySelector("textarea") as HTMLTextAreaElement;
        input.value = "Updated";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await editor.updateComplete;
        expect(editor.value).toBe("Updated");
        expect(editor.shadowRoot?.querySelector("p")?.textContent).toBe("Updated");
    });

    it("sanitizes rich text preview and supports read-only rendering", async () => {
        registerBusinessElements();
        const editor = document.createElement("aui-rich-text-editor") as HTMLElement & {
            value: string;
            readOnly: boolean;
            updateComplete: Promise<boolean>;
        };
        editor.value = '<p onclick="bad()">Safe <strong>text</strong></p><script>bad()</script>';
        editor.readOnly = true;
        document.body.append(editor);
        await editor.updateComplete;
        const preview = editor.shadowRoot?.querySelector(".preview");
        expect(preview?.querySelector("strong")?.textContent).toBe("text");
        expect(preview?.querySelector("script")).toBeNull();
        expect(preview?.innerHTML).not.toContain("onclick");
        expect(editor.shadowRoot?.querySelector("textarea")).toBeNull();
    });
});
