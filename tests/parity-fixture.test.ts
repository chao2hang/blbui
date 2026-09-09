/*
Copyright (C) 2023-2026 Chaos
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License.
*/

import { describe, expect, it } from "vitest";
import { createParityAsyncResource } from "../examples/parity/data-resource";

describe("cross-framework parity data fixture", () => {
    it("exposes the same cache lifecycle used by every playground", async () => {
        const parity = createParityAsyncResource();
        const events: string[] = [];
        const unsubscribe = parity.resource.subscribeCache((event) => events.push(event.type));

        await parity.load();
        expect(parity.resource.getSnapshot().status).toBe("ready");
        expect(parity.resource.getCacheStats()).toMatchObject({
            entries: 1,
            misses: 1,
            writes: 1,
        });

        parity.setMode("error");
        await parity.load();
        expect(parity.resource.getSnapshot().status).toBe("error");

        parity.setMode("ready");
        await parity.retry();
        expect(parity.resource.getSnapshot().status).toBe("ready");
        expect(parity.resource.getCacheStats()).toMatchObject({
            bypasses: 1,
            writes: 2,
        });

        await parity.load();
        expect(parity.resource.getSnapshot().status).toBe("ready");
        expect(parity.resource.getCacheStats().hits).toBe(1);

        parity.clearCache();
        expect(parity.resource.getCacheStats()).toMatchObject({ entries: 0, invalidations: 1 });
        expect(events).toEqual(["miss", "write", "miss", "bypass", "write", "hit", "invalidate"]);

        unsubscribe();
        parity.resource.dispose();
    });
});
