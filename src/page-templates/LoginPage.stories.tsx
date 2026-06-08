// Page Templates / Login Page — recreates the Auth0 Universal Login
// screen at staging-risksmart.uk.auth0.com.
//
// The actual page is hosted by Auth0 (packages/components/src/auth-pages/
// Login.tsx is a redirect handler only). This story is a static
// recreation using the same brand assets and tokens production uses
// so the design team can prototype changes to the login experience
// without touching the live Auth0 tenant.
//
// Layout reference (from the May 2026 live screenshot):
//   - Full navy bg
//   - Top-left:  "RiskSmart" wordmark
//   - Right:     enormous white "R." brand mark bleeding off the right
//                edge and bottom (decorative, navy stroke against the
//                navy bg — only the white fill and teal counter dot
//                are visible)
//   - Card:      positioned left-of-center (roughly 25% from left
//                edge), vertically centered. Tall (~770px) — empty
//                space above "Welcome !" matches the live layout
//   - Card body: Welcome heading, subtitle, floating-label email
//                field, Continue button, sign-up footer link

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import '../cloudscape-reference/_setup';

// Production tokens (sourced from tailwind.config.ts theme.extend.colors).
const NAVY = '#0F0F2D';
const NAVY_MID = '#14143A';
const TEAL = '#00DECB';
const TEAL_HOVER = '#15BEB0';
const TEAL_ACTIVE = '#079589';
const GREY_500 = '#8B8BA0';
const GREY_300 = '#D0D0D9';
const GREY_600 = '#5C5C79';
const RED = '#d91515';
const SORA = "'Sora', -apple-system, BlinkMacSystemFont, sans-serif";

const meta = {
  title: 'Page Templates/Login Page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Auth0 Universal Login recreation. Full navy bg, top-left ' +
          'wordmark, decorative "R." mark right, card pinned ' +
          'left-of-centre with sign-up footer link.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Wordmark (top-left) ──────────────────────────────────────────────
//
// Production logo is "RiskSmart" in white Sora bold + a small teal dot
// after the "t". Inline SVG so it scales cleanly.
const Wordmark = () => (
  <div
    style={{
      position: 'absolute',
      top: 32,
      left: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: SORA,
      fontWeight: 700,
      fontSize: 22,
      color: '#FFFFFF',
      letterSpacing: '-0.02em',
      userSelect: 'none',
    }}
  >
    <span>{'RiskSmart'}</span>
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: TEAL,
        marginTop: -8,
        marginLeft: 2,
      }}
    />
  </div>
);

// ─── Decorative "R." brand mark (right side of viewport) ──────────────
//
// Production renders this as a huge white letterform bleeding off the
// right and bottom edges, with a teal counter-dot. Decorative only —
// no semantic meaning. We anchor it to the right and let it crop.
const BrandMark = () => (
  <div
    style={{
      position: 'absolute',
      right: -120,
      bottom: -160,
      width: 880,
      height: 880,
      pointerEvents: 'none',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    }}
    aria-hidden
  >
    <svg
      viewBox={'0 0 880 880'}
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      xmlns={'http://www.w3.org/2000/svg'}
    >
      <text
        x={'0'}
        y={'780'}
        fontFamily={'Sora, sans-serif'}
        fontSize={'1100'}
        fontWeight={700}
        fill={'#FFFFFF'}
        letterSpacing={'-50'}
      >
        {'R'}
      </text>
      {/* Teal counter dot tucked under the R */}
      <circle cx={'720'} cy={'790'} r={'60'} fill={TEAL} />
    </svg>
  </div>
);

// ─── Card ──────────────────────────────────────────────────────────────
const LoginCard = ({
  initialEmail = '',
  disabled = false,
  errorText,
}: {
  initialEmail?: string;
  disabled?: boolean;
  errorText?: string;
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [focused, setFocused] = useState(false);
  const canSubmit = email.trim().length > 0 && !disabled;
  const labelFloat = focused || email.length > 0;

  return (
    <div
      style={{
        width: 420,
        background: '#FFFFFF',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
        padding: '120px 56px 48px 56px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          color: NAVY,
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.2,
          margin: 0,
          fontFamily: SORA,
        }}
      >
        {'Welcome !'}
      </h1>

      <p
        style={{
          textAlign: 'center',
          color: NAVY_MID,
          fontSize: 14,
          marginTop: 12,
          marginBottom: 36,
          marginLeft: 0,
          marginRight: 0,
          fontFamily: SORA,
        }}
      >
        {'Log in to continue to RiskSmart'}
      </p>

      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <label
          style={{
            position: 'relative',
            display: 'block',
            marginBottom: errorText ? 8 : 0,
            fontFamily: SORA,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: labelFloat ? -8 : 14,
              left: 12,
              background: '#FFFFFF',
              padding: '0 4px',
              color: focused ? TEAL_ACTIVE : GREY_500,
              fontSize: labelFloat ? 12 : 14,
              fontWeight: labelFloat ? 600 : 400,
              transition: 'all 120ms ease-out',
              pointerEvents: 'none',
            }}
          >
            {'Email address*'}
          </span>
          <input
            type={'email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            autoFocus
            style={{
              width: '100%',
              height: 48,
              padding: '0 12px',
              border: `1.5px solid ${focused || labelFloat ? TEAL_ACTIVE : GREY_300}`,
              borderRadius: 6,
              outline: 'none',
              fontSize: 14,
              color: NAVY_MID,
              background: disabled ? '#F3F3F8' : '#FFFFFF',
              boxSizing: 'border-box',
              fontFamily: SORA,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
          {errorText && (
            <span
              style={{
                display: 'block',
                marginTop: 6,
                fontSize: 12,
                color: RED,
                fontFamily: SORA,
              }}
            >
              {errorText}
            </span>
          )}
        </label>

        <button
          type={'submit'}
          disabled={!canSubmit}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 24,
            border: 'none',
            background: TEAL,
            color: NAVY,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SORA,
            cursor: canSubmit ? 'pointer' : 'default',
            opacity: 1,
          }}
          onMouseOver={(e) => {
            if (canSubmit) e.currentTarget.style.background = TEAL_HOVER;
          }}
          onMouseOut={(e) => {
            if (canSubmit) e.currentTarget.style.background = TEAL;
          }}
          onMouseDown={(e) => {
            if (canSubmit) e.currentTarget.style.background = TEAL_ACTIVE;
          }}
          onMouseUp={(e) => {
            if (canSubmit) e.currentTarget.style.background = TEAL_HOVER;
          }}
        >
          {disabled ? 'Signing in…' : 'Continue'}
        </button>
      </form>

      {/* Sign-up footer */}
      <div
        style={{
          marginTop: 28,
          fontFamily: SORA,
          fontSize: 13,
          color: GREY_600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{"Don't have an account?"}</span>
        <a
          href={'#'}
          style={{
            color: NAVY,
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          {'Sign up'}
        </a>
      </div>
    </div>
  );
};

// ─── Page wrapper ──────────────────────────────────────────────────────
//
// Layout: fixed-inset wrapper fills the iframe. Card pinned to the
// LEFT side (not centered) — ~12% from left edge, vertically centered.
// Wordmark anchored top-left. Decorative "R." mark anchored bottom-
// right and bleeds off both edges.
const LoginPage = ({
  initialEmail = '',
  disabled = false,
  errorText,
}: {
  initialEmail?: string;
  disabled?: boolean;
  errorText?: string;
}) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: NAVY,
      overflow: 'hidden',
      fontFamily: SORA,
    }}
  >
    <Wordmark />
    <BrandMark />
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '14%',
        transform: 'translateY(-50%)',
        zIndex: 1,
      }}
    >
      <LoginCard
        initialEmail={initialEmail}
        disabled={disabled}
        errorText={errorText}
      />
    </div>
  </div>
);

// ─── Stories ───────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => <LoginPage />,
};

export const Filled: Story = {
  render: () => <LoginPage initialEmail={'james.romero@risksmart.com'} />,
};

export const Submitting: Story = {
  render: () => (
    <LoginPage initialEmail={'james.romero@risksmart.com'} disabled />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <LoginPage
      initialEmail={'nobody@example.com'}
      errorText={"We couldn't find an account with that email."}
    />
  ),
};
