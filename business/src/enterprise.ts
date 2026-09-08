/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { css, html } from "lit";
import { AdminElement } from "@chaos_team/blbui-core";

export interface AdminWizardStep {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export class AdminFormWizardElement extends AdminElement {
  static properties = {
    steps: { attribute: false },
    active: { type: String, reflect: true },
    completed: { attribute: false },
    linear: { type: Boolean, reflect: true },
    nextLabel: { type: String, attribute: "next-label" },
    previousLabel: { type: String, attribute: "previous-label" },
    finishLabel: { type: String, attribute: "finish-label" },
  };

  static styles = css`
    :host {
      display: block;
      min-width: 0;
    }
    .wizard {
      display: grid;
      gap: 18px;
    }
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .step-button {
      width: 100%;
      display: grid;
      grid-template-columns: 26px minmax(0, 1fr);
      gap: 8px;
      min-height: 54px;
      padding: 8px;
      border: 1px solid var(--aui-border);
      background: var(--aui-surface);
      color: var(--aui-text-secondary);
      cursor: pointer;
      text-align: left;
      font: inherit;
    }
    .step-button:hover:not(:disabled),
    .step-button[aria-current="step"] {
      border-color: var(--aui-focus);
      background: var(--aui-table-row-hover);
      color: var(--aui-text-primary);
    }
    .step-button:disabled {
      cursor: not-allowed;
      opacity: 0.42;
    }
    .number {
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border: 1px solid currentColor;
      color: var(--aui-text-muted);
      font: 700 10px/1 var(--aui-font-mono);
    }
    .step-button[aria-current="step"] .number,
    .step-button[data-complete="true"] .number {
      border-color: var(--aui-primary);
      background: var(--aui-primary);
      color: var(--aui-primary-content);
    }
    .step-title {
      display: block;
      overflow: hidden;
      color: inherit;
      font: 700 11px/1.2 var(--aui-font-mono);
      text-overflow: ellipsis;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .step-description {
      display: block;
      margin-top: 4px;
      overflow: hidden;
      color: var(--aui-text-muted);
      font: 10px/1.2 var(--aui-font-mono);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .content {
      min-width: 0;
      min-height: 120px;
      padding: 16px;
      border: 1px solid var(--aui-border);
      background: var(--aui-surface);
    }
    .fallback {
      color: var(--aui-text-muted);
      font: 11px/1.4 var(--aui-font-mono);
    }
    .actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .actions button {
      min-height: 34px;
      padding: 7px 12px;
      border: 1px solid var(--aui-border-hover);
      background: var(--aui-control-bg);
      color: var(--aui-text);
      cursor: pointer;
      font: 700 10px/1 var(--aui-font-mono);
      text-transform: uppercase;
    }
    .actions button:hover:not(:disabled) {
      border-color: var(--aui-focus);
      color: var(--aui-text-primary);
    }
    .actions button.primary {
      border-color: var(--aui-primary);
      background: var(--aui-primary);
      color: var(--aui-primary-content);
    }
    .actions button:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
    @media (max-width: 620px) {
      .steps {
        grid-template-columns: 1fr;
      }
      .step-button {
        min-height: 44px;
      }
    }
  `;

  steps: AdminWizardStep[] = [];
  active = "";
  completed: string[] = [];
  linear = true;
  nextLabel = "NEXT";
  previousLabel = "BACK";
  finishLabel = "FINISH";

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("steps")) {
      const first = this.steps.find((step) => !step.disabled);
      if (!this.active || !this.steps.some((step) => step.id === this.active)) this.active = first?.id ?? "";
    }
  }

  private indexOf(id = this.active): number {
    return this.steps.findIndex((step) => step.id === id);
  }

  private canEnter(index: number): boolean {
    if (index < 0 || index >= this.steps.length || this.steps[index].disabled) return false;
    if (!this.linear) return true;
    return index <= 0 || this.completed.includes(this.steps[index - 1].id) || index === this.indexOf();
  }

  private changeTo(id: string): void {
    const nextIndex = this.indexOf(id);
    if (!this.canEnter(nextIndex) || id === this.active) return;
    const detail = { from: this.active, to: id, index: nextIndex };
    if (!this.dispatchEvent(new CustomEvent("aui-wizard-before-change", { bubbles: true, composed: true, cancelable: true, detail }))) return;
    this.active = id;
    this.dispatchDetail("aui-wizard-change", detail);
  }

  private next(): void {
    const current = this.indexOf();
    const step = this.steps[current];
    if (!step) return;
    if (current < this.steps.length - 1) {
      this.completed = [...new Set([...this.completed, step.id])];
      const nextStep = this.steps.slice(current + 1).find((_, offset) => this.canEnter(current + 1 + offset));
      if (nextStep) {
        this.changeTo(nextStep.id);
      }
      return;
    }
    this.completed = [...new Set([...this.completed, step.id])];
    this.dispatchDetail("aui-wizard-complete", { id: step.id, completed: this.completed });
  }

  private previous(): void {
    const current = this.indexOf();
    for (let index = current - 1; index >= 0; index -= 1) {
      if (this.canEnter(index)) {
        this.changeTo(this.steps[index].id);
        return;
      }
    }
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const current = this.indexOf();
    const next = this.steps.slice(current + direction).findIndex((step) => !step.disabled);
    if (next < 0) return;
    const target = direction > 0 ? current + direction + next : current - 1 - next;
    this.changeTo(this.steps[target].id);
    event.preventDefault();
  }

  render() {
    const activeStep = this.steps[this.indexOf()];
    const currentIndex = this.indexOf();
    return html`<div class="wizard">
      <ol class="steps" @keydown=${this.onKeydown} aria-label="Form steps">
        ${this.steps.map(
          (step, index) => html`<li>
            <button
              class="step-button"
              type="button"
              aria-current=${step.id === this.active ? "step" : "false"}
              aria-label=${`${index + 1}. ${step.label}`}
              data-complete=${this.completed.includes(step.id) ? "true" : "false"}
              ?disabled=${!this.canEnter(index)}
              @click=${() => this.changeTo(step.id)}
            >
              <span class="number">${this.completed.includes(step.id) ? "✓" : index + 1}</span>
              <span><span class="step-title">${step.label}</span>${step.description ? html`<span class="step-description">${step.description}</span>` : null}</span>
            </button>
          </li>`,
        )}
      </ol>
      <section class="content" aria-live="polite" aria-label=${activeStep?.label ?? "Current step"}>
        ${activeStep ? html`<slot name=${`step-${activeStep.id}`}><div class="fallback">Provide content in slot="step-${activeStep.id}".</div></slot>` : html`<div class="fallback">NO STEPS CONFIGURED</div>`}
      </section>
      <div class="actions">
        <button type="button" @click=${this.previous} ?disabled=${currentIndex <= 0}>${this.previousLabel}</button>
        <button class="primary" type="button" @click=${this.next} ?disabled=${!activeStep}>${currentIndex >= this.steps.length - 1 ? this.finishLabel : this.nextLabel}</button>
      </div>
    </div>`;
  }
}

export interface AdminPermissionRole {
  id: string;
  label: string;
}

export interface AdminPermissionResource {
  id: string;
  label: string;
  description?: string;
}

export type AdminPermission = "none" | "read" | "write" | "admin";
export type AdminPermissionMap = Record<string, Record<string, AdminPermission>>;

const permissionOrder: AdminPermission[] = ["none", "read", "write", "admin"];

export class AdminPermissionMatrixElement extends AdminElement {
  static properties = {
    roles: { attribute: false },
    resources: { attribute: false },
    permissions: { attribute: false },
    readOnly: { type: Boolean, attribute: "read-only", reflect: true },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  static styles = css`
    :host { display: block; min-width: 0; }
    .frame { overflow-x: auto; border: 1px solid var(--aui-border); background: var(--aui-bg); }
    table { width: 100%; min-width: 620px; border-collapse: collapse; color: var(--aui-text); font: 11px/1.3 var(--aui-font-mono); }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--aui-border); text-align: left; }
    th { background: var(--aui-header); color: var(--aui-text-secondary); font-weight: 500; text-transform: uppercase; }
    th:not(:first-child), td:not(:first-child) { text-align: center; }
    .resource { color: var(--aui-text-primary); font-weight: 700; }
    .description { display: block; margin-top: 3px; color: var(--aui-text-muted); font-size: 10px; font-weight: 400; }
    .permission { min-width: 68px; padding: 5px 7px; border: 1px solid var(--aui-border); background: var(--aui-control-bg); color: var(--aui-text-secondary); cursor: pointer; font: 700 9px/1 var(--aui-font-mono); text-transform: uppercase; }
    .permission[data-value="read"] { border-color: var(--aui-info); color: var(--aui-info); }
    .permission[data-value="write"] { border-color: var(--aui-warning); color: var(--aui-warning); }
    .permission[data-value="admin"] { border-color: var(--aui-success); color: var(--aui-success); }
    .permission:hover:not(:disabled), .permission:focus-visible { border-color: var(--aui-focus); color: var(--aui-text-primary); outline: none; box-shadow: var(--aui-focus-ring); }
    .permission:disabled { cursor: not-allowed; opacity: .55; }
    .state { min-height: 100px; display: grid; place-items: center; color: var(--aui-text-muted); }
  `;

  roles: AdminPermissionRole[] = [];
  resources: AdminPermissionResource[] = [];
  permissions: AdminPermissionMap = {};
  readOnly = false;
  emptyLabel = "NO PERMISSION SUBJECTS";

  private value(resourceId: string, roleId: string): AdminPermission {
    return this.permissions[resourceId]?.[roleId] ?? "none";
  }

  private cycle(resourceId: string, roleId: string): void {
    if (this.readOnly) return;
    const current = this.value(resourceId, roleId);
    const permission = permissionOrder[(permissionOrder.indexOf(current) + 1) % permissionOrder.length];
    this.permissions = {
      ...this.permissions,
      [resourceId]: { ...(this.permissions[resourceId] ?? {}), [roleId]: permission },
    };
    this.dispatchDetail("aui-permission-change", {
      resourceId,
      roleId,
      permission,
      permissions: this.permissions,
    });
    this.requestUpdate();
  }

  render() {
    if (!this.resources.length || !this.roles.length) return html`<div class="frame"><div class="state" role="status">${this.emptyLabel}</div></div>`;
    return html`<div class="frame"><table>
      <thead><tr><th scope="col">RESOURCE</th>${this.roles.map((role) => html`<th scope="col">${role.label}</th>`)}</tr></thead>
      <tbody>${this.resources.map((resource) => html`<tr>
        <th scope="row"><span class="resource">${resource.label}</span>${resource.description ? html`<span class="description">${resource.description}</span>` : null}</th>
        ${this.roles.map((role) => { const value = this.value(resource.id, role.id); return html`<td><button class="permission" type="button" data-value=${value} aria-label=${`${resource.label}, ${role.label}: ${value}`} ?disabled=${this.readOnly} @click=${() => this.cycle(resource.id, role.id)}>${value}</button></td>`; })}
      </tr>`)}</tbody>
    </table></div>`;
  }
}

export interface AdminAuditEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  status?: "success" | "warning" | "danger" | "info";
  details?: string;
}

export class AdminAuditLogElement extends AdminElement {
  static properties = {
    entries: { attribute: false },
    loading: { type: Boolean, reflect: true },
    error: { type: Boolean, reflect: true },
    query: { type: String },
    status: { type: String },
    emptyLabel: { type: String, attribute: "empty-label" },
    loadingLabel: { type: String, attribute: "loading-label" },
    errorLabel: { type: String, attribute: "error-label" },
    hasMore: { type: Boolean, attribute: "has-more", reflect: true },
  };

  static styles = css`
    :host { display: block; min-width: 0; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    input, select, button { min-height: 32px; box-sizing: border-box; border: 1px solid var(--aui-border); background: var(--aui-control-bg); color: var(--aui-text); font: 11px/1.2 var(--aui-font-mono); }
    input, select { min-width: 150px; padding: 7px 8px; }
    select { padding-right: 34px; appearance: none; -webkit-appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--aui-text-muted) 50%), linear-gradient(135deg, var(--aui-text-muted) 50%, transparent 50%); background-position: calc(100% - 13px) 50%, calc(100% - 9px) 50%; background-repeat: no-repeat; background-size: 4px 4px; }
    select::-ms-expand { display: none; }
    button { padding: 7px 10px; cursor: pointer; }
    button:hover:not(:disabled), input:focus, select:focus { border-color: var(--aui-focus); box-shadow: var(--aui-focus-ring); outline: none; }
    button:disabled { cursor: not-allowed; opacity: .45; }
    .frame { overflow-x: auto; border: 1px solid var(--aui-border); background: var(--aui-bg); }
    table { width: 100%; min-width: 680px; border-collapse: collapse; color: var(--aui-text); font: 11px/1.35 var(--aui-font-mono); }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--aui-border); text-align: left; vertical-align: top; }
    th { background: var(--aui-header); color: var(--aui-text-secondary); font-weight: 500; text-transform: uppercase; }
    .actor, .target { color: var(--aui-text-primary); font-weight: 700; }
    .details { display: block; margin-top: 3px; color: var(--aui-text-muted); font-size: 10px; }
    .status { font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .status-success { color: var(--aui-success); } .status-warning { color: var(--aui-warning); } .status-danger { color: var(--aui-danger); } .status-info { color: var(--aui-info); }
    .state { min-height: 100px; display: grid; place-items: center; color: var(--aui-text-muted); }
    .error { color: var(--aui-danger); }
    .more { display: flex; justify-content: center; padding-top: 10px; }
  `;

  entries: AdminAuditEntry[] = [];
  loading = false;
  error = false;
  query = "";
  status = "";
  emptyLabel = "NO AUDIT EVENTS";
  loadingLabel = "LOADING AUDIT EVENTS...";
  errorLabel = "FAILED TO LOAD AUDIT EVENTS";
  hasMore = false;

  private filter(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (target.name === "query") this.query = target.value;
    else this.status = target.value;
    this.dispatchDetail("aui-audit-filter-change", { query: this.query, status: this.status });
    this.requestUpdate();
  }

  private loadMore(): void {
    this.dispatchDetail("aui-audit-load-more", { query: this.query, status: this.status });
  }

  render() {
    const query = this.query.trim().toLowerCase();
    const entries = this.entries.filter((entry) => {
      const matchesStatus = !this.status || entry.status === this.status;
      const haystack = `${entry.actor} ${entry.action} ${entry.target} ${entry.details ?? ""}`.toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
    const content = this.loading
      ? html`<div class="state" role="status" aria-live="polite">${this.loadingLabel}</div>`
      : this.error
        ? html`<div class="state error" role="alert">${this.errorLabel}</div>`
        : !entries.length
          ? html`<div class="state" role="status">${this.emptyLabel}</div>`
          : html`<table><thead><tr><th>TIME</th><th>ACTOR</th><th>ACTION</th><th>TARGET</th><th>STATUS</th></tr></thead><tbody>
              ${entries.map((entry) => html`<tr><td>${entry.time}</td><td><span class="actor">${entry.actor}</span></td><td>${entry.action}${entry.details ? html`<span class="details">${entry.details}</span>` : null}</td><td><span class="target">${entry.target}</span></td><td><span class=${`status status-${entry.status ?? "info"}`}>${entry.status ?? "info"}</span></td></tr>`)}
            </tbody></table>`;
    return html`<div class="toolbar"><input name="query" type="search" placeholder="SEARCH AUDIT LOG" aria-label="Search audit log" .value=${this.query} @input=${this.filter} /><select name="status" aria-label="Filter audit status" .value=${this.status} @change=${this.filter}><option value="">ALL STATUS</option><option value="success">SUCCESS</option><option value="warning">WARNING</option><option value="danger">DANGER</option><option value="info">INFO</option></select></div><div class="frame">${content}</div>${this.hasMore ? html`<div class="more"><button type="button" @click=${this.loadMore} ?disabled=${this.loading}>LOAD MORE</button></div>` : null}`;
  }
}
