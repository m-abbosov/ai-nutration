# Design reference (do not treat as runnable code)

- `NutriAI.dc.html` — the original design prototype (custom `x-dc` template runtime, not
  React). Design tokens: `<style>` block near the top (CSS vars for both themes). Screen
  markup: search for `data-screen-label="..."` to jump to Dashboard / AI Chat / Meals /
  Progress / Profile / Settings / Login / Onboarding / Mobile. Copy/translations and mock
  data/interaction logic: the `<script type="text/x-dc" data-dc-script>` block at the
  bottom (`const T=...`, `const C=...`, `const M=...`, `const S=...`, `const MB=...`,
  `class Component extends DCLogic { ... }`).
- `support.js` — the generic `x-dc` runtime engine (template interpolation, control flow).
  Not app logic — safe to ignore when porting to React.
- `dashboard-preview.png` — a rendered screenshot of the Dashboard screen (dark theme,
  desktop) for quick visual reference.

See `/DESIGN_MAPPING.md` at the repo root for the screen → route → component → API
mapping derived from this reference.
