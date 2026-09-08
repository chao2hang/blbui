/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { cleanup as cleanupReact, render as renderReact, waitFor } from "@testing-library/react";
import { cleanup as cleanupSvelte, render as renderSvelte } from "@testing-library/svelte";
import { fireEvent as fireDomEvent } from "@testing-library/dom";
import { h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerAdminElements } from "../core/src/register";
import { AdminInput as ReactInput } from "../react/src/index";
import { AdminInput as VueInput } from "../vue/src/index";
import SvelteInput from "../svelte/src/components/Input.svelte";

type AuiInput = HTMLElement & { value: string };

function inputElement(root: ParentNode): AuiInput {
    const element =
        (root instanceof HTMLElement && root.matches("aui-input")
            ? root
            : root.querySelector("aui-input")) as AuiInput | null;
    if (!element) throw new Error("Expected an aui-input element");
    return element;
}

function emitInput(element: HTMLElement, value: string): void {
    element.dispatchEvent(
        new CustomEvent("aui-input", {
            bubbles: true,
            composed: true,
            detail: { value },
        }),
    );
}

afterEach(() => {
    cleanupReact();
    cleanupSvelte();
    document.body.innerHTML = "";
});

describe("framework bindings", () => {
    it("mounts React, synchronizes properties and forwards custom events", async () => {
        registerAdminElements();
        const onValueChange = vi.fn();
        const view = renderReact(<ReactInput value="first" onValueChange={onValueChange} />);
        const element = inputElement(view.container);

        await waitFor(() => expect(element.value).toBe("first"));
        view.rerender(<ReactInput value="second" onValueChange={onValueChange} />);
        await waitFor(() => expect(element.value).toBe("second"));
        emitInput(element, "third");
        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("third"));

        view.unmount();
        expect(view.container.querySelector("aui-input")).toBeNull();
    });

    it("mounts Vue, synchronizes properties and cleans up listeners", async () => {
        registerAdminElements();
        const wrapper = mount(VueInput, { props: { value: "first" } });
        const element = inputElement(wrapper.element);
        await nextTick();
        expect(element.value).toBe("first");

        await wrapper.setProps({ value: "second" });
        expect(element.value).toBe("second");
        emitInput(element, "third");
        await nextTick();
        expect(wrapper.emitted("value-change")?.at(-1)).toEqual(["third"]);

        wrapper.unmount();
        expect(document.querySelector("aui-input")).toBeNull();
    });

    it("mounts Svelte, synchronizes properties and forwards custom events", async () => {
        registerAdminElements();
        const onValueChange = vi.fn();
        const view = renderSvelte(SvelteInput, {
            props: { value: "first", onValueChange },
        });
        const element = inputElement(view.container);

        await waitFor(() => expect(element.value).toBe("first"));
        await view.rerender({ value: "second", onValueChange });
        await waitFor(() => expect(element.value).toBe("second"));
        emitInput(element, "third");
        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("third"));

        await view.unmount();
        expect(view.container.querySelector("aui-input")).toBeNull();
    });

    it("keeps the Svelte event contract compatible with DOM testing utilities", async () => {
        registerAdminElements();
        const onValueChange = vi.fn();
        const view = renderSvelte(SvelteInput, { props: { onValueChange } });
        const element = inputElement(view.container);
        await fireDomEvent(
            element,
            new CustomEvent("aui-input", { detail: { value: "from-dom" } }),
        );
        await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("from-dom"));
        await view.unmount();
    });
});
