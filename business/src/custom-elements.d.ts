/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

declare global {
    interface HTMLElementTagNameMap {
        "aui-crud-page": import("./crud").AdminCrudPageElement;
        "aui-crud-toolbar": import("./crud").AdminCrudToolbarElement;
        "aui-advanced-table": import("./crud").AdminAdvancedTableElement;
        "aui-form-builder": import("./workflow").AdminFormBuilderElement;
        "aui-approval-timeline": import("./workflow").AdminApprovalTimelineElement;
        "aui-metric-card": import("./analytics").AdminMetricCardElement;
        "aui-metric-grid": import("./analytics").AdminMetricGridElement;
        "aui-bar-chart": import("./analytics").AdminBarChartElement;
        "aui-area-chart": import("./analytics").AdminAreaChartElement;
        "aui-pie-chart": import("./analytics").AdminPieChartElement;
        "aui-gauge": import("./analytics").AdminGaugeElement;
        "aui-line-chart": import("./analytics").AdminLineChartElement;
        "aui-sparkline": import("./analytics").AdminSparklineElement;
        "aui-form-wizard": import("./enterprise").AdminFormWizardElement;
        "aui-permission-matrix": import("./enterprise").AdminPermissionMatrixElement;
        "aui-audit-log": import("./enterprise").AdminAuditLogElement;
        "aui-import-dialog": import("./operations").AdminImportDialogElement;
        "aui-export-button": import("./operations").AdminExportButtonElement;
        "aui-bulk-actions-toolbar": import("./operations").AdminBulkActionsToolbarElement;
    }
}

export {};
