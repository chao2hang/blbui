/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { registerAdminElements } from "../core/src/register";
import type { AdminPaginationElement, AdminTabsElement } from "../core/src";

beforeAll(() => {
  registerAdminElements();
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("industrial admin core", () => {
  it("disables a loading button and exposes busy state", async () => {
    const button = document.createElement("aui-button");
    button.setAttribute("variant", "primary");
    button.setAttribute("loading", "true");
    document.body.append(button);

    await (button as unknown as { updateComplete: Promise<boolean> }).updateComplete;
    const innerButton = button.shadowRoot?.querySelector("button");

    expect(innerButton?.disabled).toBe(true);
    expect(innerButton?.getAttribute("aria-busy")).toBe("true");
    expect(innerButton?.querySelector(".spinner")).not.toBeNull();
  });

  it("emits the next page while disabling PREV on the first page", async () => {
    const pagination = document.createElement(
      "aui-pagination",
    ) as unknown as AdminPaginationElement;
    pagination.page = 1;
    pagination.totalPages = 3;
    document.body.append(pagination);
    await pagination.updateComplete;

    let selectedPage = 0;
    pagination.addEventListener("aui-page-change", (event) => {
      selectedPage = (event as CustomEvent<{ page: number }>).detail.page;
    });

    const buttons = pagination.shadowRoot?.querySelectorAll("button");
    expect(buttons?.[0].disabled).toBe(true);
    buttons?.[1].click();
    await pagination.updateComplete;

    expect(selectedPage).toBe(2);
    expect(pagination.page).toBe(2);
  });

  it("keeps tabs accessible and emits the selected tab id", async () => {
    const tabs = document.createElement("aui-tabs") as unknown as AdminTabsElement;
    tabs.items = [
      { id: "overview", label: "Overview" },
      { id: "logs", label: "Logs" },
    ];
    tabs.active = "overview";
    document.body.append(tabs);
    await tabs.updateComplete;

    let selectedTab = "";
    tabs.addEventListener("aui-tab-change", (event) => {
      selectedTab = (event as CustomEvent<{ id: string }>).detail.id;
    });
    const tabButtons = tabs.shadowRoot?.querySelectorAll('[role="tab"]');
    tabButtons?.[1].click();
    await tabs.updateComplete;

    expect(selectedTab).toBe("logs");
    expect(tabButtons?.[1].getAttribute("aria-selected")).toBe("true");
  });

  it("shows an explicit loading state without removing the table structure", async () => {
    const table = document.createElement("aui-table");
    table.setAttribute("loading", "true");
    table.innerHTML = "<table><thead><tr><th>NAME</th></tr></thead><tbody></tbody></table>";
    document.body.append(table);
    await (table as unknown as { updateComplete: Promise<boolean> }).updateComplete;

    expect(table.querySelector("table")).not.toBeNull();
    expect(table.shadowRoot?.querySelector(".loading-state")?.textContent).toContain("Loading");
  });
});

describe("expanded component contracts", () => {
  it("filters combobox options and emits the chosen value", async () => {
    const combobox = document.createElement("aui-combobox") as HTMLElement & {
      options: Array<{ value: string; label: string }>;
      updateComplete: Promise<boolean>;
    };
    combobox.options = [
      { value: "openai", label: "OpenAI" },
      { value: "anthropic", label: "Anthropic" },
    ];
    document.body.append(combobox);
    await combobox.updateComplete;

    let selected = "";
    combobox.addEventListener("aui-change", (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });
    const input = combobox.shadowRoot?.querySelector("input");
    if (!input) throw new Error("Combobox input was not rendered");
    input.value = "anth";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await combobox.updateComplete;
    combobox.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.click();

    expect(selected).toBe("anthropic");
    expect((combobox as unknown as { open: boolean }).open).toBe(false);
  });

  it("keeps a progress value within its accessible range", async () => {
    const progress = document.createElement("aui-progress") as HTMLElement & {
      value: number;
      max: number;
      updateComplete: Promise<boolean>;
    };
    progress.value = 120;
    progress.max = 100;
    document.body.append(progress);
    await progress.updateComplete;
    const bar = progress.shadowRoot?.querySelector('[role="progressbar"]');

    expect(bar?.getAttribute("aria-valuenow")).toBe("100");
    expect(progress.shadowRoot?.querySelector<HTMLElement>(".indicator")?.style.width).toBe("100%");
  });

  it("emits a menu selection from a dropdown item", async () => {
    const dropdown = document.createElement("aui-dropdown") as HTMLElement & {
      items: Array<{ id: string; label: string }>;
      updateComplete: Promise<boolean>;
    };
    dropdown.items = [{ id: "refresh", label: "Refresh" }];
    document.body.append(dropdown);
    await dropdown.updateComplete;

    let selected = "";
    dropdown.addEventListener("aui-menu-select", (event) => {
      selected = (event as CustomEvent<{ id: string }>).detail.id;
    });
    dropdown.shadowRoot?.querySelector<HTMLElement>(".menu button")?.click();

    expect(selected).toBe("refresh");
  });

  it("selects a date only in the month it belongs to", async () => {
    const grid = document.createElement("aui-calendar-grid") as HTMLElement & {
      year: number;
      month: number;
      selected: string;
      updateComplete: Promise<boolean>;
    };
    grid.year = 2026;
    grid.month = 0; // January
    grid.selected = "2026-02-15"; // February 15th
    document.body.append(grid);
    await grid.updateComplete;

    const january15 = [...grid.shadowRoot?.querySelectorAll("button.day")].find(
      (button) => !button.hasAttribute("disabled") && button.textContent?.trim() === "15",
    );
    expect(january15?.getAttribute("data-selected")).toBe("false");

    grid.month = 1; // February
    await grid.updateComplete;
    const february15 = [...grid.shadowRoot?.querySelectorAll("button.day")].find(
      (button) => !button.hasAttribute("disabled") && button.textContent?.trim() === "15",
    );
    expect(february15?.getAttribute("data-selected")).toBe("true");
  });

  it("supports multi-select in a toggle group", async () => {
    const group = document.createElement("aui-toggle-group") as HTMLElement & {
      items: Array<{ id: string; label: string }>;
      multiple: boolean;
      values: string[];
      updateComplete: Promise<boolean>;
    };
    group.multiple = true;
    group.items = [
      { id: "day", label: "24H" },
      { id: "week", label: "7D" },
    ];
    document.body.append(group);
    await group.updateComplete;

    const changes: Array<{ value: string; values: string[] }> = [];
    group.addEventListener("aui-toggle-group-change", (event) => {
      changes.push((event as CustomEvent<{ value: string; values: string[] }>).detail);
    });

    const buttons = group.shadowRoot?.querySelectorAll("button");
    buttons?.[0].click();
    buttons?.[1].click();
    await group.updateComplete;
    expect(group.values).toEqual(["day", "week"]);
    expect(buttons?.[0].getAttribute("aria-pressed")).toBe("true");
    expect(buttons?.[1].getAttribute("aria-pressed")).toBe("true");

    buttons?.[0].click();
    await group.updateComplete;
    expect(group.values).toEqual(["week"]);
    expect(changes.at(-1)).toEqual({ value: "day", values: ["week"] });
  });

  it("opens from its trigger and emits aui-close when toggled shut", async () => {
    const drawer = document.createElement("aui-drawer") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    drawer.title = "DETAILS";
    drawer.innerHTML = '<button slot="trigger">OPEN DRAWER</button>';
    document.body.append(drawer);
    await drawer.updateComplete;

    let closeCount = 0;
    drawer.addEventListener("aui-close", () => {
      closeCount += 1;
    });

    const trigger = drawer.querySelector("button") as HTMLButtonElement;
    trigger.click();
    await drawer.updateComplete;
    expect(drawer.open).toBe(true);
    expect(closeCount).toBe(0);

    trigger.click();
    await drawer.updateComplete;
    expect(drawer.open).toBe(false);
    expect(closeCount).toBe(1);
  });
});

describe("accessibility contracts", () => {
  it("moves focus into a drawer, closes on Escape, and restores focus", async () => {
    const drawer = document.createElement("aui-drawer") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    drawer.title = "DETAILS";
    drawer.innerHTML = '<button slot="trigger">OPEN DRAWER</button>';
    document.body.append(drawer);
    await drawer.updateComplete;

    const trigger = drawer.querySelector("button") as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    await drawer.updateComplete;
    expect(drawer.open).toBe(true);
    const focusedInside = drawer.shadowRoot?.activeElement;
    expect(focusedInside instanceof HTMLElement).toBe(true);
    expect(focusedInside?.closest(".panel")).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await drawer.updateComplete;
    expect(drawer.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("closes a popover on outside click and Escape", async () => {
    const popover = document.createElement("aui-popover") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    popover.innerHTML = '<button slot="trigger">MORE</button><span slot="content">BODY</span>';
    document.body.append(popover);
    await popover.updateComplete;

    const outside = document.createElement("button");
    document.body.append(outside);
    const triggerWrapper = popover.shadowRoot?.querySelector("span") as HTMLElement;

    triggerWrapper.click();
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    outside.click();
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    triggerWrapper.click();
    await popover.updateComplete;
    expect(popover.open).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await popover.updateComplete;
    expect(popover.open).toBe(false);
  });

  it("navigates a dropdown menu with arrow keys and renders separators inert", async () => {
    const dropdown = document.createElement("aui-dropdown") as HTMLElement & {
      items: Array<{ id: string; label: string; separator?: boolean }>;
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    dropdown.items = [
      { id: "a", label: "Alpha" },
      { id: "sep", label: "-", separator: true },
      { id: "b", label: "Beta" },
    ];
    document.body.append(dropdown);
    await dropdown.updateComplete;

    expect(dropdown.shadowRoot?.querySelector("[role='separator']")).toBeInstanceOf(
      HTMLDivElement,
    );

    dropdown.open = true;
    await dropdown.updateComplete;
    const buttons = [...dropdown.shadowRoot!.querySelectorAll("button[role='menuitem']")];
    expect(buttons).toHaveLength(2);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await dropdown.updateComplete;
    expect(dropdown.shadowRoot?.activeElement).toBe(buttons[1]);
  });

  it("moves the active tab with the arrow keys", async () => {
    const tabs = document.createElement("aui-tabs") as unknown as AdminTabsElement;
    tabs.items = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ];
    tabs.active = "a";
    document.body.append(tabs);
    await tabs.updateComplete;

    const tabButtons = tabs.shadowRoot?.querySelectorAll("button[role='tab']");
    tabButtons?.[0].focus();
    tabButtons?.[0].dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await tabs.updateComplete;
    expect(tabs.active).toBe("b");
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[1]);
  });

  it("associates a field label with its slotted control", async () => {
    const field = document.createElement("aui-field") as HTMLElement & {
      updateComplete: Promise<boolean>;
    };
    field.label = "EMAIL";
    field.innerHTML = "<aui-input></aui-input>";
    document.body.append(field);
    await field.updateComplete;
    await (field.querySelector("aui-input") as unknown as {
      updateComplete: Promise<boolean>;
    }).updateComplete;

    const control = field.querySelector("aui-input")!;
    const labelId = control.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(field.shadowRoot?.querySelector(`label#${labelId}`)).not.toBeNull();
  });

  it("opens and closes a command palette from its trigger and Escape", async () => {
    const command = document.createElement("aui-command") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    command.open = false;
    document.body.append(command);
    await command.updateComplete;

    const trigger = command.shadowRoot?.querySelector("button.trigger");
    expect(trigger).not.toBeNull();

    let openState = false;
    command.addEventListener("aui-open-change", (event) => {
      openState = (event as CustomEvent<{ open: boolean }>).detail.open;
    });
    trigger?.click();
    await command.updateComplete;
    expect(openState).toBe(true);
    expect(command.open).toBe(true);

    const input = command.shadowRoot?.querySelector("input");
    input?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await command.updateComplete;
    expect(command.open).toBe(false);
  });

  it("raises the rating with the arrow keys", async () => {
    const rating = document.createElement("aui-rating") as HTMLElement & {
      value: number;
      updateComplete: Promise<boolean>;
    };
    document.body.append(rating);
    await rating.updateComplete;

    const stars = rating.shadowRoot?.querySelectorAll("button[role='radio']");
    stars?.[0].focus();
    stars?.[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await rating.updateComplete;
    expect(rating.value).toBe(1);
  });

  it("makes the file upload dropzone keyboard operable", async () => {
    const upload = document.createElement("aui-file-upload") as HTMLElement & {
      updateComplete: Promise<boolean>;
    };
    document.body.append(upload);
    await upload.updateComplete;

    const zone = upload.shadowRoot?.querySelector(".dropzone");
    expect(zone?.getAttribute("role")).toBe("button");
    expect(zone?.getAttribute("tabindex")).toBe("0");
  });

  it("links a tooltip to its target via aria-describedby", async () => {
    const tooltip = document.createElement("aui-tooltip") as HTMLElement & {
      content: string;
      updateComplete: Promise<boolean>;
    };
    tooltip.content = "HELP";
    tooltip.innerHTML = "<button>HOVER</button>";
    document.body.append(tooltip);
    await tooltip.updateComplete;

    const target = tooltip.querySelector("button")!;
    const describedBy = target.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(tooltip.shadowRoot?.querySelector(`#${describedBy}`)).not.toBeNull();
  });
});


describe("table state sizing (issue #1)", () => {
  it("keeps loading/empty/error block height overridable via tokens", async () => {
    const table = document.createElement("aui-table") as HTMLElement & {
        empty: boolean;
        updateComplete: Promise<boolean>;
    };
    table.empty = true;
    document.body.append(table);
    await table.updateComplete;

    const styleText = Array.from(table.shadowRoot?.querySelectorAll("style") ?? [])
        .map((style) => style.textContent ?? "")
        .join("\n");
    expect(styleText).toContain("var(--aui-table-state-min-height");
    expect(styleText).toContain("var(--aui-table-state-padding");
    expect(styleText).not.toContain("min-height: 160px");
    expect(styleText).not.toContain("padding: 48px");
  });

  it("ships compact token defaults", async () => {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    // Vite rewrites the `new URL(x, import.meta.url)` pattern for asset
    // analysis, which breaks in vite-node; assign the URL to a variable first.
    const selfUrl = import.meta.url;
    const tokensPath = fileURLToPath(new URL("../core/src/tokens.css", selfUrl));
    const css = await readFile(tokensPath, "utf8");
    expect(css).toContain("--aui-table-state-min-height: 96px");
    expect(css).toContain("--aui-table-state-padding: 16px");
  });
});
