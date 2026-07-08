// Minimal preview provider for the RiskSmart themed-cloudscape design system.
//
// The themed-cloudscape components need NO React context to render correctly:
// their theming is delivered entirely through CSS custom properties defined at
// :root (the default "risksmart" theme applies no wrapper class), which ship in
// _ds_bundle.css. This passthrough exists only so cfg.provider is set — that
// makes the converter skip bundling `.storybook/preview` decorators, whose
// `withThemeByClassName` (from @storybook/addon-themes) is stubbed out and
// crashes every preview ("withThemeByClassName is not a function").
import { createElement, Fragment } from 'react';

export function PreviewRoot({ children }: { children?: unknown }) {
  return createElement(Fragment, null, children as never);
}
