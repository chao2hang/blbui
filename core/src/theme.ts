/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

export const adminThemes = [
    "obsidian",
    "rounded",
    "enterprise",
    "modern",
    "minimal",
    "premium",
    "chinese",
    "atmospheric",
    "glass",
] as const;

export type AdminThemeName = (typeof adminThemes)[number];
export type AdminThemeMode = "light" | "dark" | "auto";

export const adminThemeLabels: Record<AdminThemeName, string> = {
    obsidian: "Obsidian / 锐利",
    rounded: "Rounded / 圆角",
    enterprise: "Enterprise / 企业",
    modern: "Modern / 现代",
    minimal: "Minimal / 简约",
    premium: "Premium / 高级",
    chinese: "Chinese / 中国风",
    atmospheric: "Atmospheric / 氛围",
    glass: "Glass / 毛玻璃",
};

function themeTarget(target?: HTMLElement | Document): HTMLElement | null {
    if (target && typeof HTMLElement !== "undefined" && target instanceof HTMLElement) {
        return target;
    }
    if (target && "documentElement" in target) return target.documentElement;
    if (typeof document !== "undefined") return document.documentElement;
    return null;
}

export function setAdminTheme(
    target: HTMLElement | Document | undefined,
    theme: AdminThemeName,
    mode: AdminThemeMode = "dark",
): void {
    const element = themeTarget(target);
    if (!element) return;
    element.dataset.auiTheme = theme;
    element.dataset.auiMode = mode;
}

export function getAdminTheme(target?: HTMLElement | Document): {
    theme: AdminThemeName;
    mode: AdminThemeMode;
} {
    const element = themeTarget(target);
    const theme = element?.dataset.auiTheme;
    const mode = element?.dataset.auiMode;
    return {
        theme: adminThemes.includes(theme as AdminThemeName)
            ? (theme as AdminThemeName)
            : "obsidian",
        mode: mode === "light" || mode === "auto" ? mode : "dark",
    };
}

export function toggleAdminThemeMode(target?: HTMLElement | Document): AdminThemeMode {
    const element = themeTarget(target);
    const current = getAdminTheme(element ?? undefined);
    const mode: AdminThemeMode = current.mode === "light" ? "dark" : "light";
    setAdminTheme(element ?? undefined, current.theme, mode);
    return mode;
}
