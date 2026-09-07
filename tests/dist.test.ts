import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Smoke test against the BUILT bundles (not src). The src-based tests cannot
// catch bundler regressions: native ES2022 class fields use [[Define]]
// semantics and shadow Lit's reactive prototype accessors, which only breaks
// after the dist is produced with the wrong field semantics.
const distRegister = resolve(process.cwd(), "core", "dist", "register.js");

describe.runIf(existsSync(distRegister))("built core dist", () => {
  it("keeps Lit property reactivity after connect", async () => {
    const { registerAdminElements } = await import("../core/dist/register.js");
    registerAdminElements();

    const input = document.createElement("aui-input") as HTMLElement & {
      value: string;
      updateComplete: Promise<unknown>;
    };
    input.value = "first";
    document.body.append(input);
    await input.updateComplete;

    input.value = "second";
    await input.updateComplete;

    expect(input.shadowRoot?.querySelector("input")?.value).toBe("second");
    // A native class field would create an own data property that shadows
    // Lit's reactive accessor on the prototype.
    expect(Object.getOwnPropertyDescriptor(input, "value")).toBeUndefined();
  });

  it("keeps attribute reactivity after connect", async () => {
    const { registerAdminElements } = await import("../core/dist/register.js");
    registerAdminElements();

    const input = document.createElement("aui-input") as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    document.body.append(input);
    await input.updateComplete;

    input.setAttribute("placeholder", "hello");
    await input.updateComplete;

    expect(input.shadowRoot?.querySelector("input")?.placeholder).toBe("hello");
  });
});
