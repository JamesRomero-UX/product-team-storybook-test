---
name: figma-visual-iterate
description: >
  Iteratively refine a Storybook story until it visually matches its Figma source 1:1.
  Use when the user says: "make this 1:1 with figma", "iterate until it matches",
  "fix the visual drift", "make the figma mockup pixel perfect", or after creating a
  figma-mockup story that needs visual refinement.
---

# figma-visual-iterate

Iterative visual comparison loop. Renders a Storybook story, captures a screenshot,
compares to the Figma source, identifies specific drift, applies code fixes, repeats
until the visual diff is acceptable.

## Prerequisites

- Storybook running at http://localhost:6007
- Playwright installed (pnpm add -D playwright; npx playwright install chromium)
- scripts/screenshot-story.mjs exists in the project
- Figma MCP available
- Figma desktop open with the target file

## Inputs

- Figma node ID (e.g. 2918:3010 for Left Nav Bar Open)
- Storybook story ID (e.g. figma-mockups-left-nav-bar--open)
- Story file path (e.g. src/figma-mockups/left-nav-bar/LeftNavBar.stories.tsx)
- Optional: max iterations (default 5), viewport size (default 1280×800)

## The Loop

### Iteration 0 — initial generation (skip if story already exists)

1. Call Figma MCP get_design_context for the Figma node — captures reference code, screenshot, asset URLs, metadata
2. Call get_variable_defs for exact token bindings
3. Generate first-pass story file using returned code as the base, replacing hardcoded values with atomic-ui CSS variables (oklch(var(--...)))
4. Save story file
5. Wait 2 seconds for Storybook hot reload

### Iteration N — refinement (loop)

1. **Capture Storybook render**:
   - Run: node scripts/screenshot-story.mjs <storyId> tmp/visual-iterate/render-N.png
   - Read the resulting PNG into context

2. **Capture Figma render**:
   - Call Figma MCP get_screenshot for the same node
   - Save to tmp/visual-iterate/figma-N.png if needed for visual reference

3. **Compare visually**:
   View both images and identify specific differences. Focus on:
   - Colours: any shade off? Compare each surface, text, border, icon
   - Spacing: padding, gaps, item heights, margins — measure relative to image dimensions
   - Typography: font size (looks bigger/smaller?), weight (heavier/lighter?), line-height
   - Icons: is each icon visually equivalent to the Figma one?
   - Layout: same item count? Same order? Same hierarchy?
   - Borders & radii: any visible difference?
   - Shadows & effects: present where Figma shows them?
   - States visible: hover/focus/active variants where Figma shows them?

   Express each difference as: "[Element]: [observed] vs [Figma target] — [proposed fix]"

4. **Generate code patches**:
   For each difference, write a minimal Edit operation on the story file. One change per difference. Use atomic-ui CSS variables for token references.

5. **Apply patches** to the story file.

6. **Wait** 2 seconds for Storybook hot reload.

7. **Loop or stop**:
   - If no significant differences remain → stop, mark success
   - If max iterations reached → stop, report remaining drift
   - Otherwise → next iteration

## Stopping Criteria

- No major visual differences identified in current iteration
- Max iterations reached (default 5; user can override)
- User cancels

## Output

When the loop completes, write a summary to the story file's docs comment:
- Number of iterations
- Major changes applied
- Final fidelity assessment (high/medium/low)
- Any remaining drift the iteration couldn't resolve (with reason)

Also embed the Figma screenshot in the story's docs panel as a reference image.

## Practical Tips

- Don't try to fix everything in one iteration. Make small targeted changes.
- Prefer atomic-ui CSS variables over hardcoded hex/px values.
- For icons, search @untitledui/icons by name; if no good match, document the substitution.
- For typography drift, default to Sora at the size class atomic-ui uses.
- For shadow drift, use Tailwind shadow utilities; if Figma uses a custom effect, approximate.
- Document every substitution and why in the story's docs panel.

## Example Invocation

User says: "Use figma-visual-iterate on the Left Nav Bar Open story. Figma node 2918:3010, story id figma-mockups-left-nav-bar--open."

Skill runs:
- Iteration 1: render, capture, compare, find 6 differences, fix
- Iteration 2: re-render, find 2 remaining differences, fix
- Iteration 3: re-render, no major differences → stop
- Output: "3 iterations. Achieved high visual fidelity. Remaining drift: subtle shadow on dropdown chevron is approximated (Figma uses custom blur effect not directly mappable to Tailwind)
