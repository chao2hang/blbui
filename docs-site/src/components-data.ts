/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import type { CatalogCategory } from "./catalog";

export type FrameworkType = "wc" | "react" | "vue" | "svelte";

export interface ComponentUsage {
    wc: string;
    react: string;
    vue: string;
    svelte: string;
}

export interface ComponentItem {
    id: string;
    tag: string;
    name: string;
    category: CatalogCategory;
    description: string;
    status: "stable" | "beta";
    props: string[];
    events: string[];
    previewHtml: string;
    initKey?: string;
    usage: ComponentUsage;
}

export const components: ComponentItem[] = [
    // -------------------------------------------------------------
    // PRIMITIVES (9)
    // -------------------------------------------------------------
    {
        id: "button",
        tag: "aui-button",
        name: "Button",
        category: "primitives",
        description: "Primary, secondary and destructive actions with loading and disabled states.",
        status: "stable",
        props: ["variant", "size", "loading", "disabled", "type"],
        events: ["click"],
        previewHtml: `<div class="demo-row"><aui-button variant="primary">PRIMARY</aui-button><aui-button variant="secondary">SECONDARY</aui-button><aui-button variant="danger">DANGER</aui-button><aui-button size="compact" variant="primary" loading>LOADING</aui-button><aui-button size="compact" disabled>DISABLED</aui-button></div>`,
        usage: {
            wc: `<aui-button variant="primary">Deploy New</aui-button>\n<aui-button variant="secondary">Filter</aui-button>\n<aui-button variant="danger">Delete</aui-button>`,
            react: `import { AdminButton } from '@chaos_team/blbui-react'\n\n<AdminButton variant="primary" onClick={() => console.log('clicked')}>\n  Deploy New\n</AdminButton>`,
            vue: `<script setup lang="ts">\nimport { AdminButton } from '@chaos_team/blbui-vue'\n</script>\n\n<template>\n  <AdminButton variant="primary" @click="handleClick">\n    Deploy New\n  </AdminButton>\n</template>`,
            svelte: `<script lang="ts">\nimport { registerAdminElements } from '@chaos_team/blbui-svelte'\nregisterAdminElements()\n</script>\n\n<aui-button variant="primary" on:click={handleClick}>\n  Deploy New\n</aui-button>`,
        },
    },
    {
        id: "icon-button",
        tag: "aui-icon-button",
        name: "Icon Button",
        category: "primitives",
        description: "Compact row actions with an accessible label and danger treatment.",
        status: "stable",
        props: ["label", "icon", "variant", "size", "disabled"],
        events: ["click"],
        previewHtml: `<div class="demo-row"><aui-icon-button icon="⟳" label="Refresh data"></aui-icon-button><aui-icon-button icon="⚙" label="Settings" variant="secondary"></aui-icon-button><aui-icon-button icon="✕" label="Delete" variant="danger"></aui-icon-button></div>`,
        usage: {
            wc: `<aui-icon-button icon="⚙" label="Settings" variant="secondary"></aui-icon-button>`,
            react: `import { AdminIconButton } from '@chaos_team/blbui-react'\n\n<AdminIconButton icon="⚙" label="Settings" variant="secondary" />`,
            vue: `<script setup lang="ts">\nimport { AdminIconButton } from '@chaos_team/blbui-vue'\n</script>\n\n<template>\n  <AdminIconButton icon="⚙" label="Settings" variant="secondary" />\n</template>`,
            svelte: `<aui-icon-button icon="⚙" label="Settings" variant="secondary"></aui-icon-button>`,
        },
    },
    {
        id: "badge",
        tag: "aui-badge",
        name: "Badge",
        category: "primitives",
        description: "Compact semantic labels for categories, counters and operational state.",
        status: "stable",
        props: ["variant", "dot"],
        events: [],
        previewHtml: `<div class="demo-row"><aui-badge variant="primary" dot>PROD</aui-badge><aui-badge variant="success" dot>HEALTHY</aui-badge><aui-badge variant="warning">DEGRADED</aui-badge><aui-badge variant="danger">DOWN</aui-badge></div>`,
        usage: {
            wc: `<aui-badge variant="success" dot>HEALTHY</aui-badge>`,
            react: `import { AdminBadge } from '@chaos_team/blbui-react'\n\n<AdminBadge variant="success" dot>HEALTHY</AdminBadge>`,
            vue: `<AdminBadge variant="success" :dot="true">HEALTHY</AdminBadge>`,
            svelte: `<aui-badge variant="success" dot>HEALTHY</aui-badge>`,
        },
    },
    {
        id: "status-tag",
        tag: "aui-status-tag",
        name: "Status Tag",
        category: "primitives",
        description: "Monospace status indicator for success, error, warning and neutral state.",
        status: "stable",
        props: ["status"],
        events: [],
        previewHtml: `<div class="demo-row demo-statuses"><aui-status-tag status="success">ONLINE</aui-status-tag><aui-status-tag status="warning">REVIEW</aui-status-tag><aui-status-tag status="danger">FAILED</aui-status-tag><aui-status-tag status="info">STANDBY</aui-status-tag></div>`,
        usage: {
            wc: `<aui-status-tag status="success">ONLINE</aui-status-tag>`,
            react: `import { AdminStatusTag } from '@chaos_team/blbui-react'\n\n<AdminStatusTag status="success">ONLINE</AdminStatusTag>`,
            vue: `<AdminStatusTag status="success">ONLINE</AdminStatusTag>`,
            svelte: `<aui-status-tag status="success">ONLINE</aui-status-tag>`,
        },
    },
    {
        id: "avatar",
        tag: "aui-avatar",
        name: "Avatar",
        category: "primitives",
        description: "User or entity symbol with initials fallback and multiple scale tiers.",
        status: "stable",
        props: ["src", "alt", "initials", "size"],
        events: [],
        previewHtml: `<div class="demo-row"><aui-avatar initials="CH" size="sm"></aui-avatar><aui-avatar initials="OP" size="md"></aui-avatar><aui-avatar initials="BL" size="lg"></aui-avatar></div>`,
        usage: {
            wc: `<aui-avatar initials="CH" size="md"></aui-avatar>`,
            react: `import { AdminAvatar } from '@chaos_team/blbui-react'\n\n<AdminAvatar initials="CH" size="md" />`,
            vue: `<AdminAvatar initials="CH" size="md" />`,
            svelte: `<aui-avatar initials="CH" size="md"></aui-avatar>`,
        },
    },
    {
        id: "progress",
        tag: "aui-progress",
        name: "Progress",
        category: "primitives",
        description: "Linear completion meter with accessible attributes and label track.",
        status: "stable",
        props: ["value", "max", "label", "show-value"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:280px;"><aui-progress value="72" max="100" label="BUFFER USAGE" show-value></aui-progress></div>`,
        usage: {
            wc: `<aui-progress value="72" max="100" label="BUFFER USAGE" show-value></aui-progress>`,
            react: `import { AdminProgress } from '@chaos_team/blbui-react'\n\n<AdminProgress value={72} max={100} label="BUFFER USAGE" showValue />`,
            vue: `<AdminProgress :value="72" :max="100" label="BUFFER USAGE" show-value />`,
            svelte: `<aui-progress value={72} max={100} label="BUFFER USAGE" show-value></aui-progress>`,
        },
    },
    {
        id: "rating",
        tag: "aui-rating",
        name: "Rating",
        category: "primitives",
        description: "Key-navigable star rank with readonly mode for reviews and scores.",
        status: "stable",
        props: ["value", "max", "readonly"],
        events: ["aui-change"],
        previewHtml: `<aui-rating value="4" max="5"></aui-rating>`,
        usage: {
            wc: `<aui-rating value="4" max="5"></aui-rating>`,
            react: `import { AdminRating } from '@chaos_team/blbui-react'\n\n<AdminRating value={4} max={5} onChange={(val) => console.log(val)} />`,
            vue: `<AdminRating :value="4" :max="5" @value-change="val => rating = val" />`,
            svelte: `<aui-rating value={4} max={5} on:aui-rating-change={e => console.log(e.detail.value)}></aui-rating>`,
        },
    },
    {
        id: "kbd",
        tag: "aui-kbd",
        name: "Keyboard Key",
        category: "primitives",
        description: "Monospace keystroke cap for shortcut legends and command cheatsheets.",
        status: "stable",
        props: [],
        events: [],
        previewHtml: `<span>Press <aui-kbd>⌘</aui-kbd> + <aui-kbd>K</aui-kbd> for quick command palette</span>`,
        usage: {
            wc: `<aui-kbd>⌘</aui-kbd> + <aui-kbd>K</aui-kbd>`,
            react: `import { AdminKbd } from '@chaos_team/blbui-react'\n\n<AdminKbd>⌘</AdminKbd> + <AdminKbd>K</AdminKbd>`,
            vue: `<AdminKbd>⌘</AdminKbd> + <AdminKbd>K</AdminKbd>`,
            svelte: `<aui-kbd>⌘</aui-kbd> + <aui-kbd>K</aui-kbd>`,
        },
    },
    {
        id: "color-tag",
        tag: "aui-color-tag",
        name: "Color Tag",
        category: "primitives",
        description: "Swatch dot + monospace label for server pools and cluster regions.",
        status: "stable",
        props: ["color", "label"],
        events: [],
        previewHtml: `<div class="demo-row"><aui-color-tag color="#10b981" label="US-EAST-1"></aui-color-tag><aui-color-tag color="#60a5fa" label="EU-CENTRAL-1"></aui-color-tag><aui-color-tag color="#f59e0b" label="AP-SOUTH-1"></aui-color-tag></div>`,
        usage: {
            wc: `<aui-color-tag color="#10b981" label="US-EAST-1"></aui-color-tag>`,
            react: `import { AdminColorTag } from '@chaos_team/blbui-react'\n\n<AdminColorTag color="#10b981" label="US-EAST-1" />`,
            vue: `<AdminColorTag color="#10b981" label="US-EAST-1" />`,
            svelte: `<aui-color-tag color="#10b981" label="US-EAST-1"></aui-color-tag>`,
        },
    },

    // -------------------------------------------------------------
    // FORMS (17)
    // -------------------------------------------------------------
    {
        id: "number-input",
        tag: "aui-number-input",
        name: "Number Input",
        category: "forms",
        description: "Step-incrementable numeric field with hard bounds and stepper triggers.",
        status: "stable",
        props: ["value", "min", "max", "step"],
        events: ["aui-change"],
        previewHtml: `<div style="width:160px;"><aui-number-input value="42" min="0" max="100" step="1"></aui-number-input></div>`,
        usage: {
            wc: `<aui-number-input value="42" min="0" max="100" step="1"></aui-number-input>`,
            react: `import { AdminNumberInput } from '@chaos_team/blbui-react'\n\n<AdminNumberInput value={42} min={0} max={100} onChange={setVal} />`,
            vue: `<AdminNumberInput :value="42" :min="0" :max="100" @value-change="val => count = val" />`,
            svelte: `<aui-number-input value={42} min={0} max={100} on:aui-change={e => count = e.detail.value}></aui-number-input>`,
        },
    },
    {
        id: "input",
        tag: "aui-input",
        name: "Input",
        category: "forms",
        description: "Zero-radius terminal input with sharp 1px border and focus ring.",
        status: "stable",
        props: ["value", "type", "name", "placeholder", "invalid", "disabled"],
        events: ["aui-input", "aui-change"],
        previewHtml: `<div style="width:100%;max-width:280px;"><aui-input placeholder="Enter endpoint address..." value="https://api.openai.com/v1"></aui-input></div>`,
        usage: {
            wc: `<aui-input placeholder="Search channels..." value="openai-prod"></aui-input>`,
            react: `import { AdminInput } from '@chaos_team/blbui-react'\n\n<AdminInput placeholder="Search channels..." onValueChange={setQuery} />`,
            vue: `<AdminInput placeholder="Search channels..." v-model:value="query" />`,
            svelte: `<aui-input placeholder="Search channels..." on:aui-input={e => query = e.detail.value}></aui-input>`,
        },
    },
    {
        id: "textarea",
        tag: "aui-textarea",
        name: "Textarea",
        category: "forms",
        description: "Monospace multiline text editor with configurable rows and invalid state.",
        status: "stable",
        props: ["value", "rows", "placeholder", "invalid", "disabled"],
        events: ["aui-input", "aui-change"],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-textarea placeholder="System prompt instructions..." rows="2" value="Route primary traffic to us-east; failover to eu-west on 5xx."></aui-textarea></div>`,
        usage: {
            wc: `<aui-textarea rows="3" placeholder="Routing rules..."></aui-textarea>`,
            react: `import { AdminTextarea } from '@chaos_team/blbui-react'\n\n<AdminTextarea rows={3} placeholder="Routing rules..." onValueChange={setRules} />`,
            vue: `<AdminTextarea :rows="3" placeholder="Routing rules..." v-model:value="rules" />`,
            svelte: `<aui-textarea rows="3" placeholder="Routing rules..."></aui-textarea>`,
        },
    },
    {
        id: "select",
        tag: "aui-select",
        name: "Select",
        category: "forms",
        description: "Single-choice picker with native select semantics and industrial arrow mark.",
        status: "stable",
        props: ["value", "options", "disabled", "invalid"],
        events: ["aui-change"],
        initKey: "select",
        previewHtml: `<div style="width:100%;max-width:240px;"><aui-select id="preview-select"></aui-select></div>`,
        usage: {
            wc: `<aui-select id="provider-select"></aui-select>\n<script>\ndocument.querySelector('#provider-select').options = [\n  { value: 'openai', label: 'OpenAI' },\n  { value: 'anthropic', label: 'Anthropic' }\n];\n</script>`,
            react: `import { AdminSelect } from '@chaos_team/blbui-react'\n\n<AdminSelect\n  options={[\n    { value: 'openai', label: 'OpenAI' },\n    { value: 'anthropic', label: 'Anthropic' }\n  ]}\n  value="openai"\n  onValueChange={setProvider}\n/>`,
            vue: `<AdminSelect :options="providerOptions" v-model:value="provider" />`,
            svelte: `<aui-select bind:value={provider}></aui-select>`,
        },
    },
    {
        id: "combobox",
        tag: "aui-combobox",
        name: "Combobox",
        category: "forms",
        description: "Searchable dropdown with filtering, keyboard traversal and clear selection.",
        status: "stable",
        props: ["options", "value", "placeholder", "open"],
        events: ["aui-change"],
        initKey: "combobox",
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-combobox id="preview-combobox" placeholder="SEARCH PROVIDER"></aui-combobox></div>`,
        usage: {
            wc: `<aui-combobox id="my-combo" placeholder="Search provider..."></aui-combobox>`,
            react: `import { AdminCombobox } from '@chaos_team/blbui-react'\n\n<AdminCombobox\n  options={providerOptions}\n  placeholder="Search provider..."\n  onChange={handleSelect}\n/>`,
            vue: `<AdminCombobox :options="providerOptions" placeholder="Search provider..." />`,
            svelte: `<aui-combobox placeholder="Search provider..."></aui-combobox>`,
        },
    },
    {
        id: "multi-select",
        tag: "aui-multi-select",
        name: "Multi Select",
        category: "forms",
        description: "Tag-based multiple choice selector with inline tokens and dismiss action.",
        status: "stable",
        props: ["options", "values", "placeholder"],
        events: ["aui-change"],
        initKey: "multi-select",
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-multi-select id="preview-multi-select" placeholder="Select roles..."></aui-multi-select></div>`,
        usage: {
            wc: `<aui-multi-select id="roles-select" placeholder="Select roles..."></aui-multi-select>`,
            react: `import { AdminMultiSelect } from '@chaos_team/blbui-react'\n\n<AdminMultiSelect\n  options={roleOptions}\n  values={['admin', 'viewer']}\n  onChange={setRoles}\n/>`,
            vue: `<AdminMultiSelect :options="roleOptions" :values="selectedRoles" />`,
            svelte: `<aui-multi-select placeholder="Select roles..."></aui-multi-select>`,
        },
    },
    {
        id: "password-input",
        tag: "aui-password-input",
        name: "Password Input",
        category: "forms",
        description: "Secret input field with integrated show/hide toggle button.",
        status: "stable",
        props: ["value", "placeholder", "reveal-label"],
        events: ["aui-input", "aui-change"],
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-password-input placeholder="Enter secret key..." value="sk-secret-token-9912"></aui-password-input></div>`,
        usage: {
            wc: `<aui-password-input placeholder="API Secret Key"></aui-password-input>`,
            react: `import { AdminPasswordInput } from '@chaos_team/blbui-react'\n\n<AdminPasswordInput placeholder="API Secret Key" onChange={setSecret} />`,
            vue: `<AdminPasswordInput placeholder="API Secret Key" v-model:value="secret" />`,
            svelte: `<aui-password-input placeholder="API Secret Key"></aui-password-input>`,
        },
    },
    {
        id: "checkbox",
        tag: "aui-checkbox",
        name: "Checkbox",
        category: "forms",
        description: "Binary state toggle with monospace label and sharp square box.",
        status: "stable",
        props: ["checked", "disabled", "label"],
        events: ["aui-change"],
        previewHtml: `<div class="demo-row"><aui-checkbox label="Enable routing" checked></aui-checkbox><aui-checkbox label="Strict TLS verification"></aui-checkbox></div>`,
        usage: {
            wc: `<aui-checkbox label="Enable routing" checked></aui-checkbox>`,
            react: `import { AdminCheckbox } from '@chaos_team/blbui-react'\n\n<AdminCheckbox label="Enable routing" checked={enabled} onCheckedChange={setEnabled} />`,
            vue: `<AdminCheckbox label="Enable routing" v-model:checked="enabled" />`,
            svelte: `<aui-checkbox label="Enable routing" checked></aui-checkbox>`,
        },
    },
    {
        id: "switch",
        tag: "aui-switch",
        name: "Switch",
        category: "forms",
        description: "High-contrast slider switch for immediate operational mode triggers.",
        status: "stable",
        props: ["checked", "disabled", "label"],
        events: ["aui-change"],
        previewHtml: `<div class="demo-row"><aui-switch label="Debug Stream" checked></aui-switch><aui-switch label="Failover Fallback"></aui-switch></div>`,
        usage: {
            wc: `<aui-switch label="Debug Stream" checked></aui-switch>`,
            react: `import { AdminSwitch } from '@chaos_team/blbui-react'\n\n<AdminSwitch label="Debug Stream" checked={debug} onCheckedChange={setDebug} />`,
            vue: `<AdminSwitch label="Debug Stream" v-model:checked="debug" />`,
            svelte: `<aui-switch label="Debug Stream" checked></aui-switch>`,
        },
    },
    {
        id: "radio-group",
        tag: "aui-radio-group",
        name: "Radio Group",
        category: "forms",
        description: "Mutually exclusive options with horizontal or vertical layout.",
        status: "stable",
        props: ["options", "value", "orientation"],
        events: ["aui-change"],
        initKey: "radio-group",
        previewHtml: `<aui-radio-group id="preview-radio" value="round-robin"></aui-radio-group>`,
        usage: {
            wc: `<aui-radio-group id="strategy-radio" value="round-robin"></aui-radio-group>`,
            react: `import { AdminRadioGroup } from '@chaos_team/blbui-react'\n\n<AdminRadioGroup\n  options={[\n    { value: 'round-robin', label: 'Round Robin' },\n    { value: 'weighted', label: 'Weighted' }\n  ]}\n  value="round-robin"\n  onChange={setStrategy}\n/>`,
            vue: `<AdminRadioGroup :options="strategyOptions" v-model:value="strategy" />`,
            svelte: `<aui-radio-group value="round-robin"></aui-radio-group>`,
        },
    },
    {
        id: "slider",
        tag: "aui-slider",
        name: "Slider",
        category: "forms",
        description: "Granular scalar adjustment track with numeric readout and fill progress.",
        status: "stable",
        props: ["value", "min", "max", "step"],
        events: ["aui-change"],
        previewHtml: `<div style="width:100%;max-width:240px;"><aui-slider value="65" min="0" max="100"></aui-slider></div>`,
        usage: {
            wc: `<aui-slider value="65" min="0" max="100"></aui-slider>`,
            react: `import { AdminSlider } from '@chaos_team/blbui-react'\n\n<AdminSlider value={65} min={0} max={100} onChange={setThreshold} />`,
            vue: `<AdminSlider :value="threshold" :min="0" :max="100" @value-change="val => threshold = val" />`,
            svelte: `<aui-slider value={65} min={0} max={100}></aui-slider>`,
        },
    },
    {
        id: "tag-input",
        tag: "aui-tag-input",
        name: "Tag Input",
        category: "forms",
        description: "Freeform chip editor for metadata labels, groups and route tags.",
        status: "stable",
        props: ["values", "placeholder"],
        events: ["aui-change"],
        initKey: "tag-input",
        previewHtml: `<div style="width:100%;max-width:280px;"><aui-tag-input id="preview-tag-input" placeholder="ADD TAG"></aui-tag-input></div>`,
        usage: {
            wc: `<aui-tag-input id="tags" placeholder="Add tag..."></aui-tag-input>`,
            react: `import { AdminTagInput } from '@chaos_team/blbui-react'\n\n<AdminTagInput values={['production', 'eu-west']} onChange={setTags} />`,
            vue: `<AdminTagInput :values="tags" @values-change="val => tags = val" />`,
            svelte: `<aui-tag-input placeholder="Add tag..."></aui-tag-input>`,
        },
    },
    {
        id: "input-group",
        tag: "aui-input-group",
        name: "Input Group",
        category: "forms",
        description: "Attached prefix/suffix container for unified protocol and unit entries.",
        status: "stable",
        props: [],
        events: [],
        previewHtml: `<div style="width:100%;max-width:280px;"><aui-input-group><span slot="prefix">https://</span><aui-input placeholder="api.service.io"></aui-input></aui-input-group></div>`,
        usage: {
            wc: `<aui-input-group>\n  <span slot="prefix">https://</span>\n  <aui-input placeholder="gateway.internal"></aui-input>\n</aui-input-group>`,
            react: `import { AdminInputGroup, AdminInput } from '@chaos_team/blbui-react'\n\n<AdminInputGroup>\n  <span>https://</span>\n  <AdminInput placeholder="gateway.internal" />\n</AdminInputGroup>`,
            vue: `<AdminInputGroup>\n  <span>https://</span>\n  <AdminInput placeholder="gateway.internal" />\n</AdminInputGroup>`,
            svelte: `<aui-input-group>\n  <span>https://</span>\n  <aui-input placeholder="gateway.internal"></aui-input>\n</aui-input-group>`,
        },
    },
    {
        id: "field",
        tag: "aui-field",
        name: "Field",
        category: "forms",
        description:
            "Accessible form field shell with label, help description and validation error.",
        status: "stable",
        props: ["label", "description", "error", "required"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-field label="Channel Key" description="Authorization token for upstream" required><aui-input placeholder="sk-ant-..."></aui-input></aui-field></div>`,
        usage: {
            wc: `<aui-field label="API Token" description="Required for authorization" required>\n  <aui-input placeholder="sk-..."></aui-input>\n</aui-field>`,
            react: `import { AdminField, AdminInput } from '@chaos_team/blbui-react'\n\n<AdminField label="API Token" description="Required for authorization" required>\n  <AdminInput placeholder="sk-..." />\n</AdminField>`,
            vue: `<AdminField label="API Token" description="Required for authorization" :required="true">\n  <AdminInput placeholder="sk-..." />\n</AdminField>`,
            svelte: `<aui-field label="API Token" description="Required for authorization" required>\n  <aui-input placeholder="sk-..."></aui-input>\n</aui-field>`,
        },
    },
    {
        id: "file-upload",
        tag: "aui-file-upload",
        name: "File Upload",
        category: "forms",
        description: "Dashed dropzone for certificate, schema and config file attachments.",
        status: "stable",
        props: ["accept", "multiple", "label", "hint"],
        events: ["aui-change"],
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-file-upload label="Drop certificate file" hint="PEM, CRT or JSON up to 10MB"></aui-file-upload></div>`,
        usage: {
            wc: `<aui-file-upload accept=".pem,.json" label="Drop certificate" hint="Max 10MB"></aui-file-upload>`,
            react: `import { AdminFileUpload } from '@chaos_team/blbui-react'\n\n<AdminFileUpload accept=".pem,.json" label="Drop certificate" onFilesChange={handleFiles} />`,
            vue: `<AdminFileUpload accept=".pem,.json" label="Drop certificate" />`,
            svelte: `<aui-file-upload accept=".pem,.json" label="Drop certificate"></aui-file-upload>`,
        },
    },
    {
        id: "search",
        tag: "aui-search",
        name: "Search",
        category: "forms",
        description: "Self-contained query box with debounce, magnifying mark and clear key.",
        status: "stable",
        props: ["value", "placeholder", "debounce"],
        events: ["aui-search"],
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-search placeholder="Search channels and models..."></aui-search></div>`,
        usage: {
            wc: `<aui-search placeholder="Search models..."></aui-search>`,
            react: `import { AdminSearch } from '@chaos_team/blbui-react'\n\n<AdminSearch placeholder="Search models..." onSearch={query => filter(query)} />`,
            vue: `<AdminSearch placeholder="Search models..." @search="query => filter(query)" />`,
            svelte: `<aui-search placeholder="Search models..." on:aui-search={e => filter(e.detail.value)}></aui-search>`,
        },
    },
    {
        id: "color-picker",
        tag: "aui-color-picker",
        name: "Color Picker",
        category: "forms",
        description:
            "Compact hex color selector with live swatch indicator for tenant theme tuning.",
        status: "stable",
        props: ["value", "label"],
        events: ["aui-change"],
        previewHtml: `<aui-color-picker value="#10b981" label="Accent"></aui-color-picker>`,
        usage: {
            wc: `<aui-color-picker value="#10b981" label="Accent"></aui-color-picker>`,
            react: `import { AdminColorPicker } from '@chaos_team/blbui-react'\n\n<AdminColorPicker value="#10b981" label="Accent" onColorChange={setColor} />`,
            vue: `<AdminColorPicker value="#10b981" label="Accent" v-model:value="color" />`,
            svelte: `<aui-color-picker value="#10b981" label="Accent"></aui-color-picker>`,
        },
    },

    // -------------------------------------------------------------
    // NAVIGATION (13)
    // -------------------------------------------------------------
    {
        id: "toggle",
        tag: "aui-toggle",
        name: "Toggle",
        category: "navigation",
        description: "Pressed/unpressed state action button for toolbar filters and flags.",
        status: "stable",
        props: ["pressed", "label"],
        events: ["aui-change"],
        previewHtml: `<div class="demo-row"><aui-toggle label="STREAM LOGS" pressed></aui-toggle><aui-toggle label="VERBOSE HEADERS"></aui-toggle></div>`,
        usage: {
            wc: `<aui-toggle label="STREAM LOGS" pressed></aui-toggle>`,
            react: `import { AdminToggle } from '@chaos_team/blbui-react'\n\n<AdminToggle label="STREAM LOGS" pressed={streaming} onToggle={setStreaming} />`,
            vue: `<AdminToggle label="STREAM LOGS" v-model:pressed="streaming" />`,
            svelte: `<aui-toggle label="STREAM LOGS" pressed></aui-toggle>`,
        },
    },
    {
        id: "toggle-group",
        tag: "aui-toggle-group",
        name: "Toggle Group",
        category: "navigation",
        description: "Joined button cluster for view modes and timeframe segmentation.",
        status: "stable",
        props: ["items", "value"],
        events: ["aui-change"],
        initKey: "toggle-group",
        previewHtml: `<aui-toggle-group id="preview-toggle-group" value="day"></aui-toggle-group>`,
        usage: {
            wc: `<aui-toggle-group id="timeframe-tg" value="day"></aui-toggle-group>`,
            react: `import { AdminToggleGroup } from '@chaos_team/blbui-react'\n\n<AdminToggleGroup\n  items={[\n    { id: 'day', label: '24H' },\n    { id: 'week', label: '7D' },\n    { id: 'month', label: '30D' }\n  ]}\n  value="day"\n  onChange={setTimeframe}\n/>`,
            vue: `<AdminToggleGroup :items="timeframes" v-model:value="timeframe" />`,
            svelte: `<aui-toggle-group value="day"></aui-toggle-group>`,
        },
    },
    {
        id: "segmented",
        tag: "aui-segmented",
        name: "Segmented Control",
        category: "navigation",
        description: "Pill-style linear segment switcher for scoped views and layout switches.",
        status: "stable",
        props: ["items", "value"],
        events: ["aui-change"],
        initKey: "segmented",
        previewHtml: `<aui-segmented id="preview-segmented" value="api"></aui-segmented>`,
        usage: {
            wc: `<aui-segmented id="view-segments" value="api"></aui-segmented>`,
            react: `import { AdminSegmented } from '@chaos_team/blbui-react'\n\n<AdminSegmented\n  items={[\n    { id: 'overview', label: 'Overview' },\n    { id: 'api', label: 'API Keys' },\n    { id: 'logs', label: 'Logs' }\n  ]}\n  value="api"\n  onChange={setView}\n/>`,
            vue: `<AdminSegmented :items="viewItems" v-model:value="currentView" />`,
            svelte: `<aui-segmented value="api"></aui-segmented>`,
        },
    },
    {
        id: "tabs",
        tag: "aui-tabs",
        name: "Tabs",
        category: "navigation",
        description: "Underlined tab bar with active indicator and keyboard left/right switching.",
        status: "stable",
        props: ["items", "active"],
        events: ["aui-tab-change"],
        initKey: "tabs",
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-tabs id="preview-tabs" active="general"></aui-tabs></div>`,
        usage: {
            wc: `<aui-tabs id="settings-tabs" active="general"></aui-tabs>`,
            react: `import { AdminTabs } from '@chaos_team/blbui-react'\n\n<AdminTabs\n  items={[\n    { id: 'general', label: 'General' },\n    { id: 'security', label: 'Security' },\n    { id: 'billing', label: 'Billing' }\n  ]}\n  active="general"\n  onTabChange={setActiveTab}\n/>`,
            vue: `<AdminTabs :items="tabs" v-model:active="activeTab" />`,
            svelte: `<aui-tabs active="general"></aui-tabs>`,
        },
    },
    {
        id: "breadcrumb",
        tag: "aui-breadcrumb",
        name: "Breadcrumb",
        category: "navigation",
        description: "Hierarchical page path track with industrial slash delimiters.",
        status: "stable",
        props: ["items"],
        events: [],
        initKey: "breadcrumb",
        previewHtml: `<aui-breadcrumb id="preview-breadcrumb"></aui-breadcrumb>`,
        usage: {
            wc: `<aui-breadcrumb id="path-breadcrumb"></aui-breadcrumb>`,
            react: `import { AdminBreadcrumb } from '@chaos_team/blbui-react'\n\n<AdminBreadcrumb\n  items={[\n    { label: 'Admin', href: '/admin' },\n    { label: 'Channels', href: '/admin/channels' },\n    { label: 'Edit' }\n  ]}\n/>`,
            vue: `<AdminBreadcrumb :items="crumbs" />`,
            svelte: `<aui-breadcrumb></aui-breadcrumb>`,
        },
    },
    {
        id: "nav",
        tag: "aui-nav",
        name: "Navigation",
        category: "navigation",
        description: "Vertical sidebar navigation links with active state highlight.",
        status: "stable",
        props: ["items"],
        events: ["aui-nav-change"],
        initKey: "nav",
        previewHtml: `<div style="width:100%;max-width:220px;"><aui-nav id="preview-nav"></aui-nav></div>`,
        usage: {
            wc: `<aui-nav id="sidebar-nav"></aui-nav>`,
            react: `import { AdminNav } from '@chaos_team/blbui-react'\n\n<AdminNav items={navItems} onNavigate={handleNav} />`,
            vue: `<AdminNav :items="navItems" />`,
            svelte: `<aui-nav></aui-nav>`,
        },
    },
    {
        id: "pagination",
        tag: "aui-pagination",
        name: "Pagination",
        category: "navigation",
        description: "Table pagination strip with prev/next actions and total records counter.",
        status: "stable",
        props: ["page", "total-pages", "total", "page-size"],
        events: ["aui-page-change"],
        previewHtml: `<aui-pagination page="2" total-pages="6" total="60" page-size="10"></aui-pagination>`,
        usage: {
            wc: `<aui-pagination page="1" total-pages="6" total="60" page-size="10"></aui-pagination>`,
            react: `import { AdminPagination } from '@chaos_team/blbui-react'\n\n<AdminPagination\n  page={currentPage}\n  totalPages={6}\n  total={60}\n  onPageChange={setPage}\n/>`,
            vue: `<AdminPagination :page="currentPage" :total-pages="6" :total="60" @page-change="p => currentPage = p" />`,
            svelte: `<aui-pagination page={1} total-pages={6} total={60}></aui-pagination>`,
        },
    },
    {
        id: "accordion",
        tag: "aui-accordion",
        name: "Accordion",
        category: "navigation",
        description: "Expandable content panels supporting single or multiple open sections.",
        status: "stable",
        props: ["items", "multiple"],
        events: ["aui-change"],
        initKey: "accordion",
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-accordion id="preview-accordion"></aui-accordion></div>`,
        usage: {
            wc: `<aui-accordion id="faq-accordion"></aui-accordion>`,
            react: `import { AdminAccordion } from '@chaos_team/blbui-react'\n\n<AdminAccordion items={accordionItems} />`,
            vue: `<AdminAccordion :items="accordionItems" />`,
            svelte: `<aui-accordion></aui-accordion>`,
        },
    },
    {
        id: "collapsible",
        tag: "aui-collapsible",
        name: "Collapsible",
        category: "navigation",
        description: "Native details/summary disclosure block with smooth disclosure marker.",
        status: "stable",
        props: ["open", "title"],
        events: ["aui-toggle"],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-collapsible title="Advanced Network Tuning" open><div style="padding:8px 0;font-size:11px;color:var(--aui-text-secondary);">Configured with TCP keepalive and 30s timeout interval.</div></aui-collapsible></div>`,
        usage: {
            wc: `<aui-collapsible title="Advanced Tuning" open>\n  <p>TCP keepalive configured.</p>\n</aui-collapsible>`,
            react: `import { AdminCollapsible } from '@chaos_team/blbui-react'\n\n<AdminCollapsible title="Advanced Tuning" open>\n  <p>TCP keepalive configured.</p>\n</AdminCollapsible>`,
            vue: `<AdminCollapsible title="Advanced Tuning" :open="true">\n  <p>TCP keepalive configured.</p>\n</AdminCollapsible>`,
            svelte: `<aui-collapsible title="Advanced Tuning" open>\n  <p>TCP keepalive configured.</p>\n</aui-collapsible>`,
        },
    },
    {
        id: "stepper",
        tag: "aui-stepper",
        name: "Stepper",
        category: "navigation",
        description: "Numbered step workflow rail indicating current and completed milestones.",
        status: "stable",
        props: ["items", "active", "orientation"],
        events: ["aui-step-change"],
        initKey: "stepper",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-stepper id="preview-stepper" active="1"></aui-stepper></div>`,
        usage: {
            wc: `<aui-stepper id="checkout-stepper" active="1"></aui-stepper>`,
            react: `import { AdminStepper } from '@chaos_team/blbui-react'\n\n<AdminStepper\n  items={[\n    { label: 'Configure' },\n    { label: 'Validate' },\n    { label: 'Deploy' }\n  ]}\n  active={1}\n/>`,
            vue: `<AdminStepper :items="steps" :active="1" />`,
            svelte: `<aui-stepper active={1}></aui-stepper>`,
        },
    },
    {
        id: "list",
        tag: "aui-list",
        name: "List",
        category: "navigation",
        description: "Selectable operational list container with keyboard row focus.",
        status: "stable",
        props: ["items", "selected", "selectable"],
        events: ["aui-select"],
        initKey: "list",
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-list id="preview-list" selectable></aui-list></div>`,
        usage: {
            wc: `<aui-list id="servers-list" selectable></aui-list>`,
            react: `import { AdminList } from '@chaos_team/blbui-react'\n\n<AdminList items={serverList} selectable onChange={handleSelect} />`,
            vue: `<AdminList :items="serverList" :selectable="true" @select="handleSelect" />`,
            svelte: `<aui-list selectable></aui-list>`,
        },
    },
    {
        id: "tree",
        tag: "aui-tree",
        name: "Tree",
        category: "navigation",
        description: "Hierarchical nested directory tree with expandable branch folders.",
        status: "stable",
        props: ["nodes", "selected", "expanded"],
        events: ["aui-select", "aui-expand"],
        initKey: "tree",
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-tree id="preview-tree"></aui-tree></div>`,
        usage: {
            wc: `<aui-tree id="file-tree"></aui-tree>`,
            react: `import { AdminTree } from '@chaos_team/blbui-react'\n\n<AdminTree nodes={treeData} onChange={(id) => console.log(id)} />`,
            vue: `<AdminTree :nodes="treeData" />`,
            svelte: `<aui-tree></aui-tree>`,
        },
    },
    {
        id: "timeline",
        tag: "aui-timeline",
        name: "Timeline",
        category: "navigation",
        description: "Audit trail and event stream sequence with timestamp and status dot.",
        status: "stable",
        props: ["items"],
        events: [],
        initKey: "timeline",
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-timeline id="preview-timeline"></aui-timeline></div>`,
        usage: {
            wc: `<aui-timeline id="audit-timeline"></aui-timeline>`,
            react: `import { AdminTimeline } from '@chaos_team/blbui-react'\n\n<AdminTimeline items={timelineEvents} />`,
            vue: `<AdminTimeline :items="timelineEvents" />`,
            svelte: `<aui-timeline></aui-timeline>`,
        },
    },

    // -------------------------------------------------------------
    // FEEDBACK (9)
    // -------------------------------------------------------------
    {
        id: "alert",
        tag: "aui-alert",
        name: "Alert",
        category: "feedback",
        description: "Prominent banner for operational incidents, warnings and system notes.",
        status: "stable",
        props: ["variant", "title", "description", "closable"],
        events: ["aui-close"],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-alert variant="warning" title="HIGH LATENCY" description="Upstream response exceeds 800ms threshold."></aui-alert></div>`,
        usage: {
            wc: `<aui-alert variant="warning" title="TRAFFIC SPIKE" description="Edge nodes running at 92% capacity."></aui-alert>`,
            react: `import { AdminAlert } from '@chaos_team/blbui-react'\n\n<AdminAlert variant="warning" title="TRAFFIC SPIKE" description="Edge nodes running at 92% capacity." />`,
            vue: `<AdminAlert variant="warning" title="TRAFFIC SPIKE" description="Edge nodes running at 92% capacity." />`,
            svelte: `<aui-alert variant="warning" title="TRAFFIC SPIKE" description="Edge nodes running at 92% capacity."></aui-alert>`,
        },
    },
    {
        id: "result",
        tag: "aui-result",
        name: "Result",
        category: "feedback",
        description: "Full-page outcome message for deployment success, 404 and access denied.",
        status: "stable",
        props: ["status", "title", "description"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-result status="success" title="Cluster Registered" description="Cluster ID #924 is active in production."></aui-result></div>`,
        usage: {
            wc: `<aui-result status="success" title="Deployed Successfully" description="All nodes updated to v0.0.2."></aui-result>`,
            react: `import { AdminResult } from '@chaos_team/blbui-react'\n\n<AdminResult status="success" title="Deployed" description="All nodes updated." />`,
            vue: `<AdminResult status="success" title="Deployed" description="All nodes updated." />`,
            svelte: `<aui-result status="success" title="Deployed" description="All nodes updated."></aui-result>`,
        },
    },
    {
        id: "empty-state",
        tag: "aui-empty-state",
        name: "Empty State",
        category: "feedback",
        description: "Zero-data screen anchor with industrial icon box and prompt message.",
        status: "stable",
        props: ["title", "description"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-empty-state title="No Active Routes" description="Deploy your first channel route to get started."></aui-empty-state></div>`,
        usage: {
            wc: `<aui-empty-state title="No Routes" description="Create a route to begin."></aui-empty-state>`,
            react: `import { AdminEmptyState } from '@chaos_team/blbui-react'\n\n<AdminEmptyState title="No Routes" description="Create a route to begin." />`,
            vue: `<AdminEmptyState title="No Routes" description="Create a route to begin." />`,
            svelte: `<aui-empty-state title="No Routes" description="Create a route to begin."></aui-empty-state>`,
        },
    },
    {
        id: "error-state",
        tag: "aui-error-state",
        name: "Error State",
        category: "feedback",
        description: "Explicit failure state screen with retry prompt and error code label.",
        status: "stable",
        props: ["title", "description"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-error-state title="Upstream Connection Refused" description="Target host 10.91.3.253 did not respond."></aui-error-state></div>`,
        usage: {
            wc: `<aui-error-state title="Request Failed" description="The upstream did not respond."></aui-error-state>`,
            react: `import { AdminErrorState } from '@chaos_team/blbui-react'\n\n<AdminErrorState title="Request Failed" description="The upstream did not respond." />`,
            vue: `<AdminErrorState title="Request Failed" description="The upstream did not respond." />`,
            svelte: `<aui-error-state title="Request Failed" description="The upstream did not respond."></aui-error-state>`,
        },
    },
    {
        id: "spinner",
        tag: "aui-spinner",
        name: "Spinner",
        category: "feedback",
        description: "Terminal pulse-bar loading spinner with prefers-reduced-motion fallback.",
        status: "stable",
        props: [],
        events: [],
        previewHtml: `<div style="display:flex;align-items:center;gap:12px;"><aui-spinner></aui-spinner><span style="font-size:11px;color:var(--aui-text-secondary);">SYNCING STATE...</span></div>`,
        usage: {
            wc: `<aui-spinner></aui-spinner>`,
            react: `import { AdminSpinner } from '@chaos_team/blbui-react'\n\n<AdminSpinner />`,
            vue: `<AdminSpinner />`,
            svelte: `<aui-spinner></aui-spinner>`,
        },
    },
    {
        id: "skeleton",
        tag: "aui-skeleton",
        name: "Skeleton",
        category: "feedback",
        description: "Content placeholder block with low-frequency shimmer sweep.",
        status: "stable",
        props: ["width", "height"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:280px;display:flex;flex-direction:column;gap:8px;"><aui-skeleton width="100%" height="24px"></aui-skeleton><aui-skeleton width="70%" height="16px"></aui-skeleton></div>`,
        usage: {
            wc: `<aui-skeleton width="100%" height="32px"></aui-skeleton>`,
            react: `import { AdminSkeleton } from '@chaos_team/blbui-react'\n\n<AdminSkeleton width="100%" height="32px" />`,
            vue: `<AdminSkeleton width="100%" height="32px" />`,
            svelte: `<aui-skeleton width="100%" height="32px"></aui-skeleton>`,
        },
    },
    {
        id: "toast",
        tag: "aui-toast",
        name: "Toast",
        category: "feedback",
        description: "Self-dismissing notification banner with status icon and timer.",
        status: "stable",
        props: ["open", "title", "message", "variant", "duration"],
        events: ["aui-close"],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-toast title="CONFIG PERSISTED" message="Channel routing table synchronized." variant="success" open></aui-toast></div>`,
        usage: {
            wc: `<aui-toast title="CONFIG PERSISTED" message="All routes live." variant="success" open></aui-toast>`,
            react: `import { AdminToast } from '@chaos_team/blbui-react'\n\n<AdminToast title="Saved" message="Settings applied." variant="success" open={isOpen} />`,
            vue: `<AdminToast title="Saved" message="Settings applied." variant="success" :open="isOpen" />`,
            svelte: `<aui-toast title="Saved" message="Settings applied." variant="success" open></aui-toast>`,
        },
    },
    {
        id: "copyable-text",
        tag: "aui-copyable-text",
        name: "Copyable Text",
        category: "feedback",
        description: "One-click clipboard copy utility with tooltip confirmation feedback.",
        status: "stable",
        props: ["text", "copy-label"],
        events: [],
        previewHtml: `<aui-copyable-text text="sk-live-098234127591823759">sk-live-098234...</aui-copyable-text>`,
        usage: {
            wc: `<aui-copyable-text text="sk-live-token-123">Click to copy key</aui-copyable-text>`,
            react: `import { AdminCopyableText } from '@chaos_team/blbui-react'\n\n<AdminCopyableText text="sk-live-token-123">Click to copy key</AdminCopyableText>`,
            vue: `<AdminCopyableText text="sk-live-token-123">Click to copy key</AdminCopyableText>`,
            svelte: `<aui-copyable-text text="sk-live-token-123">Click to copy key</aui-copyable-text>`,
        },
    },
    {
        id: "separator",
        tag: "aui-separator",
        name: "Separator",
        category: "feedback",
        description: "1px border dividing rule for sections, toolbars and panel groups.",
        status: "stable",
        props: ["vertical"],
        events: [],
        previewHtml: `<div style="width:100%;display:flex;align-items:center;gap:12px;"><span style="font-size:11px;">INGRESS</span><aui-separator style="flex:1;"></aui-separator><span style="font-size:11px;">EGRESS</span></div>`,
        usage: {
            wc: `<aui-separator></aui-separator>`,
            react: `import { AdminSeparator } from '@chaos_team/blbui-react'\n\n<AdminSeparator />`,
            vue: `<AdminSeparator />`,
            svelte: `<aui-separator></aui-separator>`,
        },
    },

    // -------------------------------------------------------------
    // OVERLAY (7)
    // -------------------------------------------------------------
    {
        id: "tooltip",
        tag: "aui-tooltip",
        name: "Tooltip",
        category: "overlay",
        description: "Hover and focus popout hint with sharp industrial pointer frame.",
        status: "stable",
        props: ["content", "side"],
        events: [],
        previewHtml: `<aui-tooltip content="Calculates weighted latency across edge clusters" side="top"><aui-button size="compact" variant="secondary">CLUSTER HASH</aui-button></aui-tooltip>`,
        usage: {
            wc: `<aui-tooltip content="View cluster health" side="top">\n  <aui-button size="compact">CLUSTER</aui-button>\n</aui-tooltip>`,
            react: `import { AdminTooltip, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminTooltip content="View cluster health" side="top">\n  <AdminButton size="compact">CLUSTER</AdminButton>\n</AdminTooltip>`,
            vue: `<AdminTooltip content="View cluster health" side="top">\n  <AdminButton size="compact">CLUSTER</AdminButton>\n</AdminTooltip>`,
            svelte: `<aui-tooltip content="View cluster health" side="top">\n  <aui-button size="compact">CLUSTER</aui-button>\n</aui-tooltip>`,
        },
    },
    {
        id: "popover",
        tag: "aui-popover",
        name: "Popover",
        category: "overlay",
        description: "Click-triggered contextual popout for quick filter controls.",
        status: "stable",
        props: ["open", "title"],
        events: ["aui-toggle"],
        previewHtml: `<aui-popover title="Quick Actions"><span slot="trigger"><aui-button size="compact" variant="secondary">QUICK ACTIONS ▾</aui-button></span><div style="padding:10px;font-size:11px;color:var(--aui-text-secondary);">Flush DNS cache or toggle canary route</div></aui-popover>`,
        usage: {
            wc: `<aui-popover title="Actions">\n  <span slot="trigger"><aui-button size="compact">OPTIONS ▾</aui-button></span>\n  <div>Popover content</div>\n</aui-popover>`,
            react: `import { AdminPopover, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminPopover title="Actions">\n  <span slot="trigger"><AdminButton size="compact">OPTIONS ▾</AdminButton></span>\n  <div>Popover content</div>\n</AdminPopover>`,
            vue: `<AdminPopover title="Actions">\n  <template #trigger><AdminButton size="compact">OPTIONS ▾</AdminButton></template>\n  <div>Popover content</div>\n</AdminPopover>`,
            svelte: `<aui-popover title="Actions">\n  <span slot="trigger"><aui-button size="compact">OPTIONS ▾</aui-button></span>\n  <div>Popover content</div>\n</aui-popover>`,
        },
    },
    {
        id: "dropdown",
        tag: "aui-dropdown",
        name: "Dropdown Menu",
        category: "overlay",
        description: "Contextual menu items with hover selection and keyboard accessibility.",
        status: "stable",
        props: ["items", "open"],
        events: ["aui-select"],
        initKey: "dropdown",
        previewHtml: `<aui-dropdown id="preview-dropdown"><aui-button size="compact" variant="secondary">NODE OPTIONS ▾</aui-button></aui-dropdown>`,
        usage: {
            wc: `<aui-dropdown id="opts-dropdown">\n  <aui-button size="compact">OPTIONS ▾</aui-button>\n</aui-dropdown>`,
            react: `import { AdminDropdown, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminDropdown\n  items={[\n    { id: 'restart', label: 'Restart Node' },\n    { id: 'drain', label: 'Drain Connections' }\n  ]}\n  onSelect={item => console.log(item)}\n>\n  <AdminButton size="compact">OPTIONS ▾</AdminButton>\n</AdminDropdown>`,
            vue: `<AdminDropdown :items="dropdownItems">\n  <AdminButton size="compact">OPTIONS ▾</AdminButton>\n</AdminDropdown>`,
            svelte: `<aui-dropdown>\n  <aui-button size="compact">OPTIONS ▾</aui-button>\n</aui-dropdown>`,
        },
    },
    {
        id: "command",
        tag: "aui-command",
        name: "Command Palette",
        category: "overlay",
        description: "Fuzzy-searchable command menu with category grouping and arrow nav.",
        status: "stable",
        props: ["items", "open", "placeholder"],
        events: ["aui-select"],
        initKey: "command",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-command id="preview-command" placeholder="SEARCH COMMANDS..."></aui-command></div>`,
        usage: {
            wc: `<aui-command id="cmd-palette" placeholder="Type a command..."></aui-command>`,
            react: `import { AdminCommand } from '@chaos_team/blbui-react'\n\n<AdminCommand items={commands} placeholder="Type a command..." onSelect={runCmd} />`,
            vue: `<AdminCommand :items="commands" placeholder="Type a command..." />`,
            svelte: `<aui-command placeholder="Type a command..."></aui-command>`,
        },
    },
    {
        id: "dialog",
        tag: "aui-dialog",
        name: "Dialog",
        category: "overlay",
        description: "Modal window with backdrop lock, focus trap and native ESC cancel key.",
        status: "stable",
        props: ["open", "title", "description", "close-label"],
        events: ["aui-close", "aui-confirm"],
        previewHtml: `<aui-button size="compact" variant="secondary" id="btn-demo-dialog">OPEN DIALOG</aui-button><aui-dialog id="preview-dialog" title="Configure Upstream" description="Configure route failover policies."><p style="font-size:11px;color:var(--aui-text-secondary);margin:8px 0;">Dialog modal contents with focus trap and keyboard escape.</p><span slot="footer"><aui-button size="compact" id="btn-close-demo-dialog">CLOSE</aui-button></span></aui-dialog>`,
        usage: {
            wc: `<aui-button id="open-dlg">OPEN</aui-button>\n<aui-dialog id="dlg" title="Deploy Route">\n  <p>Route contents</p>\n  <span slot="footer"><aui-button>CONFIRM</aui-button></span>\n</aui-dialog>`,
            react: `import { AdminDialog, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminDialog title="Deploy Route" open={open} onOpenChange={setOpen}>\n  <p>Route contents</p>\n</AdminDialog>`,
            vue: `<AdminDialog title="Deploy Route" :open="open" @close="open = false">\n  <p>Route contents</p>\n</AdminDialog>`,
            svelte: `<aui-dialog title="Deploy Route" {open}>\n  <p>Route contents</p>\n</aui-dialog>`,
        },
    },
    {
        id: "confirm-dialog",
        tag: "aui-confirm-dialog",
        name: "Confirm Dialog",
        category: "overlay",
        description: "Explicit confirmation prompt with destructive theme and double-check.",
        status: "stable",
        props: ["open", "title", "description", "danger", "loading"],
        events: ["aui-confirm", "aui-cancel"],
        previewHtml: `<aui-button size="compact" variant="danger" id="btn-demo-confirm">REVOKE KEY</aui-button><aui-confirm-dialog id="preview-confirm" title="Revoke API Key?" description="This action will instantly terminate all active consumer sessions." danger></aui-confirm-dialog>`,
        usage: {
            wc: `<aui-confirm-dialog title="Delete Key?" description="Cannot be undone." danger></aui-confirm-dialog>`,
            react: `import { AdminConfirmDialog } from '@chaos_team/blbui-react'\n\n<AdminConfirmDialog\n  title="Delete Key?"\n  description="Cannot be undone."\n  danger\n  open={confirmOpen}\n  onConfirm={handleDelete}\n  onCancel={() => setConfirmOpen(false)}\n/>`,
            vue: `<AdminConfirmDialog title="Delete Key?" description="Cannot be undone." :danger="true" :open="confirmOpen" />`,
            svelte: `<aui-confirm-dialog title="Delete Key?" description="Cannot be undone." danger></aui-confirm-dialog>`,
        },
    },
    {
        id: "drawer",
        tag: "aui-drawer",
        name: "Drawer",
        category: "overlay",
        description: "Sliding inspection panel anchored to left or right screen boundary.",
        status: "stable",
        props: ["open", "title", "side", "width"],
        events: ["aui-close"],
        previewHtml: `<aui-button size="compact" variant="secondary" id="btn-demo-drawer">OPEN DRAWER</aui-button><aui-drawer id="preview-drawer" title="Inspection Drawer" width="300px"><div style="padding:16px;font-size:11px;color:var(--aui-text-secondary);">Live system trace and inspector parameters.</div></aui-drawer>`,
        usage: {
            wc: `<aui-drawer title="Trace Inspector" side="right" width="360px"></aui-drawer>`,
            react: `import { AdminDrawer } from '@chaos_team/blbui-react'\n\n<AdminDrawer title="Trace Inspector" side="right" width="360px" open={open} onClose={() => setOpen(false)}>\n  <p>Inspector contents</p>\n</AdminDrawer>`,
            vue: `<AdminDrawer title="Trace Inspector" side="right" width="360px" :open="open">\n  <p>Inspector contents</p>\n</AdminDrawer>`,
            svelte: `<aui-drawer title="Trace Inspector" side="right" width="360px"></aui-drawer>`,
        },
    },

    // -------------------------------------------------------------
    // DATA (11)
    // -------------------------------------------------------------
    {
        id: "data-list",
        tag: "aui-data-list",
        name: "Data List",
        category: "data",
        description: "Definition list pairs with uppercase key headers and monospace values.",
        status: "stable",
        props: ["items"],
        events: [],
        initKey: "data-list",
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-data-list id="preview-data-list"></aui-data-list></div>`,
        usage: {
            wc: `<aui-data-list id="meta-list"></aui-data-list>`,
            react: `import { AdminDataList } from '@chaos_team/blbui-react'\n\n<AdminDataList\n  items={[\n    { label: 'REGION', value: 'us-east-1' },\n    { label: 'NODE IP', value: '10.91.3.250' },\n    { label: 'STATUS', value: 'ONLINE' }\n  ]}\n/>`,
            vue: `<AdminDataList :items="metaItems" />`,
            svelte: `<aui-data-list></aui-data-list>`,
        },
    },
    {
        id: "table",
        tag: "aui-table",
        name: "Table",
        category: "data",
        description:
            "Data-first tabular layout with horizontally scrollable frame and stable states.",
        status: "stable",
        props: ["loading", "empty", "error", "permission-denied", "loading-label", "empty-label", "error-label", "permission-denied-label", "retryable", "retry-label"],
        events: ["aui-retry"],
        previewHtml: `<div class="async-preview" data-async-preview="table" style="width:100%;"><div class="async-preview-controls" aria-label="Table async state preview"><span>STATE</span><button type="button" data-async-state="ready" class="is-active">READY</button><button type="button" data-async-state="loading">LOADING</button><button type="button" data-async-state="empty">EMPTY</button><button type="button" data-async-state="error">ERROR</button><button type="button" data-async-state="permission-denied">PERMISSION</button></div><aui-table id="preview-table"><table><thead><tr><th>GATEWAY</th><th>STATUS</th><th>LATENCY</th></tr></thead><tbody><tr><td>US-EAST</td><td><aui-status-tag status="success">ONLINE</aui-status-tag></td><td>18ms</td></tr><tr><td>EU-CENTRAL</td><td><aui-status-tag status="success">ONLINE</aui-status-tag></td><td>32ms</td></tr></tbody></table><button slot="permission" type="button" data-async-request-access>REQUEST ACCESS</button></aui-table></div>`,
        usage: {
            wc: `<aui-table>\n  <table>\n    <thead><tr><th>NAME</th><th>STATUS</th></tr></thead>\n    <tbody><tr><td>Route A</td><td>OK</td></tr></tbody>\n  </table>\n</aui-table>`,
            react: `import { AdminTable } from '@chaos_team/blbui-react'\n\n<AdminTable>\n  <table>...</table>\n</AdminTable>`,
            vue: `<AdminTable>\n  <table>...</table>\n</AdminTable>`,
            svelte: `<aui-table>\n  <table>...</table>\n</aui-table>`,
        },
    },
    {
        id: "data-grid",
        tag: "aui-data-grid",
        name: "Data Grid",
        category: "data",
        description: "Virtualized tabular matrix with sorting, selection and column sizing.",
        status: "stable",
        props: ["columns", "rows", "loading", "error", "permission-denied", "empty-label", "error-label", "permission-denied-label", "retryable", "retry-label"],
        events: ["aui-sort-change", "aui-selection-change", "aui-retry"],
        initKey: "data-grid",
        previewHtml: `<div class="async-preview" data-async-preview="data-grid" style="width:100%;"><div class="async-preview-controls" aria-label="Data grid async state preview"><span>STATE</span><button type="button" data-async-state="ready" class="is-active">READY</button><button type="button" data-async-state="loading">LOADING</button><button type="button" data-async-state="empty">EMPTY</button><button type="button" data-async-state="error">ERROR</button><button type="button" data-async-state="permission-denied">PERMISSION</button></div><aui-data-grid id="preview-data-grid"><button slot="permission" type="button" data-async-request-access>REQUEST ACCESS</button></aui-data-grid></div>`,
        usage: {
            wc: `<aui-data-grid id="my-grid"></aui-data-grid>`,
            react: `import { AdminDataGrid } from '@chaos_team/blbui-react'\n\n<AdminDataGrid columns={cols} rows={data} />`,
            vue: `<AdminDataGrid :columns="cols" :rows="data" />`,
            svelte: `<aui-data-grid></aui-data-grid>`,
        },
    },
    {
        id: "calendar",
        tag: "aui-calendar",
        name: "Date Input",
        category: "data",
        description: "Single-point date selector field with ISO format enforcement.",
        status: "stable",
        props: ["value", "min", "max", "label"],
        events: ["aui-change"],
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-calendar label="EXPIRATION DATE" value="2026-12-31"></aui-calendar></div>`,
        usage: {
            wc: `<aui-calendar label="EXPIRATION DATE" value="2026-12-31"></aui-calendar>`,
            react: `import { AdminCalendar } from '@chaos_team/blbui-react'\n\n<AdminCalendar label="EXPIRATION DATE" value="2026-12-31" onChange={setDate} />`,
            vue: `<AdminCalendar label="EXPIRATION DATE" v-model:value="date" />`,
            svelte: `<aui-calendar label="EXPIRATION DATE" value="2026-12-31"></aui-calendar>`,
        },
    },
    {
        id: "calendar-grid",
        tag: "aui-calendar-grid",
        name: "Calendar Grid",
        category: "data",
        description: "Full monthly matrix grid with selectable days and weekday column labels.",
        status: "stable",
        props: ["month", "year", "selected"],
        events: ["aui-select"],
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-calendar-grid month="8" year="2026" selected="5"></aui-calendar-grid></div>`,
        usage: {
            wc: `<aui-calendar-grid month="8" year="2026" selected="5"></aui-calendar-grid>`,
            react: `import { AdminCalendarGrid } from '@chaos_team/blbui-react'\n\n<AdminCalendarGrid month={8} year={2026} selected="2026-08-05" onChange={handleDaySelect} />`,
            vue: `<AdminCalendarGrid :month="8" :year="2026" :selected="5" />`,
            svelte: `<aui-calendar-grid month={8} year={2026} selected={5}></aui-calendar-grid>`,
        },
    },
    {
        id: "date-range",
        tag: "aui-date-range",
        name: "Date Range",
        category: "data",
        description:
            "Paired start and end date selector with validation, quick ranges and clear action.",
        status: "stable",
        props: [
            "presets",
            "start",
            "end",
            "start-label",
            "end-label",
            "min",
            "max",
            "preset-label",
            "clearable",
            "required",
            "disabled",
        ],
        events: ["aui-range-change", "aui-range-validation", "aui-range-preset"],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-date-range id="preview-date-range" start="2026-09-01" end="2026-09-05" min="2026-01-01" max="2026-12-31" required></aui-date-range></div>`,
        usage: {
            wc: `<aui-date-range start="2026-09-01" end="2026-09-05" clearable></aui-date-range>`,
            react: `import { AdminDateRange } from '@chaos_team/blbui-react'\n\n<AdminDateRange start="2026-09-01" end="2026-09-05" clearable onChange={setRange} />`,
            vue: `<AdminDateRange start="2026-09-01" end="2026-09-05" clearable @range-change="setRange" />`,
            svelte: `<aui-date-range start="2026-09-01" end="2026-09-05"></aui-date-range>`,
        },
    },
    {
        id: "chart-container",
        tag: "aui-chart-container",
        name: "Chart Container",
        category: "data",
        description: "Industrial visual wrap for svg and canvas diagrams with title bar.",
        status: "stable",
        props: ["title", "description", "height", "legend", "tooltip"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-chart-container id="preview-chart-container" title="INGRESS RATE" description="Packets per second over 5m" height="90px"><div style="height:50px;display:flex;align-items:flex-end;gap:4px;padding:8px 0;"><div style="flex:1;background:var(--aui-border);height:40%;"></div><div style="flex:1;background:var(--aui-border);height:65%;"></div><div style="flex:1;background:var(--aui-info);height:90%;"></div><div style="flex:1;background:var(--aui-success);height:100%;"></div><div style="flex:1;background:var(--aui-success);height:85%;"></div></div></aui-chart-container></div>`,
        usage: {
            wc: `<aui-chart-container title="Throughput" description="Requests/sec" height="180px">\n  <!-- Canvas or SVG -->\n</aui-chart-container>`,
            react: `import { AdminChartContainer } from '@chaos_team/blbui-react'\n\n<AdminChartContainer title="Throughput" description="Requests/sec" height="180px">\n  <canvas />\n</AdminChartContainer>`,
            vue: `<AdminChartContainer title="Throughput" description="Requests/sec" height="180px">\n  <canvas />\n</AdminChartContainer>`,
            svelte: `<aui-chart-container title="Throughput" description="Requests/sec" height="180px"></aui-chart-container>`,
        },
    },
    {
        id: "json-viewer",
        tag: "aui-json-viewer",
        name: "JSON Viewer",
        category: "data",
        description: "Tree-structured syntax tree viewer for API request/response payloads.",
        status: "stable",
        props: ["value", "title", "expanded"],
        events: [],
        initKey: "json-viewer",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-json-viewer id="preview-json-viewer" title="CHANNEL PAYLOAD"></aui-json-viewer></div>`,
        usage: {
            wc: `<aui-json-viewer id="payload-viewer" title="Payload"></aui-json-viewer>`,
            react: `import { AdminJsonViewer } from '@chaos_team/blbui-react'\n\n<AdminJsonViewer value={apiData} title="Response Payload" expanded />`,
            vue: `<AdminJsonViewer :value="apiData" title="Response Payload" :expanded="true" />`,
            svelte: `<aui-json-viewer title="Response Payload"></aui-json-viewer>`,
        },
    },
    {
        id: "log-viewer",
        tag: "aui-log-viewer",
        name: "Log Viewer",
        category: "data",
        description: "Terminal output stream with auto-scroll and line index numbering.",
        status: "stable",
        props: ["entries", "follow"],
        events: [],
        initKey: "log-viewer",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-log-viewer id="preview-log-viewer"></aui-log-viewer></div>`,
        usage: {
            wc: `<aui-log-viewer id="system-logs" follow></aui-log-viewer>`,
            react: `import { AdminLogViewer } from '@chaos_team/blbui-react'\n\n<AdminLogViewer entries={logLines} follow />`,
            vue: `<AdminLogViewer :entries="logLines" :follow="true" />`,
            svelte: `<aui-log-viewer follow></aui-log-viewer>`,
        },
    },
    {
        id: "kanban",
        tag: "aui-kanban",
        name: "Kanban Board",
        category: "data",
        description: "Multi-lane queue board for ticket triage, operations and task phases.",
        status: "stable",
        props: ["columns"],
        events: ["aui-card-move"],
        initKey: "kanban",
        previewHtml: `<div style="width:100%;"><aui-kanban id="preview-kanban"></aui-kanban></div>`,
        usage: {
            wc: `<aui-kanban id="task-board"></aui-kanban>`,
            react: `import { AdminKanban } from '@chaos_team/blbui-react'\n\n<AdminKanban columns={kanbanColumns} onChange={(detail) => console.log(detail.itemId, detail.columnId)} />`,
            vue: `<AdminKanban :columns="kanbanColumns" />`,
            svelte: `<aui-kanban></aui-kanban>`,
        },
    },
    {
        id: "code-block",
        tag: "aui-code-block",
        name: "Code Block",
        category: "data",
        description: "Syntax snippet container with copy action and language chip.",
        status: "stable",
        props: ["code", "language"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-code-block code="const client = new BLBClient({ timeout: 5000 });" language="typescript"></aui-code-block></div>`,
        usage: {
            wc: `<aui-code-block code="const a = 1;" language="javascript"></aui-code-block>`,
            react: `import { AdminCodeBlock } from '@chaos_team/blbui-react'\n\n<AdminCodeBlock code="const a = 1;" language="javascript" />`,
            vue: `<AdminCodeBlock code="const a = 1;" language="javascript" />`,
            svelte: `<aui-code-block code="const a = 1;" language="javascript"></aui-code-block>`,
        },
    },

    // -------------------------------------------------------------
    // LAYOUT (12)
    // -------------------------------------------------------------
    {
        id: "card",
        tag: "aui-card",
        name: "Card",
        category: "layout",
        description: "Sharp surface container with header, content and footer slots.",
        status: "stable",
        props: ["header", "footer"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-card><div slot="header" style="font-size:11px;font-weight:700;">SECURITY PARAMETERS</div><p style="margin:0;font-size:11px;color:var(--aui-text-secondary);">Zero-radius sharp border surface container</p><div slot="footer"><aui-button size="compact">SAVE</aui-button></div></aui-card></div>`,
        usage: {
            wc: `<aui-card>\n  <span slot="header">Card Title</span>\n  <p>Content</p>\n  <span slot="footer">Action</span>\n</aui-card>`,
            react: `import { AdminCard } from '@chaos_team/blbui-react'\n\n<AdminCard>\n  <span slot="header">Card Title</span>\n  <p>Content</p>\n</AdminCard>`,
            vue: `<AdminCard>\n  <template #header>Card Title</template>\n  <p>Content</p>\n</AdminCard>`,
            svelte: `<aui-card>\n  <span slot="header">Card Title</span>\n  <p>Content</p>\n</aui-card>`,
        },
    },
    {
        id: "container",
        tag: "aui-container",
        name: "Container",
        category: "layout",
        description: "Max-width boundary wrapper with horizontal padding constraints.",
        status: "stable",
        props: ["max-width", "centered"],
        events: [],
        previewHtml: `<div style="width:100%;"><aui-container max-width="320px"><div style="padding:12px;background:var(--aui-surface-subtle);border:1px dashed var(--aui-border-hover);text-align:center;font-size:11px;">CONTAINER BOUNDARY (MAX 320PX)</div></aui-container></div>`,
        usage: {
            wc: `<aui-container max-width="1200px" centered>\n  <div>Content</div>\n</aui-container>`,
            react: `import { AdminContainer } from '@chaos_team/blbui-react'\n\n<AdminContainer maxWidth="1200px" centered>\n  <div>Content</div>\n</AdminContainer>`,
            vue: `<AdminContainer max-width="1200px" :centered="true">\n  <div>Content</div>\n</AdminContainer>`,
            svelte: `<aui-container max-width="1200px" centered></aui-container>`,
        },
    },
    {
        id: "stack",
        tag: "aui-stack",
        name: "Stack",
        category: "layout",
        description: "Flexbox alignment helper for horizontal or vertical component stacks.",
        status: "stable",
        props: ["direction", "gap", "align", "justify"],
        events: [],
        previewHtml: `<aui-stack direction="row" gap="8px"><aui-badge variant="primary">PRIMARY</aui-badge><aui-badge variant="success">SUCCESS</aui-badge><aui-badge variant="warning">WARNING</aui-badge></aui-stack>`,
        usage: {
            wc: `<aui-stack direction="horizontal" gap="12px">\n  <aui-button>A</aui-button>\n  <aui-button>B</aui-button>\n</aui-stack>`,
            react: `import { AdminStack, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminStack direction="row" gap="12px">\n  <AdminButton>A</AdminButton>\n  <AdminButton>B</AdminButton>\n</AdminStack>`,
            vue: `<AdminStack direction="row" gap="12px">\n  <AdminButton>A</AdminButton>\n</AdminStack>`,
            svelte: `<aui-stack direction="horizontal" gap="12px"></aui-stack>`,
        },
    },
    {
        id: "grid",
        tag: "aui-grid",
        name: "Grid",
        category: "layout",
        description: "Responsive CSS grid container with uniform column and gap spacing.",
        status: "stable",
        props: ["columns", "gap", "min-width"],
        events: [],
        previewHtml: `<div style="width:100%;"><aui-grid columns="3" gap="8px"><div style="padding:8px;background:var(--aui-surface-subtle);text-align:center;font-size:10px;">COL 1</div><div style="padding:8px;background:var(--aui-surface-subtle);text-align:center;font-size:10px;">COL 2</div><div style="padding:8px;background:var(--aui-surface-subtle);text-align:center;font-size:10px;">COL 3</div></aui-grid></div>`,
        usage: {
            wc: `<aui-grid columns="3" gap="16px">\n  <div>Item 1</div><div>Item 2</div><div>Item 3</div>\n</aui-grid>`,
            react: `import { AdminGrid } from '@chaos_team/blbui-react'\n\n<AdminGrid columns={3} gap="16px">\n  <div>1</div><div>2</div><div>3</div>\n</AdminGrid>`,
            vue: `<AdminGrid :columns="3" gap="16px">\n  <div>1</div>\n</AdminGrid>`,
            svelte: `<aui-grid columns={3} gap="16px"></aui-grid>`,
        },
    },
    {
        id: "splitter",
        tag: "aui-splitter",
        name: "Splitter",
        category: "layout",
        description: "Draggable two-panel container for resizable master-detail workspaces.",
        status: "stable",
        props: ["direction", "initial", "min"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;height:70px;border:1px solid var(--aui-border);"><aui-splitter direction="horizontal" initial="50%"><div slot="first" style="padding:8px;font-size:10px;">LEFT VIEW</div><div slot="second" style="padding:8px;font-size:10px;">RIGHT VIEW</div></aui-splitter></div>`,
        usage: {
            wc: `<aui-splitter direction="horizontal" initial={50}>\n  <div slot="before">Panel A</div>\n  <div slot="after">Panel B</div>\n</aui-splitter>`,
            react: `import { AdminSplitter } from '@chaos_team/blbui-react'\n\n<AdminSplitter direction="horizontal" initial={50}>\n  <div slot="before">Panel A</div>\n  <div slot="after">Panel B</div>\n</AdminSplitter>`,
            vue: `<AdminSplitter direction="horizontal" initial="50%">\n  <template #first>Panel A</template>\n  <template #second>Panel B</template>\n</AdminSplitter>`,
            svelte: `<aui-splitter direction="horizontal" initial={50}></aui-splitter>`,
        },
    },
    {
        id: "shell",
        tag: "aui-shell",
        name: "Admin Shell",
        category: "layout",
        description: "Root layout orchestrating top header, sidebar rail and central viewport.",
        status: "stable",
        props: ["sidebar-width", "header-height"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;height:120px;border:1px solid var(--aui-border);overflow:hidden;"><aui-shell sidebar-width="90px"><div slot="header" style="padding:4px 8px;font-size:10px;font-weight:700;background:var(--aui-header);">SHELL HEADER</div><div style="padding:8px;font-size:10px;">MAIN CONTENT</div></aui-shell></div>`,
        usage: {
            wc: `<aui-shell sidebar-width="240px" header-height="56px">\n  <div slot="header">Header</div>\n  <aside slot="sidebar">Sidebar</aside>\n  <main>Main Content</main>\n</aui-shell>`,
            react: `import { AdminShell } from '@chaos_team/blbui-react'\n\n<AdminShell sidebarWidth="240px">\n  <main>Content</main>\n</AdminShell>`,
            vue: `<AdminShell sidebar-width="240px">\n  <main>Content</main>\n</AdminShell>`,
            svelte: `<aui-shell sidebar-width="240px"></aui-shell>`,
        },
    },
    {
        id: "page",
        tag: "aui-page",
        name: "Admin Page",
        category: "layout",
        description: "Standard console page view with title, subtitle and action button slots.",
        status: "stable",
        props: ["title", "description"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-page title="Upstream Channels" description="Configure intelligent routing policies"><div style="padding:8px 0;font-size:11px;color:var(--aui-text-secondary);">Child page content slot</div></aui-page></div>`,
        usage: {
            wc: `<aui-page title="Channels" description="Manage routes">\n  <span slot="actions"><aui-button variant="primary">Add</aui-button></span>\n  <div>Page Content</div>\n</aui-page>`,
            react: `import { AdminPage, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminPage\n  title="Channels"\n  description="Manage routes"\n  actions={<AdminButton variant="primary">Add</AdminButton>}\n>\n  <div>Page Content</div>\n</AdminPage>`,
            vue: `<AdminPage title="Channels" description="Manage routes">\n  <template #actions><AdminButton variant="primary">Add</AdminButton></template>\n  <div>Page Content</div>\n</AdminPage>`,
            svelte: `<aui-page title="Channels" description="Manage routes"></aui-page>`,
        },
    },
    {
        id: "page-header",
        tag: "aui-page-header",
        name: "Page Header",
        category: "layout",
        description: "Dedicated header strip with uppercase title, description and actions.",
        status: "stable",
        props: ["title", "description"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-page-header title="Audit Records" description="Real-time access log history"></aui-page-header></div>`,
        usage: {
            wc: `<aui-page-header title="Audit Records" description="Access log history"></aui-page-header>`,
            react: `import { AdminPageHeader } from '@chaos_team/blbui-react'\n\n<AdminPageHeader title="Audit Records" description="Access log history" />`,
            vue: `<AdminPageHeader title="Audit Records" description="Access log history" />`,
            svelte: `<aui-page-header title="Audit Records" description="Access log history"></aui-page-header>`,
        },
    },
    {
        id: "filter-bar",
        tag: "aui-filter-bar",
        name: "Filter Bar",
        category: "layout",
        description: "Horizontal command row docking search, status selectors and reset triggers.",
        status: "stable",
        props: [],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-filter-bar><aui-input placeholder="Filter channels..." style="flex:1;"></aui-input><aui-button size="compact">APPLY</aui-button></aui-filter-bar></div>`,
        usage: {
            wc: `<aui-filter-bar>\n  <aui-input placeholder="Filter channels..."></aui-input>\n  <aui-button size="compact">APPLY</aui-button>\n</aui-filter-bar>`,
            react: `import { AdminFilterBar, AdminInput, AdminButton } from '@chaos_team/blbui-react'\n\n<AdminFilterBar>\n  <AdminInput placeholder="Filter..." />\n  <AdminButton size="compact">APPLY</AdminButton>\n</AdminFilterBar>`,
            vue: `<AdminFilterBar>\n  <AdminInput placeholder="Filter..." />\n</AdminFilterBar>`,
            svelte: `<aui-filter-bar><aui-input placeholder="Filter..."></aui-input></aui-filter-bar>`,
        },
    },
    {
        id: "stat",
        tag: "aui-stat",
        name: "Stat",
        category: "layout",
        description: "Key performance indicator card with label, prominent number and unit.",
        status: "stable",
        props: ["label", "value", "unit", "trend"],
        events: [],
        previewHtml: `<aui-stat label="QUERY VOLUME" value="1.42M" unit="QPS" trend="+14.2%"></aui-stat>`,
        usage: {
            wc: `<aui-stat label="REQUESTS" value="1.42M" unit="QPS" trend="+14.2%"></aui-stat>`,
            react: `import { AdminStat } from '@chaos_team/blbui-react'\n\n<AdminStat label="REQUESTS" value="1.42M" unit="QPS" trend="+14.2%" />`,
            vue: `<AdminStat label="REQUESTS" value="1.42M" unit="QPS" trend="+14.2%" />`,
            svelte: `<aui-stat label="REQUESTS" value="1.42M" unit="QPS" trend="+14.2%"></aui-stat>`,
        },
    },
    {
        id: "aspect-ratio",
        tag: "aui-aspect-ratio",
        name: "Aspect Ratio",
        category: "layout",
        description: "Fixed dimensional ratio frame for media previews, graphs and diagrams.",
        status: "stable",
        props: ["ratio"],
        events: [],
        previewHtml: `<div style="width:180px;"><aui-aspect-ratio ratio="16/9"><div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--aui-header);font-size:10px;color:var(--aui-text-secondary);">16:9 RATIO</div></aui-aspect-ratio></div>`,
        usage: {
            wc: `<aui-aspect-ratio ratio="16/9">\n  <img src="chart.png" alt="Preview" />\n</aui-aspect-ratio>`,
            react: `import { AdminAspectRatio } from '@chaos_team/blbui-react'\n\n<AdminAspectRatio ratio="16/9">\n  <img src="chart.png" alt="Preview" />\n</AdminAspectRatio>`,
            vue: `<AdminAspectRatio ratio="16/9">\n  <img src="chart.png" alt="Preview" />\n</AdminAspectRatio>`,
            svelte: `<aui-aspect-ratio ratio="16/9"></aui-aspect-ratio>`,
        },
    },
    {
        id: "scroll-area",
        tag: "aui-scroll-area",
        name: "Scroll Area",
        category: "layout",
        description: "Custom scroll viewport with thin terminal scrollbar tokens.",
        status: "stable",
        props: ["orientation", "max-height"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-scroll-area max-height="70px"><div style="padding:8px;font-size:11px;color:var(--aui-text-secondary);">Trace event line 001<br>Trace event line 002<br>Trace event line 003<br>Trace event line 004<br>Trace event line 005</div></aui-scroll-area></div>`,
        usage: {
            wc: `<aui-scroll-area max-height="200px">\n  <div>Long scrolling list</div>\n</aui-scroll-area>`,
            react: `import { AdminScrollArea } from '@chaos_team/blbui-react'\n\n<AdminScrollArea maxHeight="200px">\n  <div>Long scrolling list</div>\n</AdminScrollArea>`,
            vue: `<AdminScrollArea max-height="200px">\n  <div>Long scrolling list</div>\n</AdminScrollArea>`,
            svelte: `<aui-scroll-area max-height="200px"></aui-scroll-area>`,
        },
    },

    {
        id: "menu",
        tag: "aui-menu",
        name: "Menu",
        category: "navigation",
        description:
            "Tokenized action and navigation menu with active, danger and shortcut states.",
        status: "stable",
        props: ["items", "value", "orientation", "compact"],
        events: ["aui-menu-select"],
        initKey: "menu",
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-menu id="preview-menu"></aui-menu></div>`,
        usage: {
            wc: `<aui-menu id="main-menu"></aui-menu>\n<script>\nmainMenu.items = [{ id: 'overview', label: 'Overview', icon: '⌂' }]\n</script>`,
            react: `import { AdminMenu } from '@chaos_team/blbui-react'\n\n<AdminMenu items={items} value="overview" onSelect={setSection} />`,
            vue: `<AdminMenu :items="items" v-model:value="section" @select="handleSelect" />`,
            svelte: `<aui-menu id="main-menu"></aui-menu>`,
        },
    },
    {
        id: "sidebar",
        tag: "aui-sidebar",
        name: "Sidebar",
        category: "layout",
        description:
            "Collapsible application rail with navigation, footer and responsive visibility state.",
        status: "stable",
        props: ["open", "title", "width", "close-label"],
        events: ["aui-open-change"],
        previewHtml: `<div style="height:190px;display:flex;overflow:hidden;"><aui-sidebar id="preview-sidebar" title="WORKSPACE" width="220px"><aui-menu id="preview-sidebar-menu"></aui-menu></aui-sidebar></div>`,
        usage: {
            wc: `<aui-sidebar title="Workspace" open>\n  <aui-menu></aui-menu>\n</aui-sidebar>`,
            react: `import { AdminSidebar, AdminMenu } from '@chaos_team/blbui-react'\n\n<AdminSidebar title="Workspace" open><AdminMenu items={items} /></AdminSidebar>`,
            vue: `<AdminSidebar title="Workspace" v-model:open="open"><AdminMenu :items="items" /></AdminSidebar>`,
            svelte: `<aui-sidebar title="Workspace" open><aui-menu></aui-menu></aui-sidebar>`,
        },
    },
    {
        id: "navbar",
        tag: "aui-navbar",
        name: "Navbar",
        category: "layout",
        description: "Sticky top navigation surface with brand, content and action slots.",
        status: "stable",
        props: ["title", "sticky", "bordered"],
        events: [],
        previewHtml: `<div style="width:100%;"><aui-navbar title="CONTROL PLANE" bordered><span slot="brand">BLBUI / OPS</span><span slot="actions"><aui-badge variant="success" dot>ONLINE</aui-badge></span></aui-navbar></div>`,
        usage: {
            wc: `<aui-navbar title="Control Plane" sticky bordered>\n  <span slot="actions">Actions</span>\n</aui-navbar>`,
            react: `import { AdminNavbar } from '@chaos_team/blbui-react'\n\n<AdminNavbar title="Control Plane" sticky actions={<AdminButton>Deploy</AdminButton>} />`,
            vue: `<AdminNavbar title="Control Plane" sticky><template #actions><AdminButton>Deploy</AdminButton></template></AdminNavbar>`,
            svelte: `<aui-navbar title="Control Plane" sticky bordered></aui-navbar>`,
        },
    },
    {
        id: "date-picker",
        tag: "aui-date-picker",
        name: "Date Picker",
        category: "forms",
        description: "Theme-aware date field with native compatibility and an optional fully themed calendar.",
        status: "stable",
        props: ["value", "min", "max", "label", "disabled", "picker"],
        events: ["aui-date-change", "aui-change"],
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-date-picker id="preview-date-picker" picker="custom" label="DEPLOY DATE" value="2026-09-07"></aui-date-picker></div>`,
        usage: {
            wc: `<aui-date-picker picker="custom" label="Deploy date" value="2026-09-07"></aui-date-picker>`,
            react: `import { AdminDatePicker } from '@chaos_team/blbui-react'\n\n<AdminDatePicker label="Deploy date" value="2026-09-07" onChange={setDate} />`,
            vue: `<AdminDatePicker label="Deploy date" v-model:value="date" />`,
            svelte: `<aui-date-picker label="Deploy date" value="2026-09-07"></aui-date-picker>`,
        },
    },
    {
        id: "time-picker",
        tag: "aui-time-picker",
        name: "Time Picker",
        category: "forms",
        description: "Theme-aware time field with native compatibility and an optional themed time panel.",
        status: "stable",
        props: ["value", "min", "max", "step", "label", "disabled", "picker"],
        events: ["aui-time-change", "aui-change"],
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-time-picker id="preview-time-picker" picker="custom" label="MAINTENANCE WINDOW" value="22:30" step="900"></aui-time-picker></div>`,
        usage: {
            wc: `<aui-time-picker picker="custom" label="Maintenance window" value="22:30" step="900"></aui-time-picker>`,
            react: `import { AdminTimePicker } from '@chaos_team/blbui-react'\n\n<AdminTimePicker label="Maintenance window" value="22:30" step={900} onChange={setTime} />`,
            vue: `<AdminTimePicker label="Maintenance window" v-model:value="time" :step="900" />`,
            svelte: `<aui-time-picker label="Maintenance window" value="22:30" step={900}></aui-time-picker>`,
        },
    },
    {
        id: "pin-input",
        tag: "aui-pin-input",
        name: "PIN Input",
        category: "forms",
        description: "Accessible one-time code input with focus movement and completion state.",
        status: "stable",
        props: ["length", "value", "masked", "label", "disabled"],
        events: ["aui-pin-change"],
        previewHtml: `<aui-pin-input length="6" value="42" label="VERIFICATION CODE"></aui-pin-input>`,
        usage: {
            wc: `<aui-pin-input length="6" label="Verification code"></aui-pin-input>`,
            react: `import { AdminPinInput } from '@chaos_team/blbui-react'\n\n<AdminPinInput length={6} label="Verification code" onChange={setCode} />`,
            vue: `<AdminPinInput :length="6" label="Verification code" v-model:value="code" />`,
            svelte: `<aui-pin-input length={6} label="Verification code"></aui-pin-input>`,
        },
    },
    {
        id: "descriptions",
        tag: "aui-descriptions",
        name: "Descriptions",
        category: "data",
        description: "Responsive label/value matrix for metadata, settings and resource details.",
        status: "stable",
        props: ["items", "columns", "bordered", "compact"],
        events: [],
        initKey: "descriptions",
        previewHtml: `<div style="width:100%;"><aui-descriptions id="preview-descriptions" columns="2"></aui-descriptions></div>`,
        usage: {
            wc: `<aui-descriptions id="resource-details" bordered></aui-descriptions>\n<script>\nresourceDetails.items = [{ label: 'REGION', value: 'us-east-1' }]\n</script>`,
            react: `import { AdminDescriptions } from '@chaos_team/blbui-react'\n\n<AdminDescriptions items={details} columns={2} />`,
            vue: `<AdminDescriptions :items="details" :columns="2" bordered />`,
            svelte: `<aui-descriptions id="resource-details" columns={2}></aui-descriptions>`,
        },
    },
    {
        id: "cascader",
        tag: "aui-cascader",
        name: "Cascader",
        category: "forms",
        description:
            "Hierarchical option picker for regions, resources and nested configuration paths.",
        status: "stable",
        props: ["options", "value", "placeholder", "disabled", "open", "searchable"],
        events: ["aui-cascader-change", "aui-open-change"],
        initKey: "cascader",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-cascader id="preview-cascader" searchable></aui-cascader></div>`,
        usage: {
            wc: `<aui-cascader id="region-picker" searchable></aui-cascader>\n<script>\nregionPicker.options = [{ value: 'cn', label: 'China', children: [{ value: 'cn-east', label: 'East' }] }]\n</script>`,
            react: `import { AdminCascader } from '@chaos_team/blbui-react'\n\n<AdminCascader options={regions} searchable onChange={(value) => setRegion(value)} />`,
            vue: `<AdminCascader :options="regions" searchable v-model:value="region" @change="handleRegion" />`,
            svelte: `import { AdminCascader } from '@chaos_team/blbui-svelte'\n\n<AdminCascader {options} searchable />`,
        },
    },
    {
        id: "transfer",
        tag: "aui-transfer",
        name: "Transfer",
        category: "forms",
        description:
            "Dual-list assignment control for moving users, permissions and resources between sets.",
        status: "stable",
        props: ["options", "values", "source-title", "target-title", "searchable", "disabled"],
        events: ["aui-transfer-change"],
        initKey: "transfer",
        previewHtml: `<div style="width:100%;"><aui-transfer id="preview-transfer" source-title="AVAILABLE" target-title="ASSIGNED"></aui-transfer></div>`,
        usage: {
            wc: `<aui-transfer id="permission-transfer" source-title="Available" target-title="Assigned"></aui-transfer>\n<script>\npermissionTransfer.options = permissions\n</script>`,
            react: `import { AdminTransfer } from '@chaos_team/blbui-react'\n\n<AdminTransfer options={permissions} values={assigned} onChange={setAssigned} />`,
            vue: `<AdminTransfer :options="permissions" v-model:values="assigned" source-title="Available" target-title="Assigned" />`,
            svelte: `import { AdminTransfer } from '@chaos_team/blbui-svelte'\n\n<AdminTransfer {options} bind:values />`,
        },
    },
    {
        id: "context-menu",
        tag: "aui-context-menu",
        name: "Context Menu",
        category: "overlay",
        description:
            "Keyboard-friendly right-click action menu with separators, shortcuts and safe dismissal.",
        status: "stable",
        props: ["items", "open", "x", "y", "label"],
        events: ["aui-menu-select", "aui-open-change"],
        initKey: "context-menu",
        previewHtml: `<div style="width:100%;"><aui-context-menu id="preview-context-menu"><button type="button" style="width:100%;padding:16px;border:1px dashed var(--aui-border);background:transparent;color:var(--aui-text-secondary);">RIGHT-CLICK THIS WORKSPACE</button></aui-context-menu></div>`,
        usage: {
            wc: `<aui-context-menu id="resource-menu">\n  <button>Right-click resource</button>\n</aui-context-menu>`,
            react: `import { AdminContextMenu } from '@chaos_team/blbui-react'\n\n<AdminContextMenu items={items} onSelect={handleAction}>\n  <button>Right-click resource</button>\n</AdminContextMenu>`,
            vue: `<AdminContextMenu :items="items" @select="handleAction"><button>Right-click resource</button></AdminContextMenu>`,
            svelte: `import { AdminContextMenu } from '@chaos_team/blbui-svelte'\n\n<AdminContextMenu {items}><button>Right-click resource</button></AdminContextMenu>`,
        },
    },
    {
        id: "hover-card",
        tag: "aui-hover-card",
        name: "Hover Card",
        category: "overlay",
        description:
            "Delayed pointer and focus preview for resource metadata without interrupting the workflow.",
        status: "stable",
        props: ["open", "title", "side", "delay", "close-delay"],
        events: ["aui-open-change"],
        previewHtml: `<aui-hover-card title="RESOURCE DETAILS"><span slot="trigger" class="demo-link">HOVER OR FOCUS RESOURCE</span><span slot="content">Region us-east-1 · 12 healthy nodes · 184ms p99</span></aui-hover-card>`,
        usage: {
            wc: `<aui-hover-card title="Resource details">\n  <button slot="trigger">Inspect</button>\n  <span slot="content">Healthy · 12 nodes</span>\n</aui-hover-card>`,
            react: `import { AdminHoverCard } from '@chaos_team/blbui-react'\n\n<AdminHoverCard title="Resource details" content={<span>Healthy · 12 nodes</span>}>\n  <button>Inspect</button>\n</AdminHoverCard>`,
            vue: `<AdminHoverCard title="Resource details"><template #trigger><button>Inspect</button></template><template #content>Healthy · 12 nodes</template></AdminHoverCard>`,
            svelte: `import { AdminHoverCard } from '@chaos_team/blbui-svelte'\n\n<AdminHoverCard title="Resource details"><button slot="trigger">Inspect</button><span slot="content">Healthy · 12 nodes</span></AdminHoverCard>`,
        },
    },
    {
        id: "notification-center",
        tag: "aui-notification-center",
        name: "Notification Center",
        category: "feedback",
        description:
            "Tokenized toast stack with placement, duration, dismiss and action events for global feedback.",
        status: "stable",
        props: ["notifications", "position", "max"],
        events: ["aui-notification-close", "aui-notification-action", "aui-notifications-change"],
        initKey: "notification-center",
        previewHtml: `<aui-notification-center id="preview-notification-center" position="bottom-right" style="position:relative;inset:auto;width:100%;pointer-events:auto;"></aui-notification-center>`,
        usage: {
            wc: `<aui-notification-center id="notifications"></aui-notification-center>\n<script>\nconst center = document.querySelector('#notifications')\nconst id = center.push({ title: 'Deploy complete', message: 'Production is healthy', variant: 'success' })\ncenter.dismiss(id)\n</script>`,
            react: `import { AdminNotificationCenter } from '@chaos_team/blbui-react'\n\n<AdminNotificationCenter notifications={notifications} onClose={dismiss} />`,
            vue: `<AdminNotificationCenter :notifications="notifications" position="top-right" @close="dismiss" />`,
            svelte: `import { AdminNotificationCenter } from '@chaos_team/blbui-svelte'\n\n<AdminNotificationCenter {notifications} />`,
        },
    },
    {
        id: "toast-manager",
        tag: "aui-toast-manager",
        name: "Toast Manager",
        category: "feedback",
        description:
            "Application-level toast queue with persistence and optional cross-tab synchronization.",
        status: "stable",
        props: ["items", "position", "max", "persist-key", "sync-tabs", "channel-name"],
        events: ["aui-toast-manager-change"],
        initKey: "toast-manager",
        previewHtml: `<div style="width:100%;min-height:150px;position:relative;"><aui-toast-manager id="preview-toast-manager" position="top-right" style="position:absolute;inset:0;width:100%;pointer-events:auto;"></aui-toast-manager></div>`,
        usage: {
            wc: `<aui-toast-manager id="notifications" persist-key="ops-notifications" sync-tabs></aui-toast-manager>\n<script>\nnotifications.push({ title: 'Deploy complete', message: 'Production is healthy', variant: 'success' })\n</script>`,
            react: `import { AdminToastManager } from '@chaos_team/blbui-react'\n\n<AdminToastManager items={items} persistKey="ops-notifications" syncTabs onChange={setItems} />`,
            vue: `<AdminToastManager v-model:items="items" persist-key="ops-notifications" sync-tabs />`,
            svelte: `import { AdminToastManager } from '@chaos_team/blbui-svelte/components'\n\n<AdminToastManager bind:items persistKey="ops-notifications" syncTabs />`,
        },
    },
    {
        id: "upload-list",
        tag: "aui-upload-list",
        name: "Upload List",
        category: "forms",
        description:
            "Manage selected files with status, progress, retry, preview and remove actions.",
        status: "stable",
        props: [
            "files",
            "removable",
            "retryable",
            "previewable",
            "compact",
            "disabled",
            "empty-label",
        ],
        events: [
            "aui-upload-change",
            "aui-upload-remove",
            "aui-upload-retry",
            "aui-upload-preview",
        ],
        initKey: "upload-list",
        previewHtml: `<div style="width:100%;max-width:420px;"><aui-upload-list id="preview-upload-list"></aui-upload-list></div>`,
        usage: {
            wc: `<aui-upload-list id="uploads"></aui-upload-list>\n<script>\nuploads.files = [{ id: 'cert-1', name: 'gateway.pem', size: 18420, status: 'success' }]\n</script>`,
            react: `import { AdminUploadList } from '@chaos_team/blbui-react'\n\n<AdminUploadList files={files} onRemove={removeFile} onPreview={previewFile} />`,
            vue: `<AdminUploadList v-model:files="files" @remove="removeFile" @preview="previewFile" />`,
            svelte: `import { AdminUploadList } from '@chaos_team/blbui-svelte'\n\n<AdminUploadList bind:files onRemove={removeFile} />`,
        },
    },
    {
        id: "file-preview",
        tag: "aui-file-preview",
        name: "File Preview",
        category: "data",
        description:
            "Modal preview surface for images, PDFs and file metadata with download hooks.",
        status: "stable",
        props: ["file", "open", "title", "close-label", "download-label", "downloadable"],
        events: ["aui-file-preview-close", "aui-file-download"],
        initKey: "file-preview",
        previewHtml: `<div style="width:100%;height:110px;"><aui-file-preview id="preview-file-preview"></aui-file-preview><button id="preview-file-open" type="button" style="padding:8px 12px;border:1px solid var(--aui-border);background:var(--aui-control-bg);color:var(--aui-text-secondary);font:10px var(--aui-font-mono);">OPEN FILE PREVIEW</button></div>`,
        usage: {
            wc: `<aui-file-preview id="preview"></aui-file-preview>\n<script>\npreview.file = { id: 'report', name: 'report.pdf', type: 'application/pdf', url: reportUrl }\npreview.open = true\n</script>`,
            react: `import { AdminFilePreview } from '@chaos_team/blbui-react'\n\n<AdminFilePreview file={file} open={open} onClose={() => setOpen(false)} />`,
            vue: `<AdminFilePreview :file="file" v-model:open="open" @download="downloadFile" />`,
            svelte: `import { AdminFilePreview } from '@chaos_team/blbui-svelte'\n\n<AdminFilePreview {file} bind:open onClose={() => open = false} />`,
        },
    },

    // -------------------------------------------------------------
    {
        id: "form",
        tag: "aui-form",
        name: "Form",
        category: "forms",
        description: "Accessible form shell with validation, loading and responsive actions.",
        status: "stable",
        props: ["layout", "loading", "submit-label", "reset-label", "show-actions"],
        events: ["aui-submit", "aui-invalid", "aui-reset"],
        previewHtml: `<div style="width:100%;max-width:360px;"><aui-form id="preview-form"><aui-form-item label="CHANNEL NAME" required><aui-input placeholder="production-gateway"></aui-input></aui-form-item></aui-form></div>`,
        usage: {
            wc: `<aui-form>
  <aui-form-item label="Channel name" required><aui-input name="channel"></aui-input></aui-form-item>
</aui-form>`,
            react: `import { AdminForm, AdminFormItem, AdminInput } from '@chaos_team/blbui-react'\n\n<AdminForm onSubmit={handleSubmit}>\n  <AdminFormItem label="Channel name" required><AdminInput /></AdminFormItem>\n</AdminForm>`,
            vue: `<AdminForm @submit="submit">\n  <AdminFormItem label="Channel name" required><AdminInput /></AdminFormItem>\n</AdminForm>`,
            svelte: `import { AdminForm } from '@chaos_team/blbui-svelte'\n\n<AdminForm onSubmit={handleSubmit}><aui-input /></AdminForm>`,
        },
    },
    {
        id: "form-item",
        tag: "aui-form-item",
        name: "Form Item",
        category: "forms",
        description: "Label, description and error semantics for any slotted form control.",
        status: "stable",
        props: ["label", "description", "error", "required", "name"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:320px;"><aui-form-item label="API TOKEN" description="Rotate every 90 days." required><aui-input placeholder="sk-live-..."></aui-input></aui-form-item></div>`,
        usage: {
            wc: `<aui-form-item label="API token" description="Rotate every 90 days." required>\n  <aui-input name="token"></aui-input>\n</aui-form-item>`,
            react: `import { AdminFormItem, AdminInput } from '@chaos_team/blbui-react'\n\n<AdminFormItem label="API token" description="Rotate every 90 days." required><AdminInput /></AdminFormItem>`,
            vue: `<AdminFormItem label="API token" description="Rotate every 90 days." required><AdminInput /></AdminFormItem>`,
            svelte: `<aui-form-item label="API token" required><aui-input /></aui-form-item>`,
        },
    },
    {
        id: "schema-form",
        tag: "aui-schema-form",
        name: "Schema Form",
        category: "forms",
        description:
            "Dependency-free form renderer for text, number, select, date and checkbox fields.",
        status: "stable",
        props: ["fields", "values", "layout", "loading", "submit-label", "reset-label"],
        events: ["aui-change", "aui-submit", "aui-reset"],
        initKey: "schema-form",
        previewHtml: `<div style="width:100%;max-width:360px;"><aui-schema-form id="preview-schema-form"></aui-schema-form></div>`,
        usage: {
            wc: `<aui-schema-form id="settings-form"></aui-schema-form>\n<script>\nsettingsForm.fields = fields\n</script>`,
            react: `import { AdminSchemaForm } from '@chaos_team/blbui-react'\n\n<AdminSchemaForm fields={fields} values={values} onSubmit={handleSubmit} />`,
            vue: `<AdminSchemaForm :fields="fields" v-model:values="values" @submit="submit" />`,
            svelte: `import { AdminSchemaForm } from '@chaos_team/blbui-svelte'\n\n<AdminSchemaForm {fields} bind:values onSubmit={handleSubmit} />`,
        },
    },
    {
        id: "progress-ring",
        tag: "aui-progress-ring",
        name: "Progress Ring",
        category: "primitives",
        description: "Circular progress for jobs, quotas and asynchronous enterprise workflows.",
        status: "stable",
        props: ["value", "max", "size", "stroke-width", "label", "show-value"],
        events: [],
        previewHtml: `<div class="demo-row"><aui-progress-ring value="72" label="DEPLOYMENT"></aui-progress-ring><aui-progress-ring value="34" size="64" show-value="false" label="QUOTA"></aui-progress-ring></div>`,
        usage: {
            wc: `<aui-progress-ring value="72" label="Deployment"></aui-progress-ring>`,
            react: `import { AdminProgressRing } from '@chaos_team/blbui-react'\n\n<AdminProgressRing value={72} label="Deployment" />`,
            vue: `<AdminProgressRing :value="72" label="Deployment" />`,
            svelte: `<AdminProgressRing value={72} label="Deployment" />`,
        },
    },
    {
        id: "truncated-text",
        tag: "aui-truncated-text",
        name: "Truncated Text",
        category: "feedback",
        description:
            "Line-clamped text that keeps the complete value available to users and assistive technology.",
        status: "stable",
        props: ["text", "lines", "label"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:260px;"><aui-truncated-text text="cluster-us-east-production-gateway-with-a-long-resource-name" lines="2"></aui-truncated-text></div>`,
        usage: {
            wc: `<aui-truncated-text text="A long resource name" lines="2"></aui-truncated-text>`,
            react: `import { AdminTruncatedText } from '@chaos_team/blbui-react'\n\n<AdminTruncatedText text={resource.name} lines={2} />`,
            vue: `<AdminTruncatedText :text="resource.name" :lines="2" />`,
            svelte: `<AdminTruncatedText text={resource.name} lines={2} />`,
        },
    },
    {
        id: "loading-overlay",
        tag: "aui-loading-overlay",
        name: "Loading Overlay",
        category: "feedback",
        description:
            "Blocking loading state that preserves the panel layout and exposes aria-busy.",
        status: "stable",
        props: ["open", "label", "fullscreen"],
        events: [],
        previewHtml: `<div style="width:100%;min-height:120px;"><aui-loading-overlay open label="SYNCING CONFIGURATION"><div style="padding:28px;color:var(--aui-text-secondary);font:11px var(--aui-font-mono);">Configuration panel content</div></aui-loading-overlay></div>`,
        usage: {
            wc: `<aui-loading-overlay open label="Syncing configuration">\n  <section>Panel content</section>\n</aui-loading-overlay>`,
            react: `import { AdminLoadingOverlay } from '@chaos_team/blbui-react'\n\n<AdminLoadingOverlay open label="Syncing configuration"><Panel /></AdminLoadingOverlay>`,
            vue: `<AdminLoadingOverlay v-model:open="loading" label="Syncing configuration"><Panel /></AdminLoadingOverlay>`,
            svelte: `<AdminLoadingOverlay open label="Syncing configuration"><Panel /></AdminLoadingOverlay>`,
        },
    },
    {
        id: "column-settings",
        tag: "aui-column-settings",
        name: "Column Settings",
        category: "data",
        description:
            "Column visibility menu designed to pair with DataGrid and dense operational tables.",
        status: "stable",
        props: ["columns", "visible-keys", "open", "title", "close-label"],
        events: ["aui-column-settings-change", "aui-open-change"],
        initKey: "column-settings",
        previewHtml: `<div style="width:100%;display:flex;justify-content:flex-end;"><aui-column-settings id="preview-column-settings"></aui-column-settings></div>`,
        usage: {
            wc: `<aui-column-settings id="columns"></aui-column-settings>\n<script>columns.columns = schema</script>`,
            react: `import { AdminColumnSettings } from '@chaos_team/blbui-react'\n\n<AdminColumnSettings columns={columns} visibleKeys={visibleKeys} onChange={setVisibleKeys} />`,
            vue: `<AdminColumnSettings :columns="columns" v-model:visible-keys="visibleKeys" />`,
            svelte: `import { AdminColumnSettings } from '@chaos_team/blbui-svelte'\n\n<AdminColumnSettings {columns} bind:visibleKeys />`,
        },
    },

    // BUSINESS (9)
    // -------------------------------------------------------------
    {
        id: "crud-page",
        tag: "aui-crud-page",
        name: "CRUD Page",
        category: "business",
        description: "Standard administration page orchestrating header, toolbar and dataset.",
        status: "stable",
        props: ["title", "description", "loading"],
        events: [],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-crud-page title="API Consumer Keys" description="Generate, monitor and revoke keys"></aui-crud-page></div>`,
        usage: {
            wc: `<aui-crud-page title="API Keys" description="Manage developer tokens"></aui-crud-page>`,
            react: `import { AdminCrudPage } from '@chaos_team/blbui-business-react'\n\n<AdminCrudPage title="API Keys" description="Manage developer tokens" />`,
            vue: `<AdminCrudPage title="API Keys" description="Manage developer tokens" />`,
            svelte: `<aui-crud-page title="API Keys" description="Manage developer tokens"></aui-crud-page>`,
        },
    },
    {
        id: "crud-toolbar",
        tag: "aui-crud-toolbar",
        name: "CRUD Toolbar",
        category: "business",
        description: "Search, filter, batch actions and export action bar for management lists.",
        status: "stable",
        props: ["selected", "search-placeholder", "loading"],
        events: ["aui-search", "aui-create", "aui-delete"],
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-crud-toolbar search-placeholder="Search records..."></aui-crud-toolbar></div>`,
        usage: {
            wc: `<aui-crud-toolbar search-placeholder="Filter channels..."></aui-crud-toolbar>`,
            react: `import { AdminCrudToolbar } from '@chaos_team/blbui-business-react'\n\n<AdminCrudToolbar searchPlaceholder="Filter channels..." onSearch={(value) => console.log(value)} />`,
            vue: `<AdminCrudToolbar search-placeholder="Filter channels..." @create="handleCreate" />`,
            svelte: `<aui-crud-toolbar search-placeholder="Filter channels..."></aui-crud-toolbar>`,
        },
    },
    {
        id: "advanced-table",
        tag: "aui-advanced-table",
        name: "Advanced Table",
        category: "business",
        description:
            "Enterprise table with built-in selection, column sorters, pagination and actions.",
        status: "stable",
        props: ["columns", "rows", "selectable", "loading", "error", "permission-denied", "empty-label", "error-label", "permission-denied-label", "retryable", "retry-label"],
        events: ["aui-selection-change", "aui-sort-change", "aui-retry"],
        initKey: "advanced-table",
        previewHtml: `<div class="async-preview" data-async-preview="advanced-table" style="width:100%;"><div class="async-preview-controls" aria-label="Advanced table async state preview"><span>STATE</span><button type="button" data-async-state="ready" class="is-active">READY</button><button type="button" data-async-state="loading">LOADING</button><button type="button" data-async-state="empty">EMPTY</button><button type="button" data-async-state="error">ERROR</button><button type="button" data-async-state="permission-denied">PERMISSION</button></div><aui-advanced-table id="preview-advanced-table" selectable><button slot="permission" type="button" data-async-request-access>REQUEST ACCESS</button></aui-advanced-table></div>`,
        usage: {
            wc: `<aui-advanced-table id="enterprise-table" selectable></aui-advanced-table>`,
            react: `import { AdminAdvancedTable } from '@chaos_team/blbui-business-react'\n\n<AdminAdvancedTable columns={columns} rows={rows} selectable onSelectionChange={(keys) => console.log(keys)} />`,
            vue: `<AdminAdvancedTable :columns="columns" :rows="rows" :selectable="true" />`,
            svelte: `<aui-advanced-table selectable></aui-advanced-table>`,
        },
    },
    {
        id: "form-builder",
        tag: "aui-form-builder",
        name: "Form Builder",
        category: "business",
        description: "Schema-driven dynamic form generator with validation and error reporting.",
        status: "stable",
        props: ["fields", "submit-label", "loading"],
        events: ["aui-submit"],
        initKey: "form-builder",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-form-builder id="preview-form-builder" submit-label="SAVE CONFIG"></aui-form-builder></div>`,
        usage: {
            wc: `<aui-form-builder id="schema-form" submit-label="SAVE CONFIG"></aui-form-builder>`,
            react: `import { AdminFormBuilder } from '@chaos_team/blbui-business-react'\n\n<AdminFormBuilder fields={formSchema} submitLabel="SAVE" onSubmit={handleSubmit} />`,
            vue: `<AdminFormBuilder :fields="formSchema" submit-label="SAVE" @submit="handleSubmit" />`,
            svelte: `<aui-form-builder submit-label="SAVE"></aui-form-builder>`,
        },
    },
    {
        id: "approval-timeline",
        tag: "aui-approval-timeline",
        name: "Approval Timeline",
        category: "business",
        description: "Enterprise multi-stage review flowchart indicating signer and stage status.",
        status: "stable",
        props: ["items", "active"],
        events: [],
        initKey: "approval-timeline",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-approval-timeline id="preview-approval-timeline" active="1"></aui-approval-timeline></div>`,
        usage: {
            wc: `<aui-approval-timeline id="flow-timeline" active="1"></aui-approval-timeline>`,
            react: `import { AdminApprovalTimeline } from '@chaos_team/blbui-business-react'\n\n<AdminApprovalTimeline items={approvalSteps} active={1} />`,
            vue: `<AdminApprovalTimeline :items="approvalSteps" :active="1" />`,
            svelte: `<aui-approval-timeline active={1}></aui-approval-timeline>`,
        },
    },
    {
        id: "metric-card",
        tag: "aui-metric-card",
        name: "Metric Card",
        category: "business",
        description: "Dashboard KPI card with title, large numeric value, delta trend and tone.",
        status: "stable",
        props: ["label", "value", "unit", "trend", "tone"],
        events: [],
        previewHtml: `<aui-metric-card label="INGRESS THROUGHPUT" value="4.82" unit="GB/s" trend="+8.4%" tone="success"></aui-metric-card>`,
        usage: {
            wc: `<aui-metric-card label="INGRESS" value="4.82" unit="GB/s" trend="+8.4%" tone="success"></aui-metric-card>`,
            react: `import { AdminMetricCard } from '@chaos_team/blbui-business-react'\n\n<AdminMetricCard label="INGRESS" value="4.82" unit="GB/s" trend="+8.4%" tone="success" />`,
            vue: `<AdminMetricCard label="INGRESS" value="4.82" unit="GB/s" trend="+8.4%" tone="success" />`,
            svelte: `<aui-metric-card label="INGRESS" value="4.82" unit="GB/s" trend="+8.4%" tone="success"></aui-metric-card>`,
        },
    },
    {
        id: "metric-grid",
        tag: "aui-metric-grid",
        name: "Metric Grid",
        category: "business",
        description: "Auto-responsive grid container tailored for uniform KPI card placement.",
        status: "stable",
        props: ["items", "columns"],
        events: [],
        initKey: "metric-grid",
        previewHtml: `<div style="width:100%;"><aui-metric-grid id="preview-metric-grid" columns="2"></aui-metric-grid></div>`,
        usage: {
            wc: `<aui-metric-grid id="kpi-grid" columns="4"></aui-metric-grid>`,
            react: `import { AdminMetricGrid } from '@chaos_team/blbui-business-react'\n\n<AdminMetricGrid items={kpis} columns={4} />`,
            vue: `<AdminMetricGrid :items="kpis" :columns="4" />`,
            svelte: `<aui-metric-grid columns={4}></aui-metric-grid>`,
        },
    },
    {
        id: "bar-chart",
        tag: "aui-bar-chart",
        name: "Bar Chart",
        category: "business",
        description: "Lightweight bar chart with themed hover and keyboard tooltips.",
        status: "stable",
        props: ["data", "height", "label", "show-tooltip"],
        events: ["aui-chart-point"],
        initKey: "bar-chart",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-bar-chart id="preview-bar-chart" height="90px" label="REQUEST DISTRIBUTION"></aui-bar-chart></div>`,
        usage: {
            wc: `<aui-bar-chart id="traffic-bars" height="160px" label="Requests/sec" show-tooltip></aui-bar-chart>`,
            react: `import { AdminBarChart } from '@chaos_team/blbui-business-react'\n\n<AdminBarChart data={chartData} height="160px" label="Requests/sec" onPoint={(detail) => console.log(detail)} />`,
            vue: `<AdminBarChart :data="chartData" height="160px" label="Requests/sec" />`,
            svelte: `<aui-bar-chart height="160px" label="Requests/sec"></aui-bar-chart>`,
        },
    },
    {
        id: "sparkline",
        tag: "aui-sparkline",
        name: "Sparkline",
        category: "business",
        description: "Inline micro trendline graph for table rows, cards and KPI headers.",
        status: "stable",
        props: ["values", "label", "color"],
        events: [],
        initKey: "sparkline",
        previewHtml: `<div style="width:100%;max-width:300px;"><aui-sparkline id="preview-sparkline" label="LATENCY (MS)" color="#10b981"></aui-sparkline></div>`,
        usage: {
            wc: `<aui-sparkline id="latency-sparkline" label="LATENCY (MS)" color="#10b981"></aui-sparkline>`,
            react: `import { AdminSparkline } from '@chaos_team/blbui-business-react'\n\n<AdminSparkline values={[18, 24, 30, 28, 22, 19, 16]} label="LATENCY (MS)" color="#10b981" />`,
            vue: `<AdminSparkline :values="[18, 24, 30, 28, 22, 19, 16]" label="LATENCY (MS)" color="#10b981" />`,
            svelte: `<aui-sparkline label="LATENCY (MS)" color="#10b981"></aui-sparkline>`,
        },
    },
    {
        id: "line-chart",
        tag: "aui-line-chart",
        name: "Line Chart",
        category: "business",
        description:
            "Theme-aware lightweight line chart with null-gap handling, multi-series legends and keyboard tooltips.",
        status: "stable",
        props: ["data", "series", "height", "label", "color", "show-points", "show-tooltip"],
        events: ["aui-chart-point"],
        initKey: "line-chart",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-line-chart id="preview-line-chart" height="90px" label="REQUESTS TREND"></aui-line-chart></div>`,
        usage: {
            wc: `<aui-line-chart id="requests-line" height="160px" label="Requests/sec"></aui-line-chart>`,
            react: `import { AdminLineChart } from '@chaos_team/blbui-business-react'\n\n<AdminLineChart data={lineData} height="160px" label="Requests/sec" onPoint={(detail) => console.log(detail)} />`,
            vue: `<aui-line-chart :data="lineData" height="160px" label="Requests/sec" />`,
            svelte: `<aui-line-chart data={lineData} height="160px" label="Requests/sec"></aui-line-chart>`,
        },
    },
    {
        id: "area-chart",
        tag: "aui-area-chart",
        name: "Area Chart",
        category: "business",
        description:
            "Theme-aware filled trend chart with shared multi-series domains, null-gap handling and keyboard tooltips.",
        status: "stable",
        props: ["data", "series", "height", "label", "color", "show-points", "show-tooltip"],
        events: ["aui-chart-point"],
        initKey: "area-chart",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-area-chart id="preview-area-chart" height="90px" label="CAPACITY TREND"></aui-area-chart></div>`,
        usage: {
            wc: `<aui-area-chart id="capacity-area" series={areaSeries} height="160px" label="Capacity"></aui-area-chart>`,
            react: `import { AdminAreaChart } from '@chaos_team/blbui-business-react'\n\n<AdminAreaChart series={areaSeries} height="160px" label="Capacity" onPoint={(detail) => console.log(detail)} />`,
            vue: `<aui-area-chart :series="areaSeries" height="160px" label="Capacity" />`,
            svelte: `<aui-area-chart series={areaSeries} height="160px" label="Capacity"></aui-area-chart>`,
        },
    },
    {
        id: "pie-chart",
        tag: "aui-pie-chart",
        name: "Pie Chart",
        category: "business",
        description:
            "Dependency-free proportional breakdown with donut, legend and keyboard tooltips.",
        status: "stable",
        props: ["data", "height", "label", "donut", "show-legend", "show-tooltip"],
        events: ["aui-chart-point"],
        initKey: "pie-chart",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-pie-chart id="preview-pie-chart" height="120px" label="TRAFFIC MIX" donut></aui-pie-chart></div>`,
        usage: {
            wc: `<aui-pie-chart id="traffic-mix" data={segments} donut label="Traffic mix"></aui-pie-chart>`,
            react: `import { AdminPieChart } from '@chaos_team/blbui-business-react'\n\n<AdminPieChart data={segments} donut label="Traffic mix" onPoint={(detail) => console.log(detail)} />`,
            vue: `<AdminPieChart :data="segments" :donut="true" label="Traffic mix" />`,
            svelte: `<aui-pie-chart data={segments} donut label="Traffic mix"></aui-pie-chart>`,
        },
    },
    {
        id: "gauge",
        tag: "aui-gauge",
        name: "Gauge",
        category: "business",
        description:
            "Accessible semicircular range meter for health, capacity and service objectives.",
        status: "stable",
        props: ["value", "min", "max", "height", "label", "unit", "color"],
        events: [],
        initKey: "gauge",
        previewHtml: `<div style="width:100%;max-width:340px;"><aui-gauge id="preview-gauge" height="120px" value="78" label="SLO" unit="%"></aui-gauge></div>`,
        usage: {
            wc: `<aui-gauge value="78" max="100" label="SLO" unit="%"></aui-gauge>`,
            react: `import { AdminGauge } from '@chaos_team/blbui-business-react'\n\n<AdminGauge value={78} max={100} label="SLO" unit="%" />`,
            vue: `<AdminGauge :value="78" :max="100" label="SLO" unit="%" />`,
            svelte: `<aui-gauge value={78} max={100} label="SLO" unit="%"></aui-gauge>`,
        },
    },
    {
        id: "tree-table",
        tag: "aui-tree-table",
        name: "Tree Table",
        category: "data",
        description: "Hierarchical table with expandable nodes, selection and responsive overflow.",
        status: "stable",
        props: ["columns", "nodes", "expanded", "selected", "selectable"],
        events: ["aui-tree-table-toggle", "aui-tree-table-select"],
        initKey: "tree-table",
        previewHtml: `<div style="width:100%;"><aui-tree-table id="preview-tree-table"></aui-tree-table></div>`,
        usage: {
            wc: `<aui-tree-table id="resource-tree"></aui-tree-table>`,
            react: `import { AdminTreeTable } from '@chaos_team/blbui-react'\n\n<AdminTreeTable columns={columns} nodes={nodes} selectable />`,
            vue: `<AdminTreeTable :columns="columns" :nodes="nodes" selectable />`,
            svelte: `import { AdminTreeTable } from '@chaos_team/blbui-svelte/components'\n\n<AdminTreeTable {columns} {nodes} selectable />`,
        },
    },
    {
        id: "list-view",
        tag: "aui-list-view",
        name: "List View",
        category: "data",
        description: "Selectable operational list with loading, empty and error state contracts.",
        status: "stable",
        props: ["items", "loading", "error", "permission-denied", "selectable", "selected-keys", "permission-denied-label", "retryable", "retry-label"],
        events: ["aui-list-view-select", "aui-retry"],
        initKey: "list-view",
        previewHtml: `<div style="width:100%;max-width:360px;"><aui-list-view id="preview-list-view"></aui-list-view></div>`,
        usage: {
            wc: `<aui-list-view id="alerts-list"></aui-list-view>`,
            react: `import { AdminListView } from '@chaos_team/blbui-react'\n\n<AdminListView items={items} onSelect={handleSelect} />`,
            vue: `<AdminListView :items="items" @select="handleSelect" />`,
            svelte: `<aui-list-view items={items}></aui-list-view>`,
        },
    },
    {
        id: "filter-builder",
        tag: "aui-filter-builder",
        name: "Filter Builder",
        category: "forms",
        description: "Schema-driven filter rows for reusable search and reporting panels.",
        status: "stable",
        props: [
            "fields",
            "filters",
            "max-rules",
            "max-depth",
            "add-label",
            "add-group-label",
            "clear-label",
            "apply-label",
        ],
        events: ["aui-filter-builder-change", "aui-filter-builder-submit"],
        initKey: "filter-builder",
        previewHtml: `<div style="width:100%;"><aui-filter-builder id="preview-filter-builder"></aui-filter-builder></div>`,
        usage: {
            wc: `<aui-filter-builder id="filters"></aui-filter-builder>`,
            react: `import { AdminFilterBuilder } from '@chaos_team/blbui-react'\n\n<AdminFilterBuilder fields={fields} onSubmit={runSearch} />`,
            vue: `<AdminFilterBuilder :fields="fields" @submit="runSearch" />`,
            svelte: `<aui-filter-builder fields={fields}></aui-filter-builder>`,
        },
    },
    {
        id: "query-builder",
        tag: "aui-query-builder",
        name: "Query Builder",
        category: "forms",
        description: "Composable ALL/ANY query conditions with a framework-neutral rule schema.",
        status: "stable",
        props: ["fields", "rules", "logic", "max-depth", "apply-label"],
        events: ["aui-query-change", "aui-query-submit"],
        initKey: "query-builder",
        previewHtml: `<div style="width:100%;"><aui-query-builder id="preview-query-builder"></aui-query-builder></div>`,
        usage: {
            wc: `<aui-query-builder id="query"></aui-query-builder>`,
            react: `import { AdminQueryBuilder } from '@chaos_team/blbui-react'\n\n<AdminQueryBuilder fields={fields} logic="and" onSubmit={runQuery} />`,
            vue: `<AdminQueryBuilder :fields="fields" logic="and" @submit="runQuery" />`,
            svelte: `<aui-query-builder fields={fields} logic="and"></aui-query-builder>`,
        },
    },
    {
        id: "form-wizard",
        tag: "aui-form-wizard",
        name: "Form Wizard",
        category: "business",
        description:
            "Linear or non-linear multi-step workflow with slotted content and completion events.",
        status: "stable",
        props: [
            "steps",
            "active",
            "completed",
            "linear",
            "next-label",
            "previous-label",
            "finish-label",
        ],
        events: ["aui-wizard-before-change", "aui-wizard-change", "aui-wizard-complete"],
        initKey: "form-wizard",
        previewHtml: `<div style="width:100%;"><aui-form-wizard id="preview-form-wizard"></aui-form-wizard></div>`,
        usage: {
            wc: `<aui-form-wizard id="wizard"></aui-form-wizard>\n<span slot="step-account">Account details</span>`,
            react: `import { AdminFormWizard } from '@chaos_team/blbui-business-react'\n\n<AdminFormWizard steps={steps} onComplete={handleComplete}>\n  <section slot="step-account">Account details</section>\n</AdminFormWizard>`,
            vue: `import { registerBusinessElements } from '@chaos_team/blbui-business/register'\n\nregisterBusinessElements()\n\n<aui-form-wizard :steps.prop="steps" @aui-wizard-complete="handleComplete"><span slot="step-account">Account details</span></aui-form-wizard>`,
            svelte: `<aui-form-wizard steps={steps} on:wizard-complete={handleComplete}><section slot="step-account">Account details</section></aui-form-wizard>`,
        },
    },
    {
        id: "permission-matrix",
        tag: "aui-permission-matrix",
        name: "Permission Matrix",
        category: "business",
        description: "Role/resource permission grid with read, write and admin levels.",
        status: "stable",
        props: ["roles", "resources", "permissions", "read-only", "empty-label"],
        events: ["aui-permission-change"],
        initKey: "permission-matrix",
        previewHtml: `<div style="width:100%;"><aui-permission-matrix id="preview-permission-matrix"></aui-permission-matrix></div>`,
        usage: {
            wc: `<aui-permission-matrix id="permissions"></aui-permission-matrix>`,
            react: `import { AdminPermissionMatrix } from '@chaos_team/blbui-business-react'\n\n<AdminPermissionMatrix roles={roles} resources={resources} permissions={permissions} onChange={savePermission} />`,
            vue: `import { registerBusinessElements } from '@chaos_team/blbui-business/register'\n\nregisterBusinessElements()\n\n<aui-permission-matrix :roles.prop="roles" :resources.prop="resources" :permissions.prop="permissions" @aui-permission-change="savePermission" />`,
            svelte: `<aui-permission-matrix roles={roles} resources={resources}></aui-permission-matrix>`,
        },
    },
    {
        id: "audit-log",
        tag: "aui-audit-log",
        name: "Audit Log",
        category: "business",
        description:
            "Filterable operational audit stream with loading, error and load-more states.",
        status: "stable",
        props: ["entries", "loading", "error", "permission-denied", "query", "status", "has-more", "permission-denied-label", "retryable", "retry-label"],
        events: ["aui-audit-filter-change", "aui-audit-load-more", "aui-retry"],
        initKey: "audit-log",
        previewHtml: `<div class="async-preview" data-async-preview="audit-log" style="width:100%;"><div class="async-preview-controls" aria-label="Audit log async state preview"><span>STATE</span><button type="button" data-async-state="ready" class="is-active">READY</button><button type="button" data-async-state="loading">LOADING</button><button type="button" data-async-state="empty">EMPTY</button><button type="button" data-async-state="error">ERROR</button><button type="button" data-async-state="permission-denied">PERMISSION</button></div><aui-audit-log id="preview-audit-log"><button slot="permission" type="button" data-async-request-access>REQUEST ACCESS</button></aui-audit-log></div>`,
        usage: {
            wc: `<aui-audit-log id="audit" has-more></aui-audit-log>`,
            react: `import { AdminAuditLog } from '@chaos_team/blbui-business-react'\n\n<AdminAuditLog entries={entries} hasMore onLoadMore={loadMore} />`,
            vue: `import { registerBusinessElements } from '@chaos_team/blbui-business/register'\n\nregisterBusinessElements()\n\n<aui-audit-log :entries.prop="entries" has-more @aui-audit-load-more="loadMore" />`,
            svelte: `<aui-audit-log entries={entries} hasMore on:audit-load-more={loadMore}></aui-audit-log>`,
        },
    },
    {
        id: "import-dialog",
        tag: "aui-import-dialog",
        name: "Import Dialog",
        category: "business",
        description:
            "CSV/JSON import workflow with validation, preview, loading and submit states.",
        status: "stable",
        props: ["open", "title", "accept", "max-size", "loading", "rows", "error"],
        events: ["aui-import-parse", "aui-import-submit", "aui-import-cancel"],
        initKey: "import-dialog",
        previewHtml: `<div style="width:100%;"><aui-import-dialog id="preview-import-dialog"></aui-import-dialog><button id="preview-import-open" type="button">OPEN IMPORT PREVIEW</button></div>`,
        usage: {
            wc: `<aui-import-dialog id="importer"></aui-import-dialog>\n<script>\nimporter.addEventListener('aui-import-submit', event => save(event.detail.rows))\nimporter.open = true\n</script>`,
            react: `import { AdminImportDialog } from '@chaos_team/blbui-business-react'\n\n<AdminImportDialog open onSubmit={saveRows} />`,
            vue: `import { registerBusinessElements } from '@chaos_team/blbui-business/register'\n\nregisterBusinessElements()\n\n<aui-import-dialog :open.prop="open" @aui-import-submit="saveRows" />`,
            svelte: `<aui-import-dialog bind:open on:aui-import-submit={saveRows}></aui-import-dialog>`,
        },
    },
    {
        id: "export-button",
        tag: "aui-export-button",
        name: "Export Button",
        category: "business",
        description:
            "Dependency-free CSV/JSON export trigger with a framework-neutral event contract.",
        status: "stable",
        props: ["data", "format", "filename", "label", "disabled", "loading"],
        events: ["aui-export"],
        initKey: "export-button",
        previewHtml: `<div style="width:100%;"><aui-export-button id="preview-export-button"></aui-export-button></div>`,
        usage: {
            wc: `<aui-export-button id="export" format="csv" filename="channels"></aui-export-button>`,
            react: `import { AdminExportButton } from '@chaos_team/blbui-business-react'\n\n<AdminExportButton data={rows} format="csv" filename="channels" />`,
            vue: `import { registerBusinessElements } from '@chaos_team/blbui-business/register'\n\nregisterBusinessElements()\n\n<aui-export-button :data.prop="rows" format="csv" />`,
            svelte: `<aui-export-button format="csv" filename="channels"></aui-export-button>`,
        },
    },
    {
        id: "bulk-actions-toolbar",
        tag: "aui-bulk-actions-toolbar",
        name: "Bulk Actions Toolbar",
        category: "business",
        description: "Selected-row summary and guarded batch actions for enterprise tables.",
        status: "stable",
        props: ["selected", "actions", "loading", "clear-label"],
        events: ["aui-bulk-action", "aui-bulk-clear"],
        initKey: "bulk-actions-toolbar",
        previewHtml: `<div style="width:100%;"><aui-bulk-actions-toolbar id="preview-bulk-actions"></aui-bulk-actions-toolbar></div>`,
        usage: {
            wc: `<aui-bulk-actions-toolbar id="bulk" selected="3"></aui-bulk-actions-toolbar>`,
            react: `import { AdminBulkActionsToolbar } from '@chaos_team/blbui-business-react'\n\n<AdminBulkActionsToolbar selected={selected.length} actions={actions} onAction={runAction} />`,
            vue: `import { registerBusinessElements } from '@chaos_team/blbui-business/register'\n\nregisterBusinessElements()\n\n<aui-bulk-actions-toolbar :selected="selected.length" :actions.prop="actions" />`,
            svelte: `<aui-bulk-actions-toolbar selected={selected.length} actions={actions}></aui-bulk-actions-toolbar>`,
        },
    },
];

export function initComponentDemo(root: HTMLElement): void {
    function setProp(selector: string, prop: string, val: unknown): void {
        const el = root.querySelector(selector) as (HTMLElement & Record<string, unknown>) | null;
        if (el) el[prop] = val;
    }

    function setAsyncState(preview: HTMLElement, state: string): void {
        const element = preview.querySelector<HTMLElement & Record<string, unknown>>(
            "aui-table, aui-data-grid, aui-advanced-table, aui-audit-log",
        );
        if (!element) return;
        const setFlag = (name: string, value: boolean) => {
            element[name] = value;
        };
        const rows = preview.dataset.asyncPreview;
        const stateRows: Record<string, unknown[]> = {
            "data-grid": [
                { id: "openai-gw", status: "ONLINE", p99: "184ms" },
                { id: "anthropic-gw", status: "ONLINE", p99: "210ms" },
                { id: "edge-gw", status: "DEGRADED", p99: "480ms" },
            ],
            "advanced-table": [
                { id: "rt-1", name: "chat-completions", qps: "14,200" },
                { id: "rt-2", name: "embeddings", qps: "8,450" },
            ],
            "audit-log": [
                {
                    id: "evt-1",
                    time: "10:42:03",
                    actor: "sec-bot",
                    action: "Permission changed",
                    target: "OPS / ROUTES",
                    status: "success",
                    details: "write → admin",
                },
                {
                    id: "evt-2",
                    time: "10:38:17",
                    actor: "operator",
                    action: "Policy updated",
                    target: "gateway-prod",
                    status: "warning",
                    details: "Approval required",
                },
            ],
        };
        if (rows === "table") {
            setFlag("loading", state === "loading");
            setFlag("empty", state === "empty");
            setFlag("error", state === "error");
            setFlag("permissionDenied", state === "permission-denied");
        } else {
            setFlag("loading", state === "loading");
            setFlag("error", state === "error");
            setFlag("permissionDenied", state === "permission-denied");
            if (state === "empty") element[rows === "audit-log" ? "entries" : "rows"] = [];
            else if (state === "ready") element[rows === "audit-log" ? "entries" : "rows"] = stateRows[rows ?? ""] ?? [];
        }
        preview.querySelectorAll<HTMLButtonElement>("[data-async-state]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.asyncState === state);
        });
        preview.querySelectorAll<HTMLElement>("[data-async-request-access]").forEach((button) => {
            button.hidden = state !== "permission-denied";
        });
    }

    root.querySelectorAll<HTMLElement>("[data-async-preview]").forEach((preview) => {
        preview.querySelectorAll<HTMLButtonElement>("[data-async-state]").forEach((button) => {
            button.addEventListener("click", () => setAsyncState(preview, button.dataset.asyncState ?? "ready"));
        });
        preview.querySelector("[data-async-request-access]")?.addEventListener("click", () => {
            setAsyncState(preview, "ready");
        });
        preview.querySelector("aui-table, aui-data-grid, aui-advanced-table, aui-audit-log")?.addEventListener("aui-retry", () => {
            setAsyncState(preview, "ready");
        });
        setAsyncState(preview, "ready");
    });

    // Forms
    setProp("#preview-select", "options", [
        { value: "openai", label: "OpenAI (GPT-4.1)" },
        { value: "anthropic", label: "Anthropic (Claude-3.7)" },
        { value: "gemini", label: "Google (Gemini-2.5)" },
    ]);
    setProp("#preview-combobox", "options", [
        { value: "openai", label: "OpenAI / Primary", description: "Priority route" },
        { value: "anthropic", label: "Anthropic / Failover", description: "Secondary route" },
        { value: "gemini", label: "Gemini / Edge", description: "Low latency route" },
    ]);
    setProp("#preview-multi-select", "options", [
        { value: "admin", label: "Administrator" },
        { value: "operator", label: "Cluster Operator" },
        { value: "viewer", label: "Auditor" },
    ]);
    setProp("#preview-multi-select", "values", ["operator"]);
    setProp("#preview-radio", "options", [
        { value: "round-robin", label: "Round Robin" },
        { value: "weighted", label: "Weighted Random" },
        { value: "active-standby", label: "Active / Standby" },
    ]);
    setProp("#preview-tag-input", "values", ["production", "us-east-1", "canary-10"]);
    setProp("#preview-date-picker", "value", "2026-09-07");
    setProp("#preview-time-picker", "value", "22:30");
    setProp("#preview-cascader", "options", [
        {
            value: "china",
            label: "China",
            children: [
                {
                    value: "east",
                    label: "East China",
                    children: [{ value: "sh", label: "Shanghai" }],
                },
                {
                    value: "north",
                    label: "North China",
                    children: [{ value: "bj", label: "Beijing" }],
                },
            ],
        },
        {
            value: "us",
            label: "United States",
            children: [
                { value: "east", label: "US East", children: [{ value: "va", label: "Virginia" }] },
            ],
        },
    ]);
    setProp("#preview-transfer", "options", [
        { value: "read", label: "Read access", description: "View resource state" },
        { value: "write", label: "Write access", description: "Modify configuration" },
        { value: "deploy", label: "Deploy access", description: "Release to production" },
        { value: "audit", label: "Audit access", description: "View immutable logs" },
    ]);
    setProp("#preview-transfer", "values", ["read", "audit"]);
    setProp("#preview-context-menu", "items", [
        { id: "inspect", label: "Inspect resource", shortcut: "⌘ I" },
        { id: "copy", label: "Copy resource ID", shortcut: "⌘ C" },
        { separator: true, id: "separator" },
        { id: "delete", label: "Delete resource", danger: true },
    ]);
    setProp("#preview-notification-center", "notifications", [
        {
            id: "deploy-complete",
            title: "Deploy complete",
            message: "Production route is healthy.",
            variant: "success",
            closable: true,
        },
    ]);
    setProp("#preview-upload-list", "files", [
        {
            id: "gateway-cert",
            name: "gateway.pem",
            size: 18420,
            type: "application/x-pem-file",
            status: "success",
        },
        {
            id: "route-schema",
            name: "route-schema.json",
            size: 8240,
            type: "application/json",
            status: "uploading",
            progress: 68,
        },
        {
            id: "failed-bundle",
            name: "edge-bundle.zip",
            size: 2840000,
            type: "application/zip",
            status: "error",
            error: "Upload timed out",
        },
    ]);
    root.querySelector("#preview-upload-list")?.addEventListener("aui-upload-preview", (event) => {
        const file = (event as CustomEvent<{ file?: unknown }>).detail?.file;
        const preview = root.querySelector<HTMLElement & Record<string, unknown>>(
            "#preview-file-preview",
        );
        if (preview && file) {
            preview.file = file;
            preview.open = true;
        }
    });
    setProp("#preview-file-preview", "file", {
        id: "route-schema",
        name: "route-schema.json",
        size: 8240,
        type: "application/json",
    });
    root.querySelector<HTMLButtonElement>("#preview-file-open")?.addEventListener("click", () => {
        const preview = root.querySelector<HTMLElement & Record<string, unknown>>(
            "#preview-file-preview",
        );
        if (preview) preview.open = true;
    });

    // Navigation
    setProp("#preview-toggle-group", "items", [
        { id: "day", label: "24H" },
        { id: "week", label: "7D" },
        { id: "month", label: "30D" },
    ]);
    setProp("#preview-segmented", "items", [
        { id: "overview", label: "Overview" },
        { id: "api", label: "API Keys" },
        { id: "logs", label: "Audit Logs" },
    ]);
    setProp("#preview-tabs", "items", [
        { id: "general", label: "General" },
        { id: "security", label: "Security" },
        { id: "billing", label: "Quota & Billing" },
    ]);
    setProp("#preview-breadcrumb", "items", [
        { label: "Home", href: "#" },
        { label: "Admin", href: "#" },
        { label: "Channels", href: "#" },
        { label: "us-east-cluster" },
    ]);
    setProp("#preview-breadcrumb", "maxItems", 3);
    setProp("#preview-nav", "items", [
        { id: "dash", label: "Dashboard", active: true },
        { id: "nodes", label: "Clusters & Nodes" },
        { id: "logs", label: "Event Stream" },
        { id: "settings", label: "System Settings" },
    ]);
    setProp("#preview-menu", "items", [
        { id: "overview", label: "Overview", icon: "⌂", shortcut: "⌘ 1" },
        { id: "activity", label: "Activity", icon: "↗", description: "Live operations" },
        { separator: true, id: "separator" },
        { id: "settings", label: "Settings", icon: "⚙" },
    ]);
    setProp("#preview-menu", "value", "overview");
    setProp("#preview-sidebar-menu", "items", [
        { id: "dash", label: "Dashboard", icon: "⌂" },
        { id: "nodes", label: "Clusters", icon: "◈" },
        { id: "logs", label: "Event Stream", icon: "≋" },
    ]);
    setProp("#preview-sidebar-menu", "value", "dash");
    setProp("#preview-descriptions", "items", [
        { label: "REGION", value: "us-east-1", description: "Primary" },
        { label: "STATUS", value: "ONLINE" },
        { label: "VERSION", value: "v0.0.18" },
        { label: "OWNER", value: "Platform Ops" },
    ]);
    setProp("#preview-accordion", "items", [
        {
            title: "Health Check Polling Interval",
            content: "Edge nodes poll upstream every 5s with 3 consecutive failure trips.",
        },
        {
            title: "Circuit Breaker Threshold",
            content: "Trips on 15% 5xx response rate within rolling 60s observation window.",
        },
    ]);
    setProp("#preview-stepper", "items", [
        { label: "Configure Upstream" },
        { label: "Validate SSL/TLS" },
        { label: "Deploy Canary" },
    ]);
    setProp("#preview-list", "items", [
        { id: "1", title: "cluster-us-east-prod", subtitle: "48 pods · 100% healthy" },
        { id: "2", title: "cluster-eu-west-prod", subtitle: "32 pods · 100% healthy" },
    ]);
    setProp("#preview-tree", "nodes", [
        {
            id: "root",
            label: "etc/chaos",
            children: [
                { id: "conf", label: "cluster.json" },
                { id: "tls", label: "certs", children: [{ id: "cert", label: "server.pem" }] },
            ],
        },
    ]);
    setProp("#preview-timeline", "items", [
        {
            title: "Canary Deployed",
            time: "10:42:01",
            status: "success",
            description: "v0.0.2 rolled out to 10% traffic",
        },
        {
            title: "Health Check Passed",
            time: "10:45:00",
            status: "success",
            description: "Zero 5xx detected in 60s",
        },
    ]);

    // Overlays
    setProp("#preview-dropdown", "items", [
        { id: "restart", label: "Restart Node" },
        { id: "flush", label: "Flush DNS Cache" },
        { id: "drain", label: "Drain Connections" },
    ]);
    setProp("#preview-command", "items", [
        { id: "1", label: "Reload Routing Table", category: "OPERATIONS" },
        { id: "2", label: "Rotate Upstream Token", category: "SECURITY" },
        { id: "3", label: "Export Audit Log", category: "DATA" },
    ]);

    // Dialog & Drawer open/close triggers
    root.querySelector("#btn-demo-dialog")?.addEventListener("click", () => {
        root.querySelector("#preview-dialog")?.setAttribute("open", "");
    });
    root.querySelector("#btn-close-demo-dialog")?.addEventListener("click", () => {
        root.querySelector("#preview-dialog")?.removeAttribute("open");
    });
    root.querySelector("#btn-demo-confirm")?.addEventListener("click", () => {
        root.querySelector("#preview-confirm")?.setAttribute("open", "");
    });
    root.querySelector("#preview-confirm")?.addEventListener("aui-confirm", () => {
        root.querySelector("#preview-confirm")?.removeAttribute("open");
    });
    root.querySelector("#preview-confirm")?.addEventListener("aui-cancel", () => {
        root.querySelector("#preview-confirm")?.removeAttribute("open");
    });
    root.querySelector("#btn-demo-drawer")?.addEventListener("click", () => {
        root.querySelector("#preview-drawer")?.setAttribute("open", "");
    });

    // Composed forms, async states and data-grid controls
    setProp("#preview-schema-form", "fields", [
        {
            name: "name",
            label: "CHANNEL NAME",
            type: "text",
            required: true,
            placeholder: "production",
        },
        {
            name: "region",
            label: "REGION",
            type: "select",
            options: [
                { value: "us-east", label: "US EAST" },
                { value: "eu-west", label: "EU WEST" },
            ],
        },
        { name: "timeout", label: "TIMEOUT (MS)", type: "number", value: 5000 },
    ]);

    // Data & Tables
    setProp("#preview-data-list", "items", [
        { label: "REGION", value: "us-east-1" },
        { label: "CLUSTER IP", value: "10.91.3.250" },
        { label: "HEALTH", value: "OPTIMAL" },
    ]);
    setProp("#preview-data-grid", "columns", [
        { key: "id", title: "TARGET", sortable: true, filterable: true },
        {
            key: "status",
            title: "HEALTH",
            filterable: true,
            filterOptions: [
                { value: "ONLINE", label: "ONLINE" },
                { value: "DEGRADED", label: "DEGRADED" },
            ],
        },
        { key: "p99", title: "P99", sortable: true, align: "right" },
    ]);
    setProp("#preview-data-grid", "rows", [
        { id: "openai-gw", status: "ONLINE", p99: "184ms" },
        { id: "anthropic-gw", status: "ONLINE", p99: "210ms" },
        { id: "edge-gw", status: "DEGRADED", p99: "480ms" },
    ]);
    setProp("#preview-data-grid", "selectable", true);
    setProp("#preview-data-grid", "batchActions", [
        { id: "archive", label: "ARCHIVE", danger: true },
    ]);
    setProp("#preview-column-settings", "columns", [
        { key: "id", label: "TARGET" },
        { key: "status", label: "HEALTH" },
        { key: "p99", label: "P99" },
    ]);
    setProp("#preview-json-viewer", "value", {
        clusterId: "us-east-01",
        activeNodes: 12,
        p99Latency: 184,
        tls: { version: "1.3", cipher: "AES_256_GCM" },
    });
    setProp("#preview-log-viewer", "entries", [
        "[10:42:01] [INFO] Ingress dispatch /v1/chat/completions",
        "[10:42:02] [DEBUG] Selected route: openai-primary-01",
        "[10:42:03] [INFO] Upstream response 200 OK - 184ms",
    ]);
    setProp("#preview-kanban", "columns", [
        {
            id: "todo",
            title: "PENDING",
            items: [{ id: "1", title: "Rotate Token", meta: "SECURITY" }],
        },
        {
            id: "doing",
            title: "ACTIVE",
            items: [{ id: "2", title: "Scale Edge Pods", meta: "INFRA" }],
        },
        {
            id: "done",
            title: "DONE",
            items: [{ id: "3", title: "v0.0.2 Release", meta: "RELEASE" }],
        },
    ]);
    setProp("#preview-tree-table", "columns", [
        { key: "label", label: "RESOURCE" },
        { key: "status", label: "STATUS" },
        { key: "owner", label: "OWNER" },
    ]);
    setProp("#preview-tree-table", "nodes", [
        {
            id: "root",
            label: "gateway-prod",
            status: "ONLINE",
            owner: "OPS",
            children: [
                { id: "route-a", label: "chat-completions", status: "ONLINE", owner: "PLATFORM" },
                { id: "route-b", label: "embeddings", status: "DEGRADED", owner: "DATA" },
            ],
        },
        { id: "edge", label: "edge-canary", status: "PENDING", owner: "RELEASE" },
    ]);
    setProp("#preview-tree-table", "selectable", true);
    setProp("#preview-list-view", "items", [
        {
            id: "alert-1",
            title: "Gateway latency elevated",
            description: "P99 exceeded 400ms in us-east-1",
            meta: "2 MIN AGO",
            status: "OPEN",
        },
        {
            id: "alert-2",
            title: "Certificate rotation complete",
            description: "All edge nodes acknowledged the new certificate",
            meta: "18 MIN AGO",
            status: "RESOLVED",
        },
    ]);
    setProp("#preview-chart-container", "legend", [
        { label: "ONLINE", color: "#10b981", value: "84%" },
        { label: "DEGRADED", color: "#f59e0b", value: "16%" },
    ]);
    setProp("#preview-chart-container", "tooltip", "P99 184 ms · us-east-1");
    setProp("#preview-toast-manager", "items", [
        {
            id: "toast-demo",
            title: "CONFIG PERSISTED",
            message: "Notification queue is synchronized.",
            variant: "success",
            duration: 0,
        },
    ]);
    const filterFields = [
        {
            key: "status",
            label: "STATUS",
            type: "select",
            options: [
                { value: "online", label: "ONLINE" },
                { value: "degraded", label: "DEGRADED" },
            ],
        },
        { key: "latency", label: "P99 LATENCY", type: "number" },
        { key: "created", label: "CREATED", type: "date" },
    ];
    setProp("#preview-filter-builder", "fields", filterFields);
    setProp("#preview-query-builder", "fields", filterFields);

    // Business
    setProp("#preview-advanced-table", "columns", [
        { key: "id", title: "ID" },
        { key: "name", title: "NAME" },
        { key: "qps", title: "QPS" },
    ]);
    setProp("#preview-advanced-table", "rows", [
        { id: "rt-1", name: "chat-completions", qps: "14,200" },
        { id: "rt-2", name: "embeddings", qps: "8,450" },
    ]);
    setProp("#preview-form-builder", "fields", [
        { name: "channelName", label: "Channel Name", type: "text", required: true },
        { name: "timeout", label: "Timeout (ms)", type: "number", required: true },
    ]);
    setProp("#preview-approval-timeline", "items", [
        { title: "Request Submitted", actor: "operator@internal", time: "10:00", status: "done" },
        { title: "Security Audit", actor: "sec-bot", time: "10:05", status: "current" },
        { title: "Production Deploy", actor: "Pending", time: "-", status: "pending" },
    ]);
    setProp("#preview-metric-grid", "items", [
        { label: "INGRESS", value: "4.82", unit: "GB/s", trend: "+8.4%" },
        { label: "LATENCY", value: "184", unit: "MS", trend: "-2.1%" },
    ]);
    setProp("#preview-bar-chart", "data", [
        { label: "00:00", value: 340 },
        { label: "04:00", value: 180 },
        { label: "08:00", value: 680 },
        { label: "12:00", value: 920 },
        { label: "16:00", value: 850 },
        { label: "20:00", value: 710 },
    ]);
    setProp("#preview-line-chart", "data", [
        { label: "00:00", value: 18 },
        { label: "04:00", value: 28 },
        { label: "08:00", value: null },
        { label: "12:00", value: 42 },
        { label: "16:00", value: 36 },
        { label: "20:00", value: 48 },
    ]);
    setProp("#preview-area-chart", "series", [
        {
            id: "capacity",
            label: "Capacity",
            color: "var(--aui-primary)",
            data: [
                { label: "00:00", value: 22 },
                { label: "04:00", value: 29 },
                { label: "08:00", value: null },
                { label: "12:00", value: 44 },
                { label: "16:00", value: 39 },
                { label: "20:00", value: 52 },
            ],
        },
        {
            id: "reserved",
            label: "Reserved",
            color: "var(--aui-info)",
            data: [
                { label: "00:00", value: 12 },
                { label: "04:00", value: 18 },
                { label: "08:00", value: 24 },
                { label: "12:00", value: null },
                { label: "16:00", value: 28 },
                { label: "20:00", value: 31 },
            ],
        },
    ]);
    setProp("#preview-pie-chart", "data", [
        { label: "EDGE", value: 42 },
        { label: "API", value: 31 },
        { label: "WORKER", value: 18 },
        { label: "OTHER", value: 9 },
    ]);
    setProp("#preview-gauge", "value", 78);
    setProp("#preview-sparkline", "values", [18, 22, 29, 25, 20, 17, 24, 18]);
    setProp("#preview-form-wizard", "steps", [
        { id: "account", label: "ACCOUNT", description: "Identity" },
        { id: "policy", label: "POLICY", description: "Access rules" },
        { id: "review", label: "REVIEW", description: "Confirm" },
    ]);
    setProp("#preview-permission-matrix", "roles", [
        { id: "admin", label: "ADMIN" },
        { id: "ops", label: "OPS" },
        { id: "viewer", label: "VIEWER" },
    ]);
    setProp("#preview-permission-matrix", "resources", [
        { id: "routes", label: "ROUTES", description: "Routing configuration" },
        { id: "audit", label: "AUDIT LOG", description: "Immutable events" },
    ]);
    setProp("#preview-permission-matrix", "permissions", {
        routes: { admin: "admin", ops: "write", viewer: "read" },
        audit: { admin: "admin", ops: "read", viewer: "none" },
    });
    setProp("#preview-audit-log", "entries", [
        {
            id: "evt-1",
            time: "10:42:03",
            actor: "sec-bot",
            action: "Permission changed",
            target: "OPS / ROUTES",
            status: "success",
            details: "write → admin",
        },
        {
            id: "evt-2",
            time: "10:38:17",
            actor: "operator",
            action: "Policy updated",
            target: "gateway-prod",
            status: "warning",
            details: "Approval required",
        },
    ]);
    setProp("#preview-export-button", "data", [
        { id: "gateway-prod", status: "ONLINE", region: "us-east-1" },
        { id: "gateway-canary", status: "DEGRADED", region: "eu-west-1" },
    ]);
    setProp("#preview-bulk-actions", "selected", 3);
    setProp("#preview-bulk-actions", "actions", [
        { id: "archive", label: "ARCHIVE" },
        { id: "rotate", label: "ROTATE TOKEN" },
        { id: "delete", label: "DELETE", danger: true },
    ]);
    root.querySelector("#preview-import-open")?.addEventListener("click", () => {
        root.querySelector<HTMLElement & Record<string, unknown>>(
            "#preview-import-dialog",
        )?.setAttribute("open", "");
    });
}
