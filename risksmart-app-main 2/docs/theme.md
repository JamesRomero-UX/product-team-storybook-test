# Theme

## Description

Generates a “themed” version of Cloudscape, configured using Cloudscape’s Design Tokens system and Tailwind.

## History

Cloudscape library was chosen to allow the team to release V2 quickly, using out-of-the-box components with minimal customisation. The application quickly outgrew Cloudscape’s opinionated design system and a decision was made to introduce Tailwind, allowing developers to build custom components along side Cloudscape.

## Approach

- Cloudscape extends the Tailwind config, reducing duplication of colour and typography variables
- Wherever possible, Cloudscape components should be deprecated in favour of custom components and/or Tailwind class names (for example, you may disregard Cloudscape’s `Grid` component in favour of `<div className="grid">...</div>`)
- Existing types and data structures, taken from Cloudscape, can be reused to allow backwards compatibility

## Technical

### Theme Generation with `packages/theme`

In order to customise Cloudscape you must generate a theme based on a set of design tokens.

This is generated from the `theme` package, and installed into the `web` packaged using a `file:` dependency.

The `theme` package contains two config files:

- `base.config.ts` A Tailwind config file containing default colours and fonts
- `theme.config.ts` A Cloudscape config file which extends `base.config.ts`, used to generate the `@cloudscape-design/components` package used in the React application

The theme is generated using the `generate-theme` command, which is run either manually or on every `npm install`. It would be easy to add this to a watch command, but it’s rare that the theme gets updated.

### Referencing the Theme, Design Tokens and Tailwind config

The `web` package contains the file `tailwind.config.js`. This file does two things:

1. Extends the Tailwind config from the `theme` package (`base.config.ts`)
2. Maps some Cloudscape variables to the Tailwind config (spacing, brakepoints, etc.)

### Known issues

- Sometimes the `generate-theme` command fails to update the UI. You might need to restart the web project, or even restart your IDE.
