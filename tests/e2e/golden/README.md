# Fixed-runner visual goldens

The first two fixed-runner captures for 0.0.13 confirmed stable fonts, browser
version and native control rendering. The PNGs are now active profile-specific
goldens and are compared with pixel-exact policy in CI.

When promoted, keep PNGs in separate `windows-chromium/` and
`ubuntu-chromium/` directories. The filename contract is:

```text
{profile}-{viewport}-{theme}-{mode}-{scene}.png
```

Run `bun run visual:golden:check` before changing the contract. The Playwright
matrix compares a profile by setting `VISUAL_MATRIX_GOLDEN_DIR` to that
profile's directory and `VISUAL_MATRIX_GOLDEN_REQUIRED=1`.

To promote a reviewed fixed-runner artifact, set `VISUAL_MATRIX_PROFILE`,
`VISUAL_MATRIX_ARTIFACT_DIR` and `VISUAL_MATRIX_PROMOTE=1`, then run
`bun run visual:promote`. The script validates the complete 432-file manifest
and copies only pixel-different files, so a promotion remains auditable.
