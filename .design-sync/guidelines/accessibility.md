# Accessibility

RiskSmart targets **WCAG 2.1 AA** — a baseline built into every component, not bolted on.

- **Real text, not images of text** — so it scales, reflows, and is read by assistive tech.
- **Left-align paragraphs**; reserve centring for short hero / empty-state lines; never justify.
- **Sentence case** — easier to scan and matches the copy style.
- **Contrast** — 4.5:1 for body text (use teal ink `#00857A` for teal text on white; **never** bright
  teal `#00E1D1` on white — it fails). 3:1 for borders, icons, focus states. Never signal state with
  colour alone — add a label or icon.
- **Semantic markup** — native `<button>`, `<a>`, real headings and lists; ARIA only to fill gaps.
  One `<h1>` per page; don't skip heading levels; tables use headers; fields associate labels, help
  and errors; live regions announce toasts and async validation.
- **Keyboard** — everything reachable/operable in logical tab order; visible **2px teal focus ring,
  2px offset**; modals trap focus, close on Escape, return focus to the trigger; skip link to main;
  animations short and respect `prefers-reduced-motion`; touch targets ≥ 24px.
