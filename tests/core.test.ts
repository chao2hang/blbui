/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { registerAdminElements } from "../core/src/register";
import {
  adminThemes,
  getAdminTheme,
  setAdminTheme,
  toggleAdminThemeMode,
} from "../core/src/theme";
import type { AdminPaginationElement, AdminTabsElement } from "../core/src";

beforeAll(() => {
  registerAdminElements();
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("industrial admin core", () => {
  it("registers the expanded navigation, input and data primitives", () => {
    expect(adminThemes).toHaveLength(9);
    for (const tag of [
      "aui-menu",
      "aui-sidebar",
      "aui-navbar",
      "aui-date-picker",
      "aui-time-picker",
      "aui-pin-input",
      "aui-descriptions",
      "aui-cascader",
      "aui-transfer",
      "aui-context-menu",
      "aui-hover-card",
      "aui-notification-center",
      "aui-upload-list",
      "aui-file-preview",
    ]) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });

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

  it("emits a semantic selection from the standalone menu", async () => {
    const menu = document.createElement("aui-menu") as HTMLElement & {
      items: Array<{ id: string; label: string }>;
      value: string;
      updateComplete: Promise<boolean>;
    };
    menu.items = [
      { id: "overview", label: "Overview" },
      { id: "settings", label: "Settings" },
    ];
    document.body.append(menu);
    await menu.updateComplete;

    let selected = "";
    menu.addEventListener("aui-menu-select", (event) => {
      selected = (event as CustomEvent<{ id: string }>).detail.id;
    });
    menu.shadowRoot?.querySelectorAll<HTMLButtonElement>("button")[1]?.click();
    await menu.updateComplete;

    expect(selected).toBe("settings");
    expect(menu.value).toBe("settings");
  });

  it("emits open state when the standalone sidebar is closed", async () => {
    const sidebar = document.createElement("aui-sidebar") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    sidebar.title = "Workspace";
    document.body.append(sidebar);
    await sidebar.updateComplete;

    let open = true;
    sidebar.addEventListener("aui-open-change", (event) => {
      open = (event as CustomEvent<{ open: boolean }>).detail.open;
    });
    sidebar.shadowRoot?.querySelector<HTMLButtonElement>("button.close")?.click();
    await sidebar.updateComplete;

    expect(open).toBe(false);
    expect(sidebar.open).toBe(false);
  });

  it("emits date and time changes from native picker controls", async () => {
    const date = document.createElement("aui-date-picker") as HTMLElement & {
      value: string;
      updateComplete: Promise<boolean>;
    };
    const time = document.createElement("aui-time-picker") as HTMLElement & {
      value: string;
      updateComplete: Promise<boolean>;
    };
    document.body.append(date, time);
    await Promise.all([date.updateComplete, time.updateComplete]);

    let selectedDate = "";
    let selectedTime = "";
    date.addEventListener("aui-date-change", (event) => {
      selectedDate = (event as CustomEvent<{ value: string }>).detail.value;
    });
    time.addEventListener("aui-time-change", (event) => {
      selectedTime = (event as CustomEvent<{ value: string }>).detail.value;
    });
    const dateInput = date.shadowRoot?.querySelector("input") as HTMLInputElement;
    const timeInput = time.shadowRoot?.querySelector("input") as HTMLInputElement;
    dateInput.value = "2026-09-07";
    timeInput.value = "09:30";
    dateInput.dispatchEvent(new Event("change", { bubbles: true }));
    timeInput.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.all([date.updateComplete, time.updateComplete]);

    expect(selectedDate).toBe("2026-09-07");
    expect(selectedTime).toBe("09:30");
    expect(date.value).toBe("2026-09-07");
    expect(time.value).toBe("09:30");
  });

  it("reports PIN input completion and renders descriptions", async () => {
    const pin = document.createElement("aui-pin-input") as HTMLElement & {
      length: number;
      updateComplete: Promise<boolean>;
    };
    pin.length = 4;
    document.body.append(pin);
    await pin.updateComplete;

    let lastPin: { value: string; complete: boolean } | undefined;
    pin.addEventListener("aui-pin-change", (event) => {
      lastPin = (event as CustomEvent<{ value: string; complete: boolean }>).detail;
    });
    for (let index = 0; index < 4; index += 1) {
      const input = pin.shadowRoot?.querySelectorAll<HTMLInputElement>("input")[index];
      if (!input) throw new Error("PIN input was not rendered");
      input.value = String(index + 1);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await pin.updateComplete;
    }
    expect(lastPin).toEqual({ value: "1234", complete: true });

    const descriptions = document.createElement("aui-descriptions") as HTMLElement & {
      items: Array<{ label: string; value: string; description?: string }>;
      updateComplete: Promise<boolean>;
    };
    descriptions.items = [
      { label: "STATUS", value: "ONLINE", description: "Healthy" },
      { label: "REGION", value: "AP-SOUTHEAST-1" },
    ];
    document.body.append(descriptions);
    await descriptions.updateComplete;
    expect(descriptions.shadowRoot?.querySelectorAll("dt")).toHaveLength(2);
    expect(descriptions.shadowRoot?.querySelector("dd")?.textContent).toContain("ONLINE");
  });

  it("switches theme presets and light/dark modes through the public API", () => {
    const target = document.createElement("div");
    setAdminTheme(target, "glass", "light");
    expect(getAdminTheme(target)).toEqual({ theme: "glass", mode: "light" });
    expect(toggleAdminThemeMode(target)).toBe("dark");
    expect(target.dataset.auiTheme).toBe("glass");
    expect(target.dataset.auiMode).toBe("dark");
  });
});

describe("expanded component contracts", () => {
  it("selects a leaf path from a cascader and emits the complete path", async () => {
    const cascader = document.createElement("aui-cascader") as HTMLElement & {
      options: Array<{ value: string; label: string; children?: Array<{ value: string; label: string }> }>;
      value: string[];
      updateComplete: Promise<boolean>;
    };
    cascader.options = [
      { value: "region", label: "Region", children: [{ value: "east", label: "East" }] },
    ];
    document.body.append(cascader);
    await cascader.updateComplete;

    let selected: string[] = [];
    cascader.addEventListener("aui-cascader-change", (event) => {
      selected = (event as CustomEvent<{ value: string[] }>).detail.value;
    });
    cascader.shadowRoot?.querySelector<HTMLButtonElement>(".trigger")?.click();
    await cascader.updateComplete;
    cascader.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.click();
    await cascader.updateComplete;
    const leaf = cascader.shadowRoot?.querySelectorAll<HTMLButtonElement>(".level:last-child .option")[0];
    leaf?.click();
    await cascader.updateComplete;

    expect(selected).toEqual(["region", "east"]);
    expect(cascader.value).toEqual(["region", "east"]);
    expect(cascader.open).toBe(false);
  });

  it("moves selected transfer options between source and target lists", async () => {
    const transfer = document.createElement("aui-transfer") as HTMLElement & {
      options: Array<{ value: string; label: string }>;
      values: string[];
      updateComplete: Promise<boolean>;
    };
    transfer.options = [
      { value: "read", label: "Read" },
      { value: "write", label: "Write" },
    ];
    document.body.append(transfer);
    await transfer.updateComplete;
    const sourceOption = transfer.shadowRoot?.querySelector<HTMLButtonElement>(".list:first-child .option");
    sourceOption?.click();
    await transfer.updateComplete;
    transfer.shadowRoot?.querySelector<HTMLButtonElement>(".actions button")?.click();
    await transfer.updateComplete;

    expect(transfer.values).toEqual(["read"]);
    expect(transfer.shadowRoot?.querySelectorAll(".list")[1]?.textContent).toContain("Read");
  });

  it("opens a context menu from the native contextmenu gesture", async () => {
    const menu = document.createElement("aui-context-menu") as HTMLElement & {
      items: Array<{ id: string; label: string }>;
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    menu.items = [{ id: "inspect", label: "Inspect" }];
    menu.innerHTML = "<button>Workspace</button>";
    document.body.append(menu);
    await menu.updateComplete;
    let selected = "";
    menu.addEventListener("aui-menu-select", (event) => {
      selected = (event as CustomEvent<{ id: string }>).detail.id;
    });
    menu.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 120, clientY: 80 }));
    await menu.updateComplete;
    expect(menu.open).toBe(true);
    menu.shadowRoot?.querySelector<HTMLButtonElement>("button.item")?.click();
    await menu.updateComplete;
    expect(selected).toBe("inspect");
    expect(menu.open).toBe(false);
  });

  it("exposes hover-card trigger state and dismissible notifications", async () => {
    const hover = document.createElement("aui-hover-card") as HTMLElement & {
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    hover.innerHTML = '<button slot="trigger">Inspect</button><span slot="content">Details</span>';
    document.body.append(hover);
    await hover.updateComplete;
    hover.open = true;
    await hover.updateComplete;
    expect(hover.shadowRoot?.querySelector(".panel")).not.toBeNull();
    expect(hover.querySelector("button")?.getAttribute("aria-expanded")).toBe("true");

    const center = document.createElement("aui-notification-center") as HTMLElement & {
      notifications: Array<{ id: string; message: string }>;
      updateComplete: Promise<boolean>;
    };
    center.notifications = [{ id: "n1", message: "Ready", variant: "success" }];
    document.body.append(center);
    await center.updateComplete;
    expect(center.shadowRoot?.querySelectorAll("article.notification")).toHaveLength(1);
    center.shadowRoot?.querySelector<HTMLButtonElement>("button.close")?.click();
    await center.updateComplete;
    expect(center.notifications).toEqual([]);
  });

  it("renders upload statuses and emits remove/retry/preview contracts", async () => {
    const uploads = document.createElement("aui-upload-list") as HTMLElement & {
      files: Array<{ id: string; name: string; status: string; error?: string }>;
      updateComplete: Promise<boolean>;
    };
    uploads.files = [
      { id: "ready", name: "gateway.pem", status: "success" },
      { id: "uploading", name: "routes.json", status: "uploading" },
      { id: "failed", name: "bundle.zip", status: "error", error: "Timed out" },
    ];
    document.body.append(uploads);
    await uploads.updateComplete;

    expect(uploads.shadowRoot?.querySelectorAll("article.item")).toHaveLength(3);
    expect(uploads.shadowRoot?.querySelector("progress")).not.toBeNull();
    expect(uploads.shadowRoot?.querySelector(".error")?.textContent).toContain("Timed out");

    let retried = "";
    let previewed = "";
    uploads.addEventListener("aui-upload-retry", (event) => {
      retried = (event as CustomEvent<{ id: string }>).detail.id;
    });
    uploads.addEventListener("aui-upload-preview", (event) => {
      previewed = (event as CustomEvent<{ id: string }>).detail.id;
    });
    const failedItem = uploads.shadowRoot?.querySelectorAll<HTMLElement>("article.item")[2];
    failedItem?.querySelector<HTMLButtonElement>("button:nth-of-type(2)")?.click();
    failedItem?.querySelector<HTMLButtonElement>("button:nth-of-type(1)")?.click();
    await uploads.updateComplete;

    expect(retried).toBe("failed");
    expect(previewed).toBe("failed");
    uploads.shadowRoot?.querySelector<HTMLButtonElement>("article.item button[aria-label^='Remove']")?.click();
    await uploads.updateComplete;
    expect(uploads.files).toHaveLength(2);
  });

  it("opens file preview metadata and emits close/download events", async () => {
    const preview = document.createElement("aui-file-preview") as HTMLElement & {
      file: { id: string; name: string; type: string; size: number; url: string };
      open: boolean;
      updateComplete: Promise<boolean>;
    };
    preview.file = {
      id: "report",
      name: "report.pdf",
      type: "application/pdf",
      size: 2048,
      url: "https://example.invalid/report.pdf",
    };
    preview.open = true;
    document.body.append(preview);
    await preview.updateComplete;

    expect(preview.shadowRoot?.querySelector("dialog")?.open).toBe(true);
    expect(preview.shadowRoot?.querySelector(".file-name")?.textContent).toContain("report.pdf");
    let downloaded = "";
    let closed = false;
    preview.addEventListener("aui-file-download", (event) => {
      downloaded = (event as CustomEvent<{ file: { id: string } }>).detail.file.id;
    });
    preview.addEventListener("aui-file-preview-close", () => {
      closed = true;
    });
    preview.shadowRoot?.querySelector<HTMLButtonElement>(".footer button")?.click();
    preview.shadowRoot?.querySelector<HTMLButtonElement>(".close")?.click();
    await preview.updateComplete;
    expect(downloaded).toBe("report");
    expect(closed).toBe(true);
    expect(preview.open).toBe(false);
  });

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
