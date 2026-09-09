/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { catalog, categoryLabels, type CatalogCategory } from "./catalog";
import {
    components,
    initComponentDemo,
    type ComponentItem,
    type FrameworkType,
} from "./components-data";
import {
    adminThemeLabels,
    adminThemes,
    getAdminTheme,
    setAdminTheme,
    toggleAdminThemeMode,
    type AdminThemeName,
} from "@chaos_team/blbui-core";

// catalog.ts is the single source of truth for the props/events displayed on
// each card; components-data.ts only owns previews and usage snippets.
const catalogById = new Map(catalog.map((entry) => [entry.id, entry]));
const totalComponents = catalog.length;
const categoryCounts = catalog.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
}, {});

type SectionId =
    | "overview"
    | "tokens"
    | "themes"
    | "components"
    | "cat-primitives"
    | "cat-forms"
    | "cat-navigation"
    | "cat-feedback"
    | "cat-overlay"
    | "cat-data"
    | "cat-layout"
    | "cat-business"
    | "frameworks"
    | "accessibility";

type Section = { id: SectionId; label: string; eyebrow: string; category?: CatalogCategory };

const sections: Section[] = [
    { id: "overview", label: "Overview", eyebrow: "START HERE" },
    { id: "tokens", label: "Design Tokens", eyebrow: "FOUNDATION" },
    { id: "themes", label: "Themes (" + adminThemes.length + ")", eyebrow: "FOUNDATION" },
    { id: "components", label: `All Components (${totalComponents})`, eyebrow: "LIBRARY" },
    {
        id: "cat-primitives",
        label: `Primitives (${categoryCounts.primitives ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "primitives",
    },
    {
        id: "cat-forms",
        label: `Form Controls (${categoryCounts.forms ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "forms",
    },
    {
        id: "cat-navigation",
        label: `Navigation (${categoryCounts.navigation ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "navigation",
    },
    {
        id: "cat-feedback",
        label: `Feedback & Status (${categoryCounts.feedback ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "feedback",
    },
    {
        id: "cat-overlay",
        label: `Overlays & Dialogs (${categoryCounts.overlay ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "overlay",
    },
    {
        id: "cat-data",
        label: `Data & Tables (${categoryCounts.data ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "data",
    },
    {
        id: "cat-layout",
        label: `Layout & Surfaces (${categoryCounts.layout ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "layout",
    },
    {
        id: "cat-business",
        label: `Business Suite (${categoryCounts.business ?? 0})`,
        eyebrow: "CATEGORIES",
        category: "business",
    },
    { id: "frameworks", label: "Framework Adapters", eyebrow: "INTEGRATION" },
    { id: "accessibility", label: "Accessibility", eyebrow: "INTEGRATION" },
];

const codeSamples: Record<string, string> = {
    react: `import { AdminButton, AdminPage } from '@chaos_team/blbui-react'\n\n<AdminPage title="Channels">\n  <AdminButton variant="primary">Deploy New</AdminButton>\n</AdminPage>`,
    vue: `<script setup lang="ts">\nimport { AdminButton, AdminPage } from '@chaos_team/blbui-vue'\n</script>\n\n<AdminPage title="Channels">\n  <AdminButton variant="primary">Deploy New</AdminButton>\n</AdminPage>`,
    svelte: `<script lang="ts">\nimport { registerAdminElements } from '@chaos_team/blbui-svelte'\nimport '@chaos_team/blbui-core/styles.css'\n\nregisterAdminElements()\n</script>\n\n<aui-page title="Channels">\n  <aui-button variant="primary">Deploy New</aui-button>\n</aui-page>`,
    web: `import { registerAdminElements } from '@chaos_team/blbui-core/register'\nimport '@chaos_team/blbui-core/styles.css'\n\nregisterAdminElements()\n\n<aui-button variant="primary">Deploy New</aui-button>`,
};

const themeOptions = adminThemes
    .map((theme) => `<option value="${theme}">${adminThemeLabels[theme]}</option>`)
    .join("");

function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let globalFramework: FrameworkType = "wc";

function renderComponentCard(comp: ComponentItem, fw: FrameworkType = globalFramework): string {
    const code = comp.usage[fw] ?? comp.usage.wc;
    const entry = catalogById.get(comp.id);
    const props = entry?.props ?? comp.props;
    const events = entry?.events ?? comp.events;
    return `
    <article class="catalog-card" id="${comp.id}" data-catalog-id="${comp.id}" data-category="${comp.category}" data-search="${`${comp.name} ${comp.tag} ${comp.description} ${comp.category} ${props.join(" ")}`.toLowerCase()}">
      <div class="catalog-card-top">
        <div class="card-tags">
          <span class="component-slug">${comp.tag}</span>
          <span class="component-react-slug">&lt;${comp.name}&gt;</span>
        </div>
        <div class="card-badges">
          <span class="component-cat-badge">${categoryLabels[comp.category].toUpperCase()}</span>
          <span class="catalog-status catalog-status-${comp.status}">${comp.status.toUpperCase()}</span>
        </div>
      </div>
      <h3><a class="card-anchor" href="#${comp.id}" aria-label="Link to ${comp.name}">${comp.name}</a></h3>
      <p>${comp.description}</p>
      
      <div class="playground" data-playground-id="${comp.id}">
        ${comp.previewHtml}
      </div>

      <div class="catalog-api">
        <div class="api-row">
          <span class="api-label">PROPS:</span>
          <code>${props.length ? props.join(" · ") : "SLOT / NATIVE"}</code>
        </div>
        ${
            events.length
                ? `<div class="api-row">
          <span class="api-label">EVENTS:</span>
          <small>${events.join(" · ")}</small>
        </div>`
                : ""
        }
      </div>

      <div class="card-usage-panel">
        <div class="usage-bar">
          <div class="usage-tabs" role="tablist" aria-label="Usage framework">
            <button type="button" role="tab" id="tab-wc-${comp.id}" aria-selected="${fw === "wc"}" aria-controls="code-${comp.id}" class="usage-tab ${fw === "wc" ? "is-active" : ""}" data-card-fw="wc" data-id="${comp.id}">WC</button>
            <button type="button" role="tab" id="tab-react-${comp.id}" aria-selected="${fw === "react"}" aria-controls="code-${comp.id}" class="usage-tab ${fw === "react" ? "is-active" : ""}" data-card-fw="react" data-id="${comp.id}">REACT</button>
            <button type="button" role="tab" id="tab-vue-${comp.id}" aria-selected="${fw === "vue"}" aria-controls="code-${comp.id}" class="usage-tab ${fw === "vue" ? "is-active" : ""}" data-card-fw="vue" data-id="${comp.id}">VUE</button>
            <button type="button" role="tab" id="tab-svelte-${comp.id}" aria-selected="${fw === "svelte"}" aria-controls="code-${comp.id}" class="usage-tab ${fw === "svelte" ? "is-active" : ""}" data-card-fw="svelte" data-id="${comp.id}">SVELTE</button>
          </div>
          <div class="usage-actions">
            <button type="button" class="card-copy-btn" data-id="${comp.id}" title="Copy usage snippet">COPY</button>
            <button type="button" class="card-toggle-btn" data-id="${comp.id}" title="Toggle usage code">HIDE ⌃</button>
          </div>
        </div>
        <pre class="card-code-block" id="code-${comp.id}" role="tabpanel" aria-labelledby="tab-${fw}-${comp.id}" data-code-id="${comp.id}"><code>${escapeHtml(code)}</code></pre>
      </div>
    </article>
  `;
}

function tokenCards(): string {
    const tokens = [
        ["CANVAS", "--aui-bg"],
        ["SURFACE", "--aui-surface"],
        ["HEADER", "--aui-header"],
        ["BORDER", "--aui-border"],
        ["PRIMARY", "--aui-text-primary"],
        ["SUCCESS", "--aui-success"],
        ["DANGER", "--aui-danger"],
        ["INFO", "--aui-info"],
    ];
    return tokens
        .map(
            ([label, variable]) =>
                `<div class="token-card"><span class="swatch" style="background:var(${variable})"></span><div><small>${label}</small><code>${variable}</code><strong data-token-value="${variable}"></strong></div></div>`,
        )
        .join("");
}

function themeCards(): string {
    return adminThemes
        .map(
            (theme) => `
        <article class="theme-card" data-aui-theme="${theme}" data-aui-mode="light">
          <div class="theme-card-heading">
            <div><span class="theme-card-kicker">AUI THEME</span><h3>${adminThemeLabels[theme]}</h3></div>
            <span class="theme-card-name">${theme}</span>
          </div>
          <div class="theme-samples">
            <div class="theme-sample" data-aui-theme="${theme}" data-aui-mode="light">
              <div class="theme-sample-top"><span>LIGHT</span><i></i></div>
              <strong>Operational surface</strong><small>Cards, controls, tables</small>
              <div class="theme-sample-actions"><span></span><span></span><span></span></div>
            </div>
            <div class="theme-sample" data-aui-theme="${theme}" data-aui-mode="dark">
              <div class="theme-sample-top"><span>DARK</span><i></i></div>
              <strong>Operational surface</strong><small>Cards, controls, tables</small>
              <div class="theme-sample-actions"><span></span><span></span><span></span></div>
            </div>
          </div>
        </article>`,
        )
        .join("");
}

const root = document.createElement("div");
root.className = "docs-app aui-root";
setAdminTheme(document, "obsidian", "dark");
root.innerHTML = `
  <aside class="docs-sidebar" id="docs-sidebar">
    <a class="brand" href="#overview" data-nav="overview" aria-label="BLBUI home">
      <span class="brand-mark"><i></i></span>
      <span class="brand-copy"><strong>BLBUI</strong><small>UI LIBRARY / DOCS</small></span>
    </a>
    <div class="sidebar-rule"></div>
    <label class="docs-search"><span aria-hidden="true">⌕</span><input id="docs-search" type="search" placeholder="SEARCH ${totalComponents} COMPONENTS..." aria-label="Search components" /></label>
    <nav class="docs-nav" aria-label="Documentation navigation"></nav>
    <div class="sidebar-footer"><span class="pulse"></span><span>CORE STATUS / STABLE</span><span class="version">v0.0.22</span></div>
  </aside>
  <div class="docs-main">
    <header class="docs-header">
      <div class="header-path"><span>DOCS:</span> BLBUI <b>/</b> COMPONENT SYSTEM</div>
      <div class="header-tools"><label class="theme-control"><span>THEME</span><select id="theme-select" aria-label="Select theme">${themeOptions}</select></label><button type="button" class="mode-toggle" id="mode-toggle" aria-label="Toggle light and dark mode">DAY</button><a href="https://github.com/chao2hang/blbui" target="_blank" rel="noreferrer">GITHUB ↗</a><button type="button" class="header-menu" aria-label="Toggle navigation" aria-expanded="false" aria-controls="docs-sidebar">MENU</button></div>
    </header>
    <main class="docs-content">
      <section class="docs-hero" id="overview">
      <div class="hero-kicker"><span></span> OBSIDIAN INDUSTRIAL CONSOLE / 0.0.22</div>
        <h1>BLBUI<br><em>DOCUMENTATION</em></h1>
        <p class="hero-lede">A sharp, data-first cross-framework component system for enterprise operational consoles. All ${totalComponents} components with interactive previews, live properties, and usage across Web Components, React, Vue, and Svelte.</p>
        <div class="hero-actions"><aui-button variant="primary" id="hero-explore">EXPLORE ${totalComponents} COMPONENTS</aui-button><a class="text-link" href="#frameworks">VIEW FRAMEWORKS <span>→</span></a></div>
        <div class="hero-grid" aria-label="Library facts"><div><small>RENDERER</small><strong>WEB COMPONENTS</strong></div><div><small>ADAPTERS</small><strong>REACT · VUE · SVELTE</strong></div><div><small>DESIGN LANGUAGE</small><strong>OBSIDIAN / INDUSTRIAL</strong></div></div><div class="hero-count"><strong>${components.length}</strong><span>REGISTERED COMPONENTS / 8 CATEGORIES / ZERO RUNTIME OVERHEAD</span></div>
      </section>

      <section class="content-section" id="tokens">
        <div class="section-heading"><span class="section-index">01</span><div><p class="eyebrow">FOUNDATION</p><h2>Design tokens</h2></div></div>
        <div class="token-layout"><div class="token-copy"><p>Every component inherits a compact, semantic token layer. Override variables at your application root to create a controlled variant without forking component CSS.</p><code>:root { --aui-bg: #0a0a0a; --aui-border: #262626; }</code></div><div class="token-grid">${tokenCards()}</div></div>
      </section>

      <section class="content-section themes-section" id="themes">
        <div class="section-heading"><span class="section-index">02</span><div><p class="eyebrow">THEME PRESETS / LIGHT + DARK</p><h2>One component system, nine surfaces.</h2></div></div>
        <p class="section-intro">Every preset maps the same semantic token contract. Switch the application theme at runtime without changing component markup, framework bindings, or interaction behavior.</p>
        <div class="theme-grid">${themeCards()}</div>
        <div class="theme-contract"><div><strong>Theme contract</strong><span>Surfaces · text · status · focus · borders · shadows · radius · overlays</span></div><code>setAdminTheme(root, "enterprise", "light")</code></div>
      </section>

      <section class="content-section" id="components">
        <div class="section-heading"><span class="section-index">03</span><div><p class="eyebrow">LIBRARY INDEX &amp; PLAYGROUND</p><h2>All ${totalComponents} components &amp; usage</h2></div></div>
        <p class="section-intro catalog-intro">Every custom element is rendered live with interactive controls, schema props, and instant code snippets for Web Components, React, Vue and Svelte.</p>
        
        <div class="catalog-toolbar">
          <div class="catalog-total"><strong id="catalog-visible-count">${components.length}</strong><span>VISIBLE / ${components.length} TOTAL</span></div>
          <div class="category-filters" role="group" aria-label="Filter component category">
            <button type="button" class="category-filter is-active" data-category="all">ALL (${totalComponents})</button>
            ${(
                [
                    "primitives",
                    "forms",
                    "navigation",
                    "feedback",
                    "overlay",
                    "data",
                    "layout",
                    "business",
                ] as CatalogCategory[]
            )
                .map(
                    (category) =>
                        `<button type="button" class="category-filter" data-category="${category}">${category.toUpperCase()} (${categoryCounts[category] ?? 0})</button>`,
                )
                .join("")}
          </div>
        </div>

        <div class="global-fw-bar">
          <span class="global-fw-label">USAGE CODE FRAMEWORK:</span>
          <div class="global-fw-actions">
            <button type="button" class="global-fw-btn is-active" data-global-fw="wc">WEB COMPONENTS</button>
            <button type="button" class="global-fw-btn" data-global-fw="react">REACT</button>
            <button type="button" class="global-fw-btn" data-global-fw="vue">VUE</button>
            <button type="button" class="global-fw-btn" data-global-fw="svelte">SVELTE</button>
            <button type="button" class="global-toggle-all-btn" id="global-toggle-usage">TOGGLE ALL USAGE</button>
          </div>
        </div>

        <div class="catalog-grid" id="catalog-grid">
          ${components.map((c) => renderComponentCard(c, globalFramework)).join("")}
        </div>
        <p class="catalog-empty" id="catalog-empty" role="status" hidden>NO COMPONENTS MATCH THIS FILTER.</p>
      </section>

      <section class="content-section framework-section" id="frameworks">
        <div class="section-heading"><span class="section-index">04</span><div><p class="eyebrow">INTEGRATION</p><h2>One system. Your stack.</h2></div></div>
        <p class="section-intro">The core owns behavior and visual language. Thin adapters make the same components feel native in every supported framework.</p>
        <div class="framework-tabs" role="tablist" aria-label="Framework examples">${["react", "vue", "svelte", "web"].map((framework, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-framework="${framework}">${framework === "web" ? "WEB COMPONENTS" : framework.toUpperCase()}</button>`).join("")}</div>
        <pre class="framework-code" aria-live="polite"></pre>
        <div class="install-row"><span>INSTALL</span><code>bun add @chaos_team/blbui-react @chaos_team/blbui-core</code><button type="button" class="copy-install">COPY</button></div>
      </section>

      <section class="content-section accessibility-section" id="accessibility">
        <div class="section-heading"><span class="section-index">05</span><div><p class="eyebrow">QUALITY BAR</p><h2>Accessible by default</h2></div></div>
        <div class="a11y-list">
          <div><strong>01</strong><span>Native elements first</span><p>Buttons, inputs, select, table and dialog preserve browser semantics.</p></div>
          <div><strong>02</strong><span>State has meaning</span><p>Active, selected, disabled, loading and error states expose ARIA semantics.</p></div>
          <div><strong>03</strong><span>Motion is optional</span><p>Transitions and shimmer respect <code>prefers-reduced-motion</code>.</p></div>
        </div>
      </section>
    </main>
    <footer class="docs-footer"><span>BLBUI / DOCUMENTATION</span><span>BUILT FOR OPERATORS, NOT DECORATION.</span></footer>
  </div>
`;

const themeSelect = root.querySelector<HTMLSelectElement>("#theme-select");
const modeToggle = root.querySelector<HTMLButtonElement>("#mode-toggle");
function syncThemeControls(): void {
    const current = getAdminTheme(document);
    if (themeSelect) themeSelect.value = current.theme;
    if (modeToggle) modeToggle.textContent = current.mode === "light" ? "NIGHT" : "DAY";
    root.querySelectorAll<HTMLElement>("[data-token-value]").forEach((item) => {
        const variable = item.dataset.tokenValue;
        if (variable)
            item.textContent = getComputedStyle(document.documentElement)
                .getPropertyValue(variable)
                .trim();
    });
}
themeSelect?.addEventListener("change", () => {
    const theme = themeSelect.value as AdminThemeName;
    setAdminTheme(document, theme, getAdminTheme(document).mode);
    syncThemeControls();
});
modeToggle?.addEventListener("click", () => {
    toggleAdminThemeMode(document);
    syncThemeControls();
});
syncThemeControls();

// Build sidebar navigation
const nav = root.querySelector(".docs-nav") as HTMLElement;
let previousEyebrow = "";
for (const section of sections) {
    if (section.eyebrow !== previousEyebrow) {
        const label = document.createElement("p");
        label.className = "nav-eyebrow";
        label.textContent = section.eyebrow;
        nav.append(label);
        previousEyebrow = section.eyebrow;
    }
    const link = document.createElement("a");
    link.href = section.category ? "#components" : `#${section.id}`;
    link.dataset.nav = section.id;
    if (section.category) link.dataset.targetCategory = section.category;
    link.textContent = section.label;
    nav.append(link);
}

function setActiveNav(id: SectionId): void {
    root.querySelectorAll<HTMLElement>("[data-nav]").forEach((item) =>
        item.setAttribute("aria-current", item.dataset.nav === id ? "page" : "false"),
    );
}

function updateFrameworkCode(framework: string): void {
    const code = root.querySelector<HTMLElement>(".framework-code");
    if (code) code.textContent = codeSamples[framework] ?? codeSamples.web;
}

// Wire up filtering
const catalogCount = root.querySelector<HTMLElement>("#catalog-visible-count");
let selectedCategory: string = "all";

function filterCatalog(): void {
    const query = (root.querySelector<HTMLInputElement>("#docs-search")?.value ?? "")
        .trim()
        .toLowerCase();
    let visible = 0;
    root.querySelectorAll<HTMLElement>(".catalog-card").forEach((card) => {
        const matchesCategory =
            selectedCategory === "all" || card.dataset.category === selectedCategory;
        const matchesQuery = !query || (card.dataset.search ?? "").includes(query);
        const show = matchesCategory && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
    });
    if (catalogCount) catalogCount.textContent = String(visible);
    root.querySelector<HTMLElement>("#catalog-empty")?.toggleAttribute("hidden", visible > 0);
}

root.querySelector("#docs-search")?.addEventListener("input", filterCatalog);

function applyCategoryFilter(cat: string): void {
    selectedCategory = cat;
    root.querySelectorAll<HTMLButtonElement>(".category-filter").forEach((item) => {
        item.classList.toggle("is-active", (item.dataset.category ?? "all") === cat);
    });
    filterCatalog();
}

root.querySelectorAll<HTMLButtonElement>(".category-filter").forEach((button) =>
    button.addEventListener("click", () => {
        applyCategoryFilter(button.dataset.category ?? "all");
    }),
);

// Sidebar category clicks
root.querySelectorAll<HTMLAnchorElement>("[data-target-category]").forEach((link) => {
    link.addEventListener("click", () => {
        const cat = link.dataset.targetCategory;
        if (cat) {
            applyCategoryFilter(cat);
            document.querySelector("#components")?.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Update card code
function updateCardCode(cardId: string, fw: FrameworkType): void {
    const comp = components.find((c) => c.id === cardId);
    if (!comp) return;
    const pre = root.querySelector<HTMLElement>(`pre[data-code-id="${cardId}"]`);
    if (pre) {
        const codeEl = pre.querySelector("code");
        const code = comp.usage[fw] ?? comp.usage.wc;
        if (codeEl) codeEl.textContent = code;
    }
}

// Card tabs
root.querySelectorAll<HTMLButtonElement>(".usage-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
        const cardId = btn.dataset.id;
        const fw = (btn.dataset.cardFw ?? "wc") as FrameworkType;
        if (!cardId) return;

        const parentBar = btn.closest(".usage-bar");
        parentBar?.querySelectorAll<HTMLButtonElement>(".usage-tab").forEach((t) => {
            const active = t === btn;
            t.classList.toggle("is-active", active);
            t.setAttribute("aria-selected", active ? "true" : "false");
        });

        root.querySelector<HTMLElement>(`#code-${cardId}`)?.setAttribute(
            "aria-labelledby",
            `tab-${fw}-${cardId}`,
        );

        updateCardCode(cardId, fw);
    });
});

// Card copy button
root.querySelectorAll<HTMLButtonElement>(".card-copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const cardId = btn.dataset.id;
        if (!cardId) return;
        const pre = root.querySelector<HTMLElement>(`pre[data-code-id="${cardId}"]`);
        const code = pre?.querySelector("code")?.textContent ?? "";
        await navigator.clipboard?.writeText(code);
        const original = btn.textContent;
        btn.textContent = "COPIED!";
        window.setTimeout(() => {
            btn.textContent = original ?? "COPY";
        }, 1200);
    });
});

// Card toggle button
root.querySelectorAll<HTMLButtonElement>(".card-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const cardId = btn.dataset.id;
        if (!cardId) return;
        const pre = root.querySelector<HTMLElement>(`pre[data-code-id="${cardId}"]`);
        if (!pre) return;
        const isHidden = pre.hidden;
        pre.hidden = !isHidden;
        btn.textContent = isHidden ? "HIDE ⌃" : "SHOW ⌄";
    });
});

// Global framework switcher
root.querySelectorAll<HTMLButtonElement>(".global-fw-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const fw = (btn.dataset.globalFw ?? "wc") as FrameworkType;
        globalFramework = fw;

        root.querySelectorAll(".global-fw-btn").forEach((b) =>
            b.classList.toggle("is-active", b === btn),
        );

        components.forEach((c) => {
            updateCardCode(c.id, fw);
            const card = root.querySelector(`[data-catalog-id="${c.id}"]`);
            card?.querySelectorAll<HTMLButtonElement>(".usage-tab").forEach((t) => {
                const active = t.dataset.cardFw === fw;
                t.classList.toggle("is-active", active);
                t.setAttribute("aria-selected", active ? "true" : "false");
            });
            card?.querySelector<HTMLElement>(".card-code-block")?.setAttribute(
                "aria-labelledby",
                `tab-${fw}-${c.id}`,
            );
        });
    });
});

// Global toggle all usage
let allExpanded = true;
root.querySelector("#global-toggle-usage")?.addEventListener("click", () => {
    allExpanded = !allExpanded;
    root.querySelectorAll<HTMLElement>(".card-code-block").forEach((pre) => {
        pre.hidden = !allExpanded;
    });
    root.querySelectorAll<HTMLButtonElement>(".card-toggle-btn").forEach((btn) => {
        btn.textContent = allExpanded ? "HIDE ⌃" : "SHOW ⌄";
    });
    const btn = root.querySelector<HTMLButtonElement>("#global-toggle-usage");
    if (btn) btn.textContent = allExpanded ? "COLLAPSE ALL USAGE" : "EXPAND ALL USAGE";
});

// Hero explore button
root.querySelector("#hero-explore")?.addEventListener("click", () => {
    document.querySelector("#components")?.scrollIntoView({ behavior: "smooth" });
});

// Header menu toggle
const menuButton = root.querySelector<HTMLButtonElement>(".header-menu");
const sidebar = root.querySelector<HTMLElement>(".docs-sidebar");
function setSidebarOpen(open: boolean): void {
    sidebar?.classList.toggle("is-open", open);
    menuButton?.setAttribute("aria-expanded", open ? "true" : "false");
}
menuButton?.addEventListener("click", () => {
    const open = !sidebar?.classList.contains("is-open");
    setSidebarOpen(open);
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar?.classList.contains("is-open")) {
        setSidebarOpen(false);
        menuButton?.focus();
    }
});

// Framework tabs in section 03
root.querySelectorAll<HTMLButtonElement>("[data-framework]").forEach((button) =>
    button.addEventListener("click", () => {
        root.querySelectorAll("[data-framework]").forEach((item) =>
            item.setAttribute("aria-selected", item === button ? "true" : "false"),
        );
        updateFrameworkCode(button.dataset.framework ?? "web");
    }),
);
updateFrameworkCode("react");

// Install snippet copy
root.querySelector(".copy-install")?.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    await navigator.clipboard?.writeText("bun add @chaos_team/blbui-react @chaos_team/blbui-core");
    button.textContent = "COPIED";
    window.setTimeout(() => {
        button.textContent = "COPY";
    }, 1200);
});

// Intersection observer for sidebar navigation
const observer = new IntersectionObserver(
    (entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveNav(visible.target.id as SectionId);
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.2, 0.8] },
);
root.querySelectorAll<HTMLElement>(".docs-content > section").forEach((section) =>
    observer.observe(section),
);

// Initialize rich data for custom elements
initComponentDemo(root);

export function mountDocsApp(container: HTMLElement): void {
    container.replaceChildren(root);
}
