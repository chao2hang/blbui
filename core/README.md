# @chaos_team/blbui-core

Framework-neutral industrial UI primitives built as Web Components.

```ts
import { registerAdminElements } from "@chaos_team/blbui-core/register";
import "@chaos_team/blbui-core/styles.css";

registerAdminElements();
```

```html
<aui-button variant="primary">Deploy New</aui-button>
<aui-status-tag status="success">Online</aui-status-tag>
```

All 78 components use the `--aui-*` design tokens. Interactive components emit structured `aui-*` CustomEvents (the full event table is in the repository README); display-only components such as `Badge`, `Avatar`, `Kbd` and `ColorTag` are passive.
