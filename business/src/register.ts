/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { defineOnce } from "@chaos_team/blbui-core";
import { AdminApprovalTimelineElement, AdminFormBuilderElement } from "./workflow";
import { AdminAdvancedTableElement, AdminCrudPageElement, AdminCrudToolbarElement } from "./crud";
import {
    AdminBarChartElement,
    AdminAreaChartElement,
    AdminGaugeElement,
    AdminLineChartElement,
    AdminMetricCardElement,
    AdminMetricGridElement,
    AdminPieChartElement,
    AdminSparklineElement,
} from "./analytics";
import {
    AdminAuditLogElement,
    AdminFormWizardElement,
    AdminPermissionMatrixElement,
} from "./enterprise";
import {
    AdminBulkActionsToolbarElement,
    AdminExportButtonElement,
    AdminImportDialogElement,
} from "./operations";

export function registerBusinessElements(): void {
    if (typeof customElements === "undefined") return;
    defineOnce("aui-crud-page", AdminCrudPageElement);
    defineOnce("aui-crud-toolbar", AdminCrudToolbarElement);
    defineOnce("aui-advanced-table", AdminAdvancedTableElement);
    defineOnce("aui-form-builder", AdminFormBuilderElement);
    defineOnce("aui-approval-timeline", AdminApprovalTimelineElement);
    defineOnce("aui-metric-card", AdminMetricCardElement);
    defineOnce("aui-metric-grid", AdminMetricGridElement);
    defineOnce("aui-bar-chart", AdminBarChartElement);
    defineOnce("aui-area-chart", AdminAreaChartElement);
    defineOnce("aui-pie-chart", AdminPieChartElement);
    defineOnce("aui-gauge", AdminGaugeElement);
    defineOnce("aui-line-chart", AdminLineChartElement);
    defineOnce("aui-sparkline", AdminSparklineElement);
    defineOnce("aui-form-wizard", AdminFormWizardElement);
    defineOnce("aui-permission-matrix", AdminPermissionMatrixElement);
    defineOnce("aui-audit-log", AdminAuditLogElement);
    defineOnce("aui-import-dialog", AdminImportDialogElement);
    defineOnce("aui-export-button", AdminExportButtonElement);
    defineOnce("aui-bulk-actions-toolbar", AdminBulkActionsToolbarElement);
}
