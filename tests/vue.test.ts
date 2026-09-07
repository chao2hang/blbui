import { createApp, h, nextTick, ref, type App } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { registerAdminElements } from "../core/src/register";
import { AdminDialog, AdminInput, AdminSelect } from "../vue/src/index";

type AuiInputElement = HTMLElement & {
  value: string;
  options: Array<{ value: string; label: string }>;
  open: boolean;
};

function mountComponent(render: () => unknown) {
  const host = document.createElement("div");
  document.body.append(host);
  const app: App = createApp({ setup: () => render });
  app.config.warnHandler = () => {};
  app.mount(host);
  return { app, host };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("vue bindings", () => {
  it("syncs parent-driven value updates to the element", async () => {
    registerAdminElements();
    const value = ref("first");
    const { app } = mountComponent(() => h(AdminInput, { value: value.value }));

    const el = document.querySelector("aui-input") as AuiInputElement;
    expect(el.value).toBe("first");

    value.value = "second";
    await nextTick();
    expect(el.value).toBe("second");
    expect(el.shadowRoot?.querySelector("input")?.value).toBe("second");
    app.unmount();
  });

  it("syncs parent-driven options updates to the element", async () => {
    registerAdminElements();
    const options = ref([{ value: "a", label: "A" }]);
    mountComponent(() => h(AdminSelect, { options: options.value, value: "" }));

    const el = document.querySelector("aui-select") as AuiInputElement;
    expect(el.options).toHaveLength(1);

    options.value = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    await nextTick();
    expect(el.options).toHaveLength(2);
  });

  it("syncs parent-driven open state to the element", async () => {
    registerAdminElements();
    const open = ref(false);
    const { app } = mountComponent(() => h(AdminDialog, { open: open.value, title: "T" }));

    const el = document.querySelector("aui-dialog") as AuiInputElement;
    expect(el.open).toBe(false);

    open.value = true;
    await nextTick();
    expect(el.open).toBe(true);
    app.unmount();
  });
});
