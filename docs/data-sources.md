# Business data source contract

`@chaos_team/blbui-business` includes a small transport-neutral resource for
pages that load table, list or dashboard data. It keeps request state out of
component markup while preserving BLBUI's `loading`, `empty`, `error` and
`permission-denied` vocabulary.

```ts
import { AdminDataResource, createAdminFetchDataSource } from "@chaos_team/blbui-business";

type Service = { id: string; name: string };

const services = new AdminDataResource<Service>({
    loader: createAdminFetchDataSource<Service>({
        endpoint: ({ page, pageSize }) =>
            `/api/services?page=${page ?? 1}&pageSize=${pageSize ?? 25}`,
    }),
    retry: { maxRetries: 2, delayMs: 250, backoffMultiplier: 2 },
    cache: { ttlMs: 30_000, staleWhileRevalidate: true },
});

const unsubscribe = services.subscribe((snapshot) => {
    dataGrid.loading = snapshot.status === "loading";
    dataGrid.empty = snapshot.status === "empty";
    dataGrid.error = snapshot.status === "error";
    dataGrid.permissionDenied = snapshot.status === "permission-denied";
    dataGrid.rows = snapshot.rows;
});

await services.load({ page: 1, pageSize: 25 });
await services.retry(); // reuses the last request
services.clearCache(); // invalidate all cached pages after a mutation
unsubscribe();
services.dispose();
```

Starting a new load aborts the previous request, and stale responses cannot
overwrite the newest snapshot. HTTP `401` and `403` become non-retryable
`permission-denied`; transient `408`, `425`, `429` and `5xx` responses are
retryable by default. Set `retry.maxRetries` to enable bounded retries; the
delay grows by `backoffMultiplier` after each retry and is cancelled together
with the request. Custom loaders can throw `AdminDataError` to provide an
explicit status, code or retry policy.

`cache` is opt-in. The default request key includes query, page, page size,
cursor, sort and filters. A fresh cache hit completes without a network call;
`staleWhileRevalidate` publishes the cached page immediately and then refreshes
it. `retry()` always bypasses the cache, and `clearCache()` can invalidate all
entries or a custom-key entry after a mutation.

Cache behavior can be measured without coupling BLBUI to a telemetry SDK:

```ts
const stopCacheMetrics = services.subscribeCache((event) => {
    metrics.count(`blbui.data.cache.${event.type}`);
});

console.log(services.getCacheStats());
// { entries, hits, staleHits, misses, bypasses, writes, invalidations,
//   revalidations }

services.resetCacheStats();
stopCacheMetrics();
```

The equivalent `cache.onEvent` option is useful when the resource owns the
telemetry sink. Both hooks receive the normalized request and cache key where
available. Listener errors are swallowed so a failed metrics exporter cannot
change loading, retry, or recovery behavior.

## Request telemetry

Cache decisions and request lifecycle telemetry are separate contracts. Hosts
can subscribe to request events without installing a metrics SDK:

```ts
const stopTelemetry = services.subscribeTelemetry((event) => {
    metrics.observe(`blbui.data.${event.type}`, event.durationMs, {
        attempt: event.attempt,
        source: event.source,
        status: event.status,
    });
});

console.log(services.getTelemetryStats());
// { loads, retries, successes, errors, aborts }
```

The event sequence is `load-start` followed by `load-success`, `load-error`,
or `load-abort`; retryable failures add `load-retry` before the next loader
attempt. A fresh cache hit emits a success with `source: "cache"` and
`attempt: 0`; network successes use `source: "network"`. Events include a
monotonic request id, elapsed milliseconds, attempt number, status and safe
error fields. The original transport error/cause is never included.

Telemetry is privacy-safe by default: request objects and cache keys are
omitted. A host may opt in with `telemetry.includeRequest: true` only after
applying its own data-sensitivity policy. Both `telemetry.onEvent` and
`subscribeTelemetry()` isolate listener exceptions from request behavior, and
`getTelemetryStats()` can be reset independently with `resetTelemetryStats()`.

The four parity playgrounds display the last telemetry event and aggregate
counts for loads, retries, successes, errors and aborts. This is an example
of a host integration, not a bundled exporter; production applications should
forward only the fields approved by their observability policy.

Snapshot subscribers are isolated from one another: an exception thrown by a
`subscribe()` callback is swallowed after the snapshot has been stored, so one
view cannot prevent another framework binding from receiving the update. The
same isolation applies to the initial snapshot delivered by `subscribe()`.

`dispose()` cancels an active request and emits a final `load-abort` telemetry
event with `reason: "dispose"`; explicit `abort()` uses `reason: "abort"`, while
a newer `load()` uses `reason: "superseded"`. Calling `dispose()` more than once
is safe and does not emit duplicate lifecycle events.

The resource is framework-neutral. React can subscribe with
`useSyncExternalStore`, Vue with `onMounted`/`onBeforeUnmount`, Svelte with
`onMount`, and Web Components can update properties from the subscription.
The component layer remains responsible for rendering the state and emitting
`aui-retry`.

## Remote Combobox search

`aui-combobox` keeps remote option search framework-neutral. Set `search` (or
`onSearch` in a direct property binding) to a function that receives the query
and an `AbortSignal`; return an option array or update `options` yourself. A
new query aborts the previous search, stale results are ignored, and loading or
search errors are exposed through `loading`, `error`, `loading-label` and
`error-label`. `query`, `value` and `selected-label` can be controlled by the
host, while `name` enables `ElementInternals` form submission where supported.

```ts
const provider = document.querySelector("aui-combobox")!;
provider.search = async (query, { signal }) => {
    const response = await fetch(`/api/providers?q=${encodeURIComponent(query)}`, { signal });
    if (!response.ok) throw new Error("Provider search failed");
    return response.json();
};
provider.addEventListener("aui-query-change", (event) => {
    console.log((event as CustomEvent<{ query: string }>).detail.query);
});
```

The same options are framework-neutral. Keep one resource per page or data
scope, pass the snapshot to the framework binding, and keep cleanup in the
host lifecycle. React, Vue, Svelte and Web Components therefore share the same
pagination, retry/backoff and cache semantics rather than reimplementing them.

## Four-framework parity lifecycle

The React, Vue, Svelte and Web Components playgrounds use the same
`AdminDataResource` fixture rather than four mock implementations. Each host
subscribes before the initial load, maps the snapshot to the same component
properties, handles `aui-retry`, and releases both the subscription and the
resource on unmount/page hide.

The fixture deliberately exercises the same state sequence in every host:

| State               | Contract                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| `ready` / `loading` | rows remain controlled by the resource snapshot and loading is exposed to the table |
| `error`             | a transient 503 is retryable and keeps the error action visible                     |
| `permission-denied` | a 403 is non-retryable and uses the permission slot/label                           |
| recovery            | the host changes the fixture mode and calls `load()` or `retry()`                   |

The versioned parity fixture also enables `ttlMs: 30_000` with
`staleWhileRevalidate`. Each playground renders the same cache telemetry panel
from the resource itself: the latest event plus `entries`, `hits`, `staleHits`,
`misses`, `bypasses`, `writes`, `invalidations` and `revalidations`. The browser
contract checks the sequence `miss/write` on the first load, `hit` when refreshing
the ready mode, `bypass/write` through retry, and `invalidate` after clearing the
cache. This keeps cache instrumentation visible in the framework examples while
the production API remains optional and transport-neutral.

This keeps transport state out of page markup while making lifecycle leaks
observable in real browser parity checks. The Web Components host additionally
calls `unsubscribe()` and `resource.dispose()` from a one-shot `pagehide`
handler; framework hosts return the equivalent cleanup from their lifecycle
hooks.

## Vue 3 direct usage

The Vue binding can consume the same resource without a framework-specific
adapter. Keep the resource outside the template and map its snapshot to the
controlled component props:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { AdminDataGrid } from "@chaos_team/blbui-vue";
import { AdminDataResource, createAdminFetchDataSource } from "@chaos_team/blbui-business";

type Service = { id: string; name: string };
const rows = ref<Service[]>([]);
const state = ref("idle");
const resource = new AdminDataResource<Service>({
    loader: createAdminFetchDataSource({ endpoint: "/api/services" }),
});
let unsubscribe = () => undefined;

onMounted(() => {
    unsubscribe = resource.subscribe((snapshot) => {
        rows.value = snapshot.rows;
        state.value = snapshot.status;
    });
    void resource.load({ page: 1, pageSize: 25 });
});
onBeforeUnmount(() => {
    unsubscribe();
    resource.dispose();
});
</script>

<template>
    <AdminDataGrid
        :rows="rows"
        :loading="state === 'loading'"
        :error="state === 'error'"
        :permission-denied="state === 'permission-denied'"
        @retry="resource.retry()"
    />
</template>
```

## Svelte 5 direct usage

Svelte uses the same subscription lifecycle. The resource stays transport
neutral and the component receives ordinary reactive values:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { registerAdminElements } from '@chaos_team/blbui-svelte'
  import { AdminDataResource, createAdminFetchDataSource } from '@chaos_team/blbui-business'

  type Service = { id: string; name: string }
  let rows: Service[] = []
  let state = 'idle'
  const resource = new AdminDataResource<Service>({
    loader: createAdminFetchDataSource({ endpoint: '/api/services' }),
  })

  onMount(() => {
    registerAdminElements()
    const unsubscribe = resource.subscribe((snapshot) => {
      rows = snapshot.rows
      state = snapshot.status
    })
    void resource.load({ page: 1, pageSize: 25 })
    return () => {
      unsubscribe()
      resource.dispose()
    }
  })
</script>

<aui-data-grid
  {rows}
  loading={state === 'loading'}
  error={state === 'error'}
  permission-denied={state === 'permission-denied'}
  on:aui-retry={() => resource.retry()}
></aui-data-grid>
```
