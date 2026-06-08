import{j as e}from"./iframe-CGUFCU7f.js";import{c as o}from"./utils-DCYm8U2k.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";const m=`.atomic-ui {
  /* PRIMITIVE TOKENS */

  /* Fonts */
  font-family: 'Sora', system-ui, sans-serif;

  /* Font Sizes */
  --font-size-xs: 0.5rem; /* 8px */
  --font-size-sm: 0.625rem; /* 10px */
  --font-size-base: 0.75rem; /* 12px */
  --font-size-lg: 0.875rem; /* 14px */
  --font-size-xl: 1rem; /* 16px */
  --font-size-2xl: 1.125rem; /* 18px */
  --font-size-3xl: 1.25rem; /* 20px */
  --font-size-4xl: 1.5rem; /* 24px */
  --font-size-5xl: 1.875rem; /* 30px */
  --font-size-6xl: 2.25rem; /* 36px */

  /* Line Heights */
  --line-height-1: 0.8rem; /* 12.8px - xs */
  --line-height-2: 1rem; /* 16px - sm */
  --line-height-3: 1.2rem; /* 19.2px - base */
  --line-height-4: 1.3125rem; /* 21px - lg */
  --line-height-5: 1.5rem; /* 24px - xl */
  --line-height-6: 1.6875rem; /* 27px - 2xl */
  --line-height-7: 1.75rem; /* 28px - 3xl */
  --line-height-8: 2.1rem; /* 33.6px - 4xl */
  --line-height-9: 2.4375rem; /* 39px - 5xl */
  --line-height-10: 2.925rem; /* 46.8px - 6xl */

  /* Colours */
  --color-primary-900: 0.2176 0.0717 278.64; /* #14143A */
  --color-primary-800: 0.2628 0.0712 280.32; /* #1F1F46 */
  --color-primary-700: 0.3171 0.0669 281.89; /* #2D2D53 */
  --color-primary-600: 0.4049 0.0551 283.66; /* #454566 */
  --color-primary-500: 0.4862 0.0463 284.53; /* #5C5C79 */
  --color-primary-400: 0.5878 0.0609 284.36; /* #7878A0 */
  --color-primary-300: 0.7177 0.0245 285.72; /* #A2A2B3 */
  --color-primary-200: 0.8603 0.0124 286.01; /* #D0D0D9 */
  --color-primary-100: 0.9321 0.0054 285.97; /* #E8E8EC */

  --color-secondary-900: 0.6661 0.1126 185.8; /* #1AAA9E */
  --color-secondary-800: 0.7364 0.1123 190.61; /* #3BC0BA */
  --color-secondary-700: 0.8044 0.1256 186.63; /* #41D9CC */
  --color-secondary-600: 0.8313 0.1162 188.3; /* #5CE0D6 */
  --color-secondary-500: 0.8645 0.1005 188.41; /* #7DE8DF */
  --color-secondary-400: 0.8934 0.078 189.87; /* #9EEDE7 */
  --color-secondary-300: 0.9182 0.058 190.9; /* #B8F1ED */
  --color-secondary-200: 0.9513 0.0353 192.36; /* #D5F7F5 */
  --color-secondary-100: 0.976 0.0169 192.64; /* #EBFBFA */

  --color-neutral-900: 0.1893 0.0589 279.19; /* #0F0F2D */
  --color-neutral-800: 0.4276 0.0147 248.21; /* #495057 */
  --color-neutral-700: 0.4049 0.0551 283.66; /* #454566 */
  --color-neutral-600: 0.4862 0.0463 284.53; /* #5C5C79 */
  --color-neutral-500: 0.7177 0.0245 285.72; /* #A2A2B3 */
  --color-neutral-400: 0.8603 0.0124 286.01; /* #D0D0D9 */
  --color-neutral-300: 0.9321 0.0054 285.97; /* #E8E8EC */
  --color-neutral-200: 0.9475 0.0068 286; /* #EDEDF2 */
  --color-neutral-100: 0.9832 0.0054 285.95; /* #F9F9FD */
  --color-neutral-000: 1 0 none; /* #FFFFFF */

  --color-destructive-900: 0.5199 0.1809 33.26; /* #BA2E0F */
  --color-destructive-800: 0.5754 0.2089 26.87; /* #D92B2B */
  --color-destructive-700: 0.6729 0.1512 21.94; /* #E46B6B */
  --color-destructive-600: 0.7143 0.1283 20.75; /* #E88080 */
  --color-destructive-500: 0.7584 0.1053 19.78; /* #EC9595 */
  --color-destructive-400: 0.8045 0.0828 19; /* #F0AAAA */
  --color-destructive-300: 0.8519 0.0611 18.36; /* #F4BFBF */
  --color-destructive-200: 0.9015 0.038 17.78; /* #F7D5D5 */
  --color-destructive-100: 0.9505 0.0185 17.25; /* #FBEAEA */

  --color-warning-900: 0.7712 0.1446 66.18; /* #F2A041 */
  --color-warning-800: 0.8134 0.1207 68.59; /* #F5B367 */
  --color-warning-700: 0.8358 0.1067 70; /* #F6BD7A */
  --color-warning-600: 0.8569 0.0919 70.33; /* #F7C68D */
  --color-warning-500: 0.8795 0.0773 69.7; /* #F9CFA0 */
  --color-warning-400: 0.9035 0.0619 70.85; /* #FAD9B3 */
  --color-warning-300: 0.9279 0.0464 72.43; /* #FBE3C6 */
  --color-warning-200: 0.9508 0.0305 72.15; /* #FCECD9 */
  --color-warning-100: 0.9747 0.0153 67.56; /* #FEF5EC */

  --color-success-900: 0.6055 0.1688 135.97; /* #4E971A */
  --color-success-800: 0.7023 0.1433 133.9; /* #79B250 */
  --color-success-700: 0.7201 0.1292 133.65; /* #83B65F */
  --color-success-600: 0.7611 0.1132 133.02; /* #95C175 */
  --color-success-500: 0.8001 0.0937 132.41; /* #A7CB8C */
  --color-success-400: 0.8387 0.0744 132.42; /* #B8D5A3 */
  --color-success-300: 0.8803 0.0561 132.17; /* #CAE0BA */
  --color-success-200: 0.9407 0.0294 132.72; /* #E4F0DC */
  --color-success-100: 0.9606 0.0191 133.27; /* #EDF5E8 */

  /* SEMANTIC TOKENS */
  --primary: var(--color-primary-900);
  --primary-hover: var(--color-primary-600);
  --primary-active: var(--color-secondary-700);
  --primary-foreground: var(--color-neutral-000);
  --primary-foreground-hover: var(--color-neutral-000);
  --primary-foreground-active: var(--color-primary-900);
  --primary-minimal: var(--color-primary-100);

  --secondary: var(--color-secondary-700);
  --secondary-hover: var(--color-secondary-800);
  --secondary-active: var(--color-secondary-900);
  --secondary-focus: var(--color-secondary-400);
  --secondary-foreground: var(--color-primary-900);
  --secondary-foreground-hover: var(--color-neutral-000);
  --secondary-foreground-active: var(--color-neutral-000);
  --secondary-minimal: var(--color-secondary-100);

  --neutral: var(--color-neutral-000);
  --neutral-hover: var(--color-neutral-300);
  --neutral-active: var(--color-neutral-500);
  --neutral-foreground: var(--color-primary-900);
  --neutral-foreground-hover: var(--color-primary-900);
  --neutral-foreground-active: var(--color-primary-900);
  --neutral-border: var(--color-neutral-400);
  --neutral-border-hover: var(--color-neutral-400);
  --neutral-minimal: var(--color-neutral-100);

  --muted: var(--color-neutral-300);
  --muted-foreground: var(--color-neutral-500);
  --muted-foreground-hover: var(--color-neutral-600);
  --muted-minimal: var(--color-neutral-100);

  --destructive: var(--color-destructive-800);
  --destructive-foreground: var(--color-neutral-000);
  --destructive-hover: var(--color-destructive-900);
  --destructive-minimal: var(--color-destructive-100);

  --warning: var(--color-warning-800);
  --warning-hover: var(--color-warning-900);
  --warning-foreground: var(--color-primary-900);
  --warning-minimal: var(--color-warning-100);

  --success: var(--color-success-900);
  --success-foreground: var(--color-neutral-000);
  --success-minimal: var(--color-success-100);
}

@layer base {
  .story-tile-group {
    @apply flex flex-wrap gap-4 mx-8 items-center justify-center;
  }

  .story-tile {
    @apply flex flex-col flex-grow items-center gap-y-4 min-w-24;
  }

  .story-page {
    @apply max-w-7xl p-6 m-auto bg-neutral rounded-xl shadow-xs;
  }
}
`,d=/--(color-(\w+)-(\w+)):\s*([^;/]+)/g,p=/--(?!color-)(\w[\w-]*):\s*var\(--(color-[\w-]+)\)/g;function u(t){const r={};for(const n of t.matchAll(d)){const s=n[2],a=n[3];r[s]??=[],r[s].push(a)}return Object.fromEntries(Object.entries(r).map(([n,s])=>[n,{shades:s,cssVar:a=>`--color-${n}-${a}`}]))}function v(t){const r={};for(const n of t.matchAll(p)){const s=n[1],a=n[2],i=s.split("-")[0];r[i]??=[],r[i].push({token:`--${s}`,primitive:`--${a}`})}return r}const x=u(m),g=v(m);function f({cssVar:t,label:r,size:n="md"}){const s=n==="sm"?"size-10":"size-14";return e.jsxs("div",{className:o("flex flex-col items-center gap-1"),children:[e.jsx("div",{className:o(s,"rounded-lg border border-neutral-border shadow-xs"),style:{backgroundColor:`oklch(var(${t}))`}}),e.jsx("span",{className:o("text-xs text-neutral-foreground"),children:r})]})}function h({name:t,palette:r}){return e.jsxs("div",{className:o("flex flex-col gap-2"),children:[e.jsx("span",{className:o("text-lg font-semibold text-neutral-foreground capitalize"),children:t}),e.jsx("div",{className:o("flex flex-wrap gap-3"),children:r.shades.map(n=>e.jsx(f,{cssVar:r.cssVar(n),label:n},n))})]})}function y({name:t,tokens:r}){return e.jsxs("div",{className:o("flex flex-col gap-3"),children:[e.jsx("span",{className:o("text-lg font-semibold text-neutral-foreground capitalize"),children:t}),e.jsx("div",{className:o("grid gap-2"),children:r.map(({token:n,primitive:s})=>e.jsxs("div",{className:o("flex items-center gap-3"),children:[e.jsx("div",{className:o("size-10 shrink-0 rounded-lg border border-neutral-border shadow-xs"),style:{backgroundColor:`oklch(var(${n}))`}}),e.jsxs("div",{className:o("flex flex-col"),children:[e.jsx("span",{className:o("text-sm font-medium text-neutral-foreground"),children:n}),e.jsx("span",{className:o("text-xs text-muted-foreground"),children:s})]})]},n))})]})}const E=()=>e.jsx("div",{}),A={title:"Design Tokens/Colours",component:E,parameters:{controls:{disable:!0},actions:{disable:!0},docs:{description:{component:`Design tokens for the colour system, parsed directly from theme CSS files.
Primitives define the raw palette, semantic tokens reference primitives
to express design intent (e.g. "primary-hover").

Use the **theme toggle above** in the Storybook toolbar to switch between
themes — all stories update live via the CSS cascade.

**Rule:** Components must only use semantic tokens — never reference primitives directly.`}}}},c={render:()=>e.jsx("div",{className:o("story-page flex flex-col gap-8"),children:Object.entries(x).map(([t,r])=>e.jsx(h,{name:t,palette:r},t))})},l={render:()=>e.jsx("div",{className:o("story-page flex flex-wrap justify-center gap-x-8 gap-y-[96px]"),children:Object.entries(g).map(([t,r])=>e.jsx(y,{name:t,tokens:r},t))})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-page flex flex-col gap-8')}>
      {Object.entries(primitiveColours).map(([name, palette]) => <PaletteRow key={name} name={name} palette={palette} />)}
    </div>
}`,...c.parameters?.docs?.source},description:{story:`The raw colour palette defined in OKLCh colour space.
These tokens are **not for direct use** in components — they exist
to be referenced by semantic tokens.

**Toggle the theme** in the Storybook toolbar to see the fire theme's
overridden primitive palettes (primary, secondary, neutral).`,...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-page flex flex-wrap justify-center gap-x-8 gap-y-[96px]')}>
      {Object.entries(semanticTokens).map(([name, tokens]) => <SemanticGroup key={name} name={name} tokens={tokens} />)}
    </div>
}`,...l.parameters?.docs?.source},description:{story:`Semantic tokens map design intent to primitives. Each token name encodes
its profile, context, and state: \`--{profile}-{context?}-{state?}\`.

These are the tokens that Tailwind utilities resolve to
(e.g. \`bg-primary\`, \`text-secondary-foreground-hover\`).

**Toggle the theme** in the Storybook toolbar to see how semantic
tokens resolve to different colours when the underlying primitives change.`,...l.parameters?.docs?.description}}};const D=["Primitives","Semantics"];export{c as Primitives,l as Semantics,D as __namedExportsOrder,A as default};
