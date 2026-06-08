/**
 * Custom ESLint rule: require an explanatory comment when using `as` type assertions.
 *
 * Rationale: `as` assertions bypass TypeScript's type checker and can hide bugs.
 * Requiring a comment forces developers to justify the assertion and helps reviewers
 * understand why it was necessary.
 *
 * `as const` is exempt — it's a safe, idiomatic narrowing construct.
 *
 * To suppress the warning, add a non-empty justification comment on the same line
 * or the preceding line. The comment must contain meaningful text (at least one word
 * of 3+ characters) — an empty comment or single-character marker is not sufficient.
 *
 *   // The API returns `unknown` but we validate the shape at runtime
 *   const result = response as MyType;
 *
 *   const result = response as MyType; // validated above via Zod
 *
 * @type {import('eslint').Rule.RuleModule}
 */

/** @param {{ value: string }} token */
const isJustificationComment = (token) =>
  // Must contain at least one word of 3+ characters — rules out `//`, `// x`, `// ok`
  /\w{3,}/.test(token.value);

export const noAsWithoutJustification = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require an explanatory comment when using `as` type assertions',
    },
    messages: {
      missingComment:
        'Avoid `as` type assertions without justification. Add a comment explaining why on the same line or the preceding line.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      TSAsExpression(node) {
        // Allow `as const` — it's safe and idiomatic
        const { typeAnnotation } = node;
        if (
          typeAnnotation.type === 'TSTypeReference' &&
          typeAnnotation.typeName.type === 'Identifier' &&
          typeAnnotation.typeName.name === 'const'
        ) {
          return;
        }

        const assertionLine = node.loc.start.line;

        // Walk backwards through tokens (including comments) until we pass the
        // preceding line. Stop as soon as we find a comment or go too far back.
        let token = sourceCode.getTokenBefore(node, { includeComments: true });
        while (token) {
          if (token.type === 'Line' || token.type === 'Block') {
            // Accept justification comments on the same line or the immediately preceding line
            if (
              token.loc.end.line >= assertionLine - 1 &&
              isJustificationComment(token)
            ) {
              return;
            }
            // Comment exists but is too far back or lacks justification text
            break;
          }
          // Non-comment token: if it's already past the preceding line, stop
          if (token.loc.end.line < assertionLine - 1) {
            break;
          }
          token = sourceCode.getTokenBefore(token, { includeComments: true });
        }

        // Check for an inline comment after the assertion on the same line
        let afterToken = sourceCode.getTokenAfter(node, {
          includeComments: true,
        });
        while (afterToken && afterToken.loc.start.line === node.loc.end.line) {
          if (
            (afterToken.type === 'Line' || afterToken.type === 'Block') &&
            isJustificationComment(afterToken)
          ) {
            return;
          }
          afterToken = sourceCode.getTokenAfter(afterToken, {
            includeComments: true,
          });
        }

        context.report({ node, messageId: 'missingComment' });
      },
    };
  },
};
