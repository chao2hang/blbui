# Fixed-runner visual goldens

This directory is intentionally evidence-only until the first two fixed-runner
captures confirm stable fonts, browser version and native control rendering.

When promoted, keep PNGs in separate `windows-chromium/` and
`ubuntu-chromium/` directories. The filename contract is:

```text
{profile}-{viewport}-{theme}-{mode}-{scene}.png
```

Run `bun run visual:golden:check` before promotion. The Playwright matrix can
compare a profile by setting `VISUAL_MATRIX_GOLDEN_DIR` to that profile's
directory and `VISUAL_MATRIX_GOLDEN_REQUIRED=1`.
