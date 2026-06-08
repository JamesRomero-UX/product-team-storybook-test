// Single <RealProviders> wrapper used by every page-template story.
//
// Wires up every context the production page tree needs:
//   - Auth0Provider with a fake authenticated user (bypasses redirects)
//   - I18nextProvider with a permissive translation strategy (any key ->
//     last segment of the key, capitalised)
//   - HelmetProvider (no-op — captures <Helmet> tags from PageLayout)
//   - Apollo MockedProvider — mocks supplied per-story
//   - createMemoryRouter wrapping the children
//
// The Knock provider is omitted intentionally: AuthenticatedAppLayout uses
// `useKnockFeed`, but the path '@knocklabs/react' is force-aliased and we
// can wrap-on-demand. Calling its hooks without a provider returns
// `undefined` — production layout handles that gracefully.
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { Auth0Provider } from '@auth0/auth0-react';
import i18n from 'i18next';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
// eslint-disable-next-line import/no-unresolved
import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
// eslint-disable-next-line import/no-unresolved
import { GetEntitiesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

// Permissive i18n: any t('foo.bar.baz') call returns 'Baz' (last segment,
// capitalised). Good enough for a visual reference; falls back to the key
// itself if there's nothing to humanise.
const resourceProxy = new Proxy(
  {},
  {
    get(_t, prop: string) {
      // i18next probes for `__proto__`, `then`, etc — return undefined for
      // those so it doesn't think the resource is a thenable.
      if (
        prop === 'then' ||
        prop === 'toJSON' ||
        prop === '__proto__' ||
        prop === 'Symbol(Symbol.toPrimitive)'
      )
        return undefined;
      return resourceProxy;
    },
  },
);

// Some dev-repo helpers (e.g. utils.ts → labelWithPlural) call the GLOBAL
// `i18next.format(label, 'plural')` rather than the per-instance one. The
// formatters live on i18next.services.formatter and are normally registered
// in the dev repo's @risksmart-app/i18n/src/i18n.ts via i18n.services
// .formatter.add('plural', ...). We register the same set on the default
// i18next module so utility helpers don't crash at runtime.
import defaultI18nextModule from 'i18next';
// Real common.json from the dev-repo i18n package — gives helpers like
// labelWithPlural / EmptyEntityCollection real strings to render instead
// of the bare key. The alias '@risksmart-app/i18n' resolves to the
// dev-repo source dir.
// eslint-disable-next-line import/no-unresolved
import commonTranslations from '@risksmart-app/i18n/locales/default/en/common.json';

const ensureGlobalFormatters = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    // Trigger init so services.formatter exists.
    if (!defaultI18nextModule.isInitialized) {
      void defaultI18nextModule.init({
        lng: 'en',
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common'],
        resources: { en: { common: commonTranslations as any } },
        interpolation: { escapeValue: false },
      });
    }
    const f = (defaultI18nextModule as any).services?.formatter;
    if (!f) return;
    f.add('capitalize', (value: string) => `${value.substring(0, 1).toUpperCase()}${value.substring(1)}`);
    f.add('capitalizeAll', (value: string) =>
      value?.replace(/(^\w{1})|(\s+\w{1})/g, (l: string) => l?.toUpperCase()),
    );
    f.add('article', (value: string) => {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const first = value?.charAt(0)?.toLowerCase();
      return `${vowels.includes(first) ? 'an' : 'a'} ${value}`;
    });
    f.add('plural', (value: string) => `${value}s`);
    f.add('lowercase', (value: string) => value?.toLowerCase());
  };
})();

// Initialise i18n once — sane fallback that returns a humanised key for any
// missing translation. Mocked common.json content from the dev repo is too
// large to copy into the storybook; the heuristic produces readable strings
// for every nav / button label without needing the real strings.
let i18nInstance: any = null;
const getI18n = () => {
  if (i18nInstance) return i18nInstance;
  const inst = i18n.createInstance();
  inst.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      en: { common: resourceProxy as any },
    },
    interpolation: { escapeValue: false },
    parseMissingKeyHandler: (key) => {
      // Heuristic humaniser for missing keys.
      //
      // Section labels in the production nav use keys shaped like
      // 'navigationMenu.<section>.sectionTitle' (e.g. internalAudit.sectionTitle,
      // risks.sectionTitle). The section identifier is the parent segment, not
      // the last one, so we need to look one step up; otherwise every section
      // collapses to the literal string "Section".
      //
      // For all other keys, fall back to humanising the last segment after
      // stripping the 'Title' suffix.
      const humanise = (s: string) =>
        (s
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/_/g, ' ')
          .replace(/^./, (c) => c.toUpperCase())) || s;
      const parts = key.split('.');
      const last = parts[parts.length - 1] ?? key;
      if (last === 'sectionTitle' && parts.length >= 2) {
        return humanise(parts[parts.length - 2]);
      }
      return humanise(last.replace(/Title$/, '')) || key;
    },
  });
  i18nInstance = inst;
  return inst;
};

// The production UserMenu component reads claims_username and
// claims_organization_name off the Auth0 user object — NOT the
// standard Auth0 `name` field. Without these, UserInfo falls back to
// the literal strings 'User' and 'Organization', which is what was
// rendering in the toolbar. Mirror the shape the production app expects.
const fakeUser = {
  name: 'James Romero',
  email: 'james.romero@risksmart.com',
  picture: undefined,
  sub: 'auth0|storybook',
  claims_username: 'James Romero',
  claims_organization_name: 'RiskSmart Inc.',
  claims_tenant: 'risksmart',
  'https://hasura.io/jwt/claims': {
    'x-hasura-default-role': 'admin',
    'x-hasura-allowed-roles': ['admin'],
    'x-hasura-user-id': 'storybook-user',
    'x-hasura-logo': '',
    'x-hasura-applogo': '',
  },
} as any;

// Baseline Apollo mocks — always-on responses for queries the
// AuthenticatedAppLayout fires regardless of which page is rendered.
// Apollo MockedProvider consumes a mock once per matching query, so we
// duplicate the same response a few times to survive re-renders.
const emptyEntitiesResponse = {
  request: { query: GetEntitiesDocument },
  result: { data: { entity: [] } },
};
const baselineMocks: readonly MockedResponse[] = [
  emptyEntitiesResponse,
  emptyEntitiesResponse,
  emptyEntitiesResponse,
  emptyEntitiesResponse,
] as MockedResponse[];

interface RealProvidersProps {
  apolloMocks?: readonly MockedResponse[];
  children: ReactElement;
  initialPath?: string;
}

export const RealProviders = ({
  apolloMocks = [],
  children,
  initialPath = '/',
}: RealProvidersProps) => {
  const i18nReady = useMemo(() => {
    ensureGlobalFormatters();
    return getI18n();
  }, []);
  // The production Navigation's Link.tsx and NestedLink.tsx use useMatches()
  // to determine the active item. With a single `path: '*'` wildcard route,
  // useMatches returns just the wildcard match — which the Link.tsx logic
  // can't filter cleanly against item.href values, causing multiple items
  // to appear selected at once.
  //
  // Fix: provide a flat route tree mirroring every nav href in the live app.
  // Each path is a discrete top-level route, so useMatches() returns exactly
  // one match per location — and the Link's `path === item.href` filter
  // correctly identifies a single active item.
  //
  // Routes mirror packages/web/src/routes/useNavItems.tsx and the page entry
  // points it points at. Every story's children prop is the same (the page
  // content), so each route just renders children.
  const router = useMemo(
    () =>
      createMemoryRouter(
        [
          // Home
          { path: '/', element: children },
          // Internal audits
          { path: '/internal-audits', element: children },
          { path: '/internal-audits/dashboard', element: children },
          { path: '/internal-audits/reports', element: children },
          { path: '/internal-audits/findings', element: children },
          // Risks
          { path: '/risks', element: children },
          { path: '/risks/dashboard', element: children },
          { path: '/risks/:id', element: children },
          { path: '/appetites', element: children },
          { path: '/acceptances', element: children },
          // Policy
          { path: '/policy', element: children },
          { path: '/policy/:id', element: children },
          // Operational resilience — nested so useMatches() returns the
          // full chain (parent + child) and useBreadcrumbs() builds a
          // multi-level breadcrumb trail. handle.title on each level is
          // what the breadcrumb component reads.
          //
          // Create / attest pages mirror the production pattern at
          // /risks/create + /risks/update/:id — the dev-repo handles
          // creation as full pages, never as modals.
          {
            path: '/opres',
            handle: { title: 'Operational resilience' },
            children: [
              {
                path: 'ibs',
                handle: { title: 'Important Business Services' },
                children: [
                  { index: true, element: children },
                  {
                    path: 'create',
                    element: children,
                    handle: { title: 'Create new IBS' },
                  },
                  {
                    path: ':id',
                    element: children,
                    handle: { title: 'Service detail' },
                    children: [
                      {
                        path: 'attest',
                        element: children,
                        handle: { title: 'Submit attestation' },
                      },
                    ],
                  },
                ],
              },
              {
                path: 'scenarios',
                handle: { title: 'Scenarios & self-assessments' },
                children: [
                  { index: true, element: children },
                  {
                    path: 'create',
                    element: children,
                    handle: { title: 'Schedule new scenario' },
                  },
                ],
              },
              {
                path: 'vulnerabilities',
                element: children,
                handle: { title: 'Vulnerabilities' },
              },
            ],
          },
          // Compliance
          { path: '/compliance', element: children },
          { path: '/compliance/dashboard', element: children },
          { path: '/compliance/changes', element: children },
          { path: '/compliance/monitoring', element: children },
          { path: '/compliance/findings', element: children },
          // Third party
          { path: '/third-party', element: children },
          { path: '/third-party/questionnaire', element: children },
          { path: '/third-party/questionnaire-responses', element: children },
          // Controls
          { path: '/controls', element: children },
          { path: '/controls/tests', element: children },
          { path: '/control-groups', element: children },
          // Other top-level
          { path: '/issues', element: children },
          { path: '/actions', element: children },
          { path: '/indicator', element: children },
          // Assessments
          { path: '/assessments', element: children },
          { path: '/assessments/activities', element: children },
          { path: '/assessments/findings', element: children },
          // Reports / docs / settings
          { path: '/reports', element: children },
          { path: '/report-an-issue', element: children },
          { path: '/documents', element: children },
          { path: '/requests', element: children },
          { path: '/settings', element: children },
          // Catch-all for any unknown path
          { path: '*', element: children },
        ],
        {
          initialEntries: [initialPath],
        },
      ),
    [children, initialPath],
  );
  const mergedMocks = useMemo(
    () => [...baselineMocks, ...apolloMocks],
    [apolloMocks],
  );

  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18nReady}>
        <Auth0Provider
          domain={'storybook.local'}
          clientId={'storybook'}
          authorizationParams={{ redirect_uri: 'http://localhost' }}
          // Skip the redirect callback that real Auth0 would perform — keeps
          // us in a logged-out -> we mock the user via context override below.
          skipRedirectCallback
        >
          <FakeAuthOverride>
            <MockedProvider mocks={mergedMocks as any} addTypename={false}>
              <NotificationProvider>
                <RouterProvider router={router} />
              </NotificationProvider>
            </MockedProvider>
          </FakeAuthOverride>
        </Auth0Provider>
      </I18nextProvider>
    </HelmetProvider>
  );
};

// Auth0Provider sets isAuthenticated=false until the redirect resolves.
// We override the context value with our fake user so production code that
// reads `useAuth0().user` sees a logged-in James.
import { Auth0Context } from '@auth0/auth0-react';

const FakeAuthOverride = ({ children }: { children: ReactNode }) => (
  <Auth0Context.Provider
    value={{
      isAuthenticated: true,
      isLoading: false,
      user: fakeUser,
      getAccessTokenSilently: async () => 'storybook-token',
      getAccessTokenWithPopup: async () => 'storybook-token',
      getIdTokenClaims: async () => ({} as any),
      loginWithRedirect: async () => {},
      loginWithPopup: async () => {},
      logout: () => {},
      handleRedirectCallback: async () => ({} as any),
    } as any}
  >
    {children}
  </Auth0Context.Provider>
);
