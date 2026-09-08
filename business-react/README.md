# @chaos_team/blbui-business-react

Typed React bindings for `@chaos_team/blbui-business`.

The data adapter exports (`fromTable`, `getAdapterSelection`, and
`virtualizeRows`) are re-exported so React applications can keep table-runtime
code outside the component core.

```tsx
import { AdminMetricCard } from "@chaos_team/blbui-business-react";

<AdminMetricCard label="Requests" value="12.8K" unit="RPM" tone="success" />;
```
