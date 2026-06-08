/**
 * PostCSS plugin to scope Tailwind utilities under .atomic-ui
 *
 * Transforms:
 *   .p-4 { padding: 1rem; }
 * Into:
 *   .atomic-ui.p-4, .atomic-ui .p-4 { padding: 1rem; }
 *
 * This ensures atomic-ui utilities work both when:
 * - The utility is on the same element as .atomic-ui (combined: .atomic-ui.p-4)
 * - The utility is on a descendant of .atomic-ui (descendant: .atomic-ui .p-4)
 */

const SCOPE_CLASS = 'atomic-ui';

/**
 * Selectors that should NOT be scoped
 */
const SKIP_PATTERNS = [
  // Already scoped to .atomic-ui
  /\.atomic-ui/,
  // CSS custom property definitions (theme variables)
  /^:root$/,
  // Keyframes
  /@keyframes/,
  // HTML/body level selectors
  /^html$/,
  /^body$/,
  /^\*$/,
  // Pseudo-elements on root
  /^::?-/,
];

/**
 * At-rules whose contents should NOT be scoped
 */
const SKIP_AT_RULES = ['keyframes', 'font-face', 'import', 'charset', 'layer'];

/**
 * Check if a selector should be skipped from scoping
 */
function shouldSkipSelector(selector) {
  return SKIP_PATTERNS.some((pattern) => pattern.test(selector));
}

/**
 * Transform a single selector to include atomic-ui scoping
 * Handles variants like hover\:p-4:hover, md\:flex, etc.
 */
function scopeSelector(selector) {
  // Skip if already scoped or matches skip patterns
  if (shouldSkipSelector(selector)) {
    return selector;
  }

  const trimmed = selector.trim();

  // Skip element selectors without classes (e.g., "div", "span")
  if (!trimmed.startsWith('.') && !trimmed.includes('.')) {
    return selector;
  }

  // For class selectors, create both combined and descendant versions
  // Combined: .atomic-ui.class (same element)
  // Descendant: .atomic-ui .class (child element)
  return `.${SCOPE_CLASS}${trimmed}, .${SCOPE_CLASS} ${trimmed}`;
}

/**
 * Process a selector list (comma-separated selectors)
 */
function processSelectorList(selectorList) {
  return selectorList
    .split(',')
    .map((s) => scopeSelector(s.trim()))
    .join(', ');
}

/**
 * The PostCSS plugin
 */
module.exports = () => {
  return {
    postcssPlugin: 'postcss-atomic-scope',
    Once(root) {
      root.walkRules((rule) => {
        // Skip rules inside certain at-rules
        if (rule.parent && rule.parent.type === 'atrule') {
          const atRuleName = rule.parent.name.toLowerCase();
          if (SKIP_AT_RULES.includes(atRuleName)) {
            return;
          }
        }

        // Skip if any selector in the rule should be skipped
        const selectors = rule.selector.split(',').map((s) => s.trim());
        const shouldSkip = selectors.some(
          (s) => shouldSkipSelector(s) || !s.startsWith('.')
        );

        if (shouldSkip) {
          return;
        }

        // Transform the selector
        rule.selector = processSelectorList(rule.selector);
      });
    },
  };
};

module.exports.postcss = true;
