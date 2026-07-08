# Platform ask — Claude Design team

_Draft for James to send. Context: RiskSmart synced a new design system to Claude Design; two links in the "just works for anyone" chain are outside a builder's control._

---

**Subject:** Two Claude Design gaps blocking a "1:1 with our live app" design system

Hi team — we've synced our production design system (RiskSmart Components / Cloudscape,
project `41f173c8-bc0e-4dfd-90c9-a53a47cb3d99`) into Claude Design: 68 verified components,
app shell, page templates, brand guidelines, and an auto-injected agent guide. Components
render 1:1 with our live app. Two things we can't close from the builder side:

### 1. No way to set a design system as the org default
Our older "RiskSmart Design System" kit is still `is_default` and is the only one showing
in the picker. The new, correct project isn't registerable as default through any MCP tool
or builder-facing surface we can find. Teammates therefore start against the wrong kit
unless they manually switch.

**Ask:** a supported way (UI or API/MCP) to mark a given design-system project as the org
default and control what appears in the picker.

### 2. Agent doesn't reliably choose the render path our bundle needs
Our component bundle **externalizes React** — `window.React` must load before
`_ds_bundle.js` or `window.RiskSmart` never initializes. When the agent builds a `.dc.html`
screen, React isn't guaranteed to be present first, so the screen renders **blank** even
though the code and DS choice are correct. Building as a **React prototype** (React UMD →
bundle) works every time, but the agent doesn't consistently take that path.

**Ask (either would fix it):**
- Bind a React global for DS bundles that declare React as external, **or**
- Honor a per-design-system "build as React prototype" hint so the agent defaults to the
  working render path for this DS.

Happy to share the repo, the working reference prototype, and repro steps. Thanks!

---

## Repro / evidence to attach
- Working reference prototype (React path, renders): `Risk Register (working).html`
  https://claude.ai/design/p/ef4e4eb6-e609-4482-b4fa-482c1737522d?file=Risk+Register+(working).html
- DS project: https://claude.ai/design/p/41f173c8-bc0e-4dfd-90c9-a53a47cb3d99
- The blank-render case: a `.dc.html` build of the same screen with correct DS + code.
