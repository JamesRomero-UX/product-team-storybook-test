import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env so each team member can point RS_APP_PATH at their local dev repo.
// Copy .env.example → .env and set RS_APP_PATH to wherever you cloned risksmart-app.
try {
  const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* no .env file — using default path below */ }

const DEV_REPO = process.env.RS_APP_PATH
  ? path.resolve(process.env.RS_APP_PATH)
  : path.resolve(__dirname, 'risksmart-app-main 2');
const ATOMIC_UI_SRC = path.join(DEV_REPO, 'packages/atomic-ui/src');
const COMPONENTS_SRC = path.join(DEV_REPO, 'packages/components/src');
const WEB_SRC = path.join(DEV_REPO, 'packages/web/src');
const STUBS = path.resolve(__dirname, 'src/app-shell/_stubs');

const stub = (name: string) => path.join(STUBS, name);
const dev = (subpath: string) => path.join(DEV_REPO, subpath);
const own = (subpath: string) => path.resolve(__dirname, subpath);

// Stub modules whose imports come in via *relative* paths from the dev repo
// (which can't be rewritten with `resolve.alias` — Vite aliases only see the
// import specifier string). Each entry maps a path-suffix to a local stub.
//
// Example: ControlledTabs.tsx in the dev repo does
//   import TabSettingsModal from '../tab-settings-modal';
// which resolves to the absolute path of the real (291-line) modal in the
// dev repo. We intercept that resolved path and redirect to NullComponent.
const interceptRelativeStubs = () => {
  const STUBS_DIR = path.resolve(__dirname, 'src/app-shell/_stubs');
  const NULL_STUB = path.join(STUBS_DIR, 'NullComponent.tsx');
  const APPLAYOUT_STUB = path.join(STUBS_DIR, 'AuthenticatedAppLayout.tsx');
  // Each pattern matches a substring of the resolved absolute import path.
  const patterns: Array<[RegExp, string]> = [
    [/\/components\/tab-settings-modal(\/index\.ts|\/[^/]+\.tsx?)?$/, NULL_STUB],
    // PageLayout.tsx imports './AuthenticatedAppLayout' (relative) — Vite
    // resolves to the dev repo's real file. Intercept the resolved path and
    // swap for our simpler stub that uses the working RiskSmartNavigation.
    [/\/layouts\/AuthenticatedAppLayout(\.tsx?)?$/, APPLAYOUT_STUB],
  ];
  return {
    name: 'intercept-relative-stubs',
    enforce: 'pre' as const,
    async resolveId(source: string, importer: string | undefined) {
      if (!importer) return null;
      // Only act on relative imports — bare/aliased ones are handled by
      // resolve.alias above.
      if (!source.startsWith('.')) return null;
      const resolved = path.resolve(path.dirname(importer), source);
      for (const [re, stub] of patterns) {
        if (re.test(resolved) || re.test(resolved + '/index.ts')) return stub;
      }
      return null;
    },
  };
};

// Rewrites imports like `../../../node_modules/X/Y/Z` (any number of `../`
// hops) to bare specifiers `X/Y/Z`. The dev repo has a few files that point
// at hoisted node_modules with relative paths — those paths only resolve
// inside the dev repo's pnpm tree. Rewriting to bare specifiers lets Vite
// resolve through this project's own aliases / node_modules.
const rewriteRelativeNodeModules = () => ({
  name: 'rewrite-relative-node-modules-imports',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!/\.[cm]?[jt]sx?$/.test(id)) return null;
    if (!code.includes('node_modules/')) return null;
    const re = /(['"])((?:\.\.\/)+)node_modules\/([^'"\s]+)\1/g;
    let changed = false;
    const out = code.replace(re, (_m, q, _hops, rest) => {
      changed = true;
      return `${q}${rest}${q}`;
    });
    return changed ? { code: out, map: null } : null;
  },
});

export default defineConfig({
  plugins: [interceptRelativeStubs(), rewriteRelativeNodeModules(), react()],
  define: {
    __COMMIT_HASH__: JSON.stringify('storybook'),
    __APP_ENV__: JSON.stringify('storybook'),
    __APP_VERSION__: JSON.stringify('0.0.0'),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  resolve: {
    alias: [
      // ─── atomic-ui (Batch 1) ────────────────────────────────────────────
      { find: '@risksmart-app/atomic-ui', replacement: path.join(ATOMIC_UI_SRC, 'index.ts') },
      { find: '@atomic-ui-src', replacement: ATOMIC_UI_SRC },

      // ─── Production graphql client stub ─────────────────────────────────
      { find: '@risksmart-app/web-graphql-client/generated/graphql', replacement: own('vendor/web-graphql-client/generated/graphql.ts') },
      { find: '@risksmart-app/web-graphql-client', replacement: own('vendor/web-graphql-client') },

      // ─── Real production page entry points ──────────────────────────────
      { find: '@risksmart-pages/PageLayout', replacement: dev('packages/web/src/layouts/PageLayout.tsx') },
      { find: '@risksmart-pages/AuthenticatedAppLayout', replacement: dev('packages/web/src/layouts/AuthenticatedAppLayout.tsx') },
      { find: '@risksmart-pages/risks-create', replacement: dev('packages/web/src/pages/risks/create/Page.tsx') },
      { find: '@risksmart-pages/risks-update', replacement: dev('packages/web/src/pages/risks/update/Page.tsx') },
      { find: '@risksmart-pages/risk-dashboard', replacement: dev('packages/web/src/pages/risk-dashboard/Page.tsx') },
      { find: '@risksmart-pages/risks', replacement: dev('packages/web/src/pages/risks/Page.tsx') },

      // ─── packages/components/src catch-alls ─────────────────────────────
      // navigation already aliased; keep it explicit so the more-specific
      // path wins lookup.
      { find: '@risksmart-app/components/navigation', replacement: path.join(COMPONENTS_SRC, 'navigation/index.ts') },
      // Stub environment.getEnv so the real function (which throws on
      // missing REACT_APP_* env vars) doesn't crash stories. Storybook
      // intentionally has no .env / VITE_REACT_APP_* values defined —
      // every consumer of getEnv inside the dev repo can tolerate a
      // string stub, since they only use the value to call third-party
      // SDKs we already have stubbed (TinyMCE, Sentry, Auth0, etc.).
      { find: '@risksmart-app/components/src/utils/environment', replacement: stub('environment.ts') },
      // Tier 1 custom wrappers — explicit aliases for the most-used wrappers.
      // Anchored regexes (NOT plain strings) so they don't prefix-match
      // siblings like '@risksmart-app/components/src/table/propertyFilterI18nStrings'
      // and corrupt them into '.../table/index.ts/propertyFilterI18nStrings'.
      { find: /^@risksmart-app\/components\/src\/button$/, replacement: path.join(COMPONENTS_SRC, 'button/index.ts') },
      { find: /^@risksmart-app\/components\/src\/table$/, replacement: path.join(COMPONENTS_SRC, 'table/index.ts') },
      // Segment / analytics — stub before catch-all so it wins
      { find: '@risksmart-app/components/src/segment', replacement: stub('segment.ts') },
      { find: '@risksmart-app/components/src/segment/index', replacement: stub('segment.ts') },
      { find: '@risksmart-app/components/src/contexts/entityFilterContext', replacement: stub('entityFilterContext.tsx') },
      // (Was: @risksmart-app/components/src/notifications/useNotifications
      // → stub. Removed in Batch C when notifications was wired as a real
      // organism. The real hook + NotificationProvider are now mounted.)
      { find: '@risksmart-app/components/src/tools/useTools', replacement: stub('useTools.ts') },
      { find: '@risksmart-app/components/src', replacement: COMPONENTS_SRC },
      { find: '@risksmart-app/components', replacement: dev('packages/components') },

      // ─── @/ prefix used inside packages/web/src ─────────────────────────
      // Specific stubs WIN by being listed first (Vite tries top-down).
      { find: '@/hooks/useGetBreadcrumbLabelByNodeType', replacement: stub('useGetBreadcrumbLabelByNodeType.ts') },
      { find: '@/hooks/useIsModuleEnabled', replacement: stub('useIsModuleEnabled.ts') },
      { find: '@/hooks/useIsFeatureFlagEnabled', replacement: stub('useIsFeatureFlagEnabled.ts') },
      { find: '@/hooks/useIsFeatureFlagEnabledLazy', replacement: stub('useIsFeatureFlagEnabled.ts') },
      { find: '@/hooks/useCustomOrgLogo', replacement: stub('useCustomOrgLogo.ts') },
      { find: '@/hooks/useRiskScores', replacement: stub('useRiskScores.ts') },
      { find: '@/hooks/useRiskScore', replacement: stub('useRiskScores.ts') },
      { find: '@/hooks/useRibbonAndExport', replacement: stub('useRibbonAndExport.ts') },
      { find: '@/hooks/useTabs', replacement: stub('useTabs.tsx') },
      { find: '@/hooks/useMutationResultNotification', replacement: stub('useMutationResultNotification.ts') },
      { find: '@/hooks/useEntityWhereFilter', replacement: stub('useEntityWhereFilter.ts') },
      { find: '@/components/chat/useChatStore', replacement: stub('useChatStore.ts') },
      { find: '@/components/chat/AIChatSidePanel', replacement: stub('NullComponent.tsx') },
      // help-panel: keep the SummaryHelpContent stubs (used by PageLayout —
      // real version pulls in helpContentSchema + HTML conversion which we
      // don't want) but allow the real HelpPanel + useHelpStore to load
      // when stories import them. The catch-all @/(.+) → WEB_SRC/$1
      // resolves them.
      { find: '@/components/help-panel/SummaryHelpContent', replacement: stub('SummaryHelpContent.tsx') },
      { find: '@/components/help-panel/useSummaryHelpContent', replacement: stub('useSummaryHelpContent.ts') },
      // (Was: @/components/help-panel and useHelpStore → stubs. Removed
      // when help-panel was promoted to a real wired organism in Batch C.)
      // (Was: @/components/side-panel and useSidePanelStore → stubs.
      // Removed when side-panel was promoted to a real wired organism in
      // Batch C. The default empty store state means the panel renders
      // nothing in pages that don't push content into it — same effective
      // behavior as the stub.)
      { find: '@/components/contexts/entityFilterContext', replacement: stub('entityFilterContext.tsx') },
      { find: '@/components/change-request-levels/ChangeRequestLevels', replacement: stub('NullComponent.tsx') },
      { find: '@/components/change-request-levels', replacement: stub('NullComponent.tsx') },
      { find: '@/components/wizard/Wizard', replacement: stub('NullComponent.tsx') },
      { find: '@/utils/urls', replacement: stub('urls.ts') },
      { find: '@/utils/collectionUtils', replacement: stub('collectionUtils.ts') },
      { find: '@/utils/friendlyId', replacement: stub('friendlyId.ts') },
      { find: '@/utils/issueVariantUtils', replacement: stub('issueVariantUtils.ts') },
      { find: '@/utils/graphqlUtils', replacement: stub('graphqlUtils.ts') },
      // Catch-all for any @/hooks/queries* — single index returns weak hooks.
      { find: /^@\/hooks\/queries$/, replacement: stub('queries.ts') },
      { find: /^@\/hooks\/queries\/.*$/, replacement: stub('queries.ts') },
      { find: /^@\/hooks\/mutations$/, replacement: stub('mutations.ts') },
      { find: /^@\/hooks\/mutations\/.*$/, replacement: stub('mutations.ts') },
      // utils/table catch-all
      { find: /^@\/utils\/table\/hooks\/.*$/, replacement: stub('utilTableHook.ts') },
      // remaining @/ → web/src catch-all (real source)
      { find: /^@\/(.*)$/, replacement: path.join(WEB_SRC, '$1') },

      // ─── src/ paths inside packages/web/src ─────────────────────────────
      { find: 'src/rbac/Permission', replacement: stub('Permission.tsx') },
      { find: 'src/rbac/useHasPermission', replacement: stub('useHasPermission.ts') },
      { find: 'src/components/wizard/Wizard', replacement: stub('NullComponent.tsx') },
      { find: 'src/components/wizard/WizardButton', replacement: stub('NullComponent.tsx') },
      { find: 'src/components/wizard/hooks/useInitiateWizard', replacement: stub('useInitiateWizard.ts') },
      { find: /^src\/components\/wizard\/modals\/.*$/, replacement: stub('NullComponent.tsx') },
      { find: 'src/components/notifications-list', replacement: stub('NullComponent.tsx') },
      // ControlledTabs imports a 291-line TabSettingsModal that needs Apollo
      // queries we don't mock. Stub it — the visible chrome (tabs themselves)
      // works without it.
      { find: 'src/components/tab-settings-modal', replacement: stub('NullComponent.tsx') },
      { find: 'src/components/connected-count', replacement: stub('ConnectedCount.tsx') },
      { find: 'src/components/connected-count/ConnectedCount', replacement: stub('ConnectedCount.tsx') },
      // (Was: src/components/actions-button → NullComponent stub. Removed
      // when actions-button was promoted to a real wired organism in
      // Batch B. ButtonDropdown — its only transitive dep — is trivial.)
      { find: 'src/components/add-to-enterprise-risk-modal/AddToEnterpriseRiskModal', replacement: stub('NullComponent.tsx') },
      // (Was: src/components/delete-modal/DeleteModal → NullComponent stub.
      // Removed when delete-modal was promoted to a real wired organism in
      // Batch B. DeleteButton — its only transitive dep — is trivial.)
      { find: 'src/components/export-button', replacement: stub('NullComponent.tsx') },
      { find: 'src/components/help-panel/useSummaryHelpContent', replacement: stub('useSummaryHelpContent.ts') },
      // src/hooks/queries — same stub as @/hooks/queries
      { find: /^src\/hooks\/queries$/, replacement: stub('queries.ts') },
      { find: /^src\/hooks\/queries\/.*$/, replacement: stub('queries.ts') },
      { find: /^src\/hooks\/mutations$/, replacement: stub('mutations.ts') },
      { find: /^src\/hooks\/mutations\/.*$/, replacement: stub('mutations.ts') },
      // Stub AuthenticatedAppLayout with a simpler composition that uses
      // the same RiskSmartNavigation as the working SideNavigation story.
      // The real AuthenticatedAppLayout pulls in zustand stores, side panels,
      // tools-mode swappers, and useNavMenuStore — all of which produce
      // inconsistent active-state behaviour in Storybook. The stub keeps
      // visual fidelity (Navigation + GlobalHeader + content) without the
      // store complexity. Anchored regex so only the exact import is
      // intercepted.
      { find: /^src\/layouts\/AuthenticatedAppLayout$/, replacement: stub('AuthenticatedAppLayout.tsx') },
      // Real source for the rest of src/ — fallthrough
      { find: 'src/layouts', replacement: path.join(WEB_SRC, 'layouts') },
      { find: 'src/pages', replacement: path.join(WEB_SRC, 'pages') },
      { find: 'src/components', replacement: path.join(WEB_SRC, 'components') },
      // Stub useNavItems so AuthenticatedAppLayout uses our pre-built
      // RISKSMART_NAV_ITEMS_WITH_ICONS instead of the production hook,
      // which depends on i18n + permissions + module flags that don't
      // resolve correctly in Storybook. Must come BEFORE the src/routes
      // catch-all. Anchored regex so it only matches the exact import path.
      { find: /^src\/routes\/useNavItems$/, replacement: stub('useNavItems.tsx') },
      { find: 'src/routes', replacement: path.join(WEB_SRC, 'routes') },
      { find: 'src/hooks', replacement: path.join(WEB_SRC, 'hooks') },
      { find: 'src/rbac', replacement: path.join(WEB_SRC, 'rbac') },
      { find: 'src/utils', replacement: path.join(WEB_SRC, 'utils') },
      { find: 'src/schemas/global', replacement: path.join(WEB_SRC, 'schemas/global.ts') },
      { find: 'src/schemas', replacement: path.join(WEB_SRC, 'schemas') },

      // ─── Force-resolve runtime deps to this project's node_modules ──────
      // (dev repo's node_modules don't hoist these in a way Vite can find via
      // Node-resolution from the dev repo path)
      { find: '@auth0/auth0-react', replacement: path.resolve(__dirname, 'node_modules/@auth0/auth0-react') },
      { find: 'react-router', replacement: path.resolve(__dirname, 'node_modules/react-router') },
      { find: '@untitled-ui/icons-react', replacement: path.resolve(__dirname, 'node_modules/@untitled-ui/icons-react') },
      { find: 'react-i18next', replacement: path.resolve(__dirname, 'node_modules/react-i18next') },
      { find: 'i18next', replacement: path.resolve(__dirname, 'node_modules/i18next') },
      { find: 'react-helmet-async', replacement: path.resolve(__dirname, 'node_modules/react-helmet-async') },
      { find: '@knocklabs/react', replacement: stub('knocklabs.tsx') },
      { find: '@sentry/react', replacement: path.resolve(__dirname, 'node_modules/@sentry/react') },
      { find: '@apollo/client', replacement: path.resolve(__dirname, 'node_modules/@apollo/client') },
      { find: 'graphql', replacement: path.resolve(__dirname, 'node_modules/graphql') },
      { find: 'react-tooltip', replacement: path.resolve(__dirname, 'node_modules/react-tooltip') },
      { find: /^zustand$/, replacement: path.resolve(__dirname, 'node_modules/zustand/esm/index.mjs') },
      // Subpath aliases: anchored regexes (NOT plain strings — a plain
      // 'zustand/vanilla' is treated as a prefix and would corrupt
      // 'zustand/vanilla/shallow' into 'esm/vanilla.mjs/shallow').
      { find: /^zustand\/middleware$/, replacement: path.resolve(__dirname, 'node_modules/zustand/esm/middleware.mjs') },
      { find: /^zustand\/vanilla$/, replacement: path.resolve(__dirname, 'node_modules/zustand/esm/vanilla.mjs') },
      { find: /^zustand\/(.+)$/, replacement: path.resolve(__dirname, 'node_modules/zustand/esm/$1.mjs') },
      { find: 'ace-builds', replacement: path.resolve(__dirname, 'node_modules/ace-builds') },
      { find: 'lucide-react', replacement: path.resolve(__dirname, 'node_modules/lucide-react') },
      { find: 'clsx', replacement: path.resolve(__dirname, 'node_modules/clsx') },
      { find: 'tailwind-merge', replacement: path.resolve(__dirname, 'node_modules/tailwind-merge') },
      { find: 'class-variance-authority', replacement: path.resolve(__dirname, 'node_modules/class-variance-authority') },
      { find: 'framer-motion', replacement: path.resolve(__dirname, 'node_modules/framer-motion') },
      { find: 'react-hot-toast', replacement: path.resolve(__dirname, 'node_modules/react-hot-toast') },
      { find: '@sentry/browser', replacement: path.resolve(__dirname, 'node_modules/@sentry/browser') },
      // Themed cloudscape and web-theme — this project's installed copies
      { find: '@risk-smart/themed-cloudscape-components', replacement: path.resolve(__dirname, 'node_modules/@risk-smart/themed-cloudscape-components') },
      { find: '@risk-smart/web-theme', replacement: path.resolve(__dirname, 'node_modules/@risk-smart/web-theme') },
      { find: '@risk-smart/themed-design-tokens', replacement: path.resolve(__dirname, 'node_modules/@risk-smart/themed-design-tokens') },
      // Workspace packages → alias to dev repo source
      { find: '@risksmart-app/domain', replacement: path.join(DEV_REPO, 'packages/domain') },
      { find: '@risksmart-app/trpc/types', replacement: stub('trpcTypes.ts') },
      { find: '@risksmart-app/trpc', replacement: stub('trpcTypes.ts') },
      // SPECIFIC subpath aliases for @risksmart-app/i18n MUST come before the
      // catch-all below — otherwise '@risksmart-app/i18n/src/ratings' gets
      // rewritten to <i18n>/src/src/ratings (duplicate src) and 404s.
      { find: '@risksmart-app/i18n/src/ratings', replacement: path.join(DEV_REPO, 'packages/i18n/src/ratings.ts') },
      { find: '@risksmart-app/i18n/src/i18n', replacement: path.join(DEV_REPO, 'packages/i18n/src/i18n.ts') },
      { find: '@risksmart-app/i18n', replacement: path.join(DEV_REPO, 'packages/i18n/src') },
      { find: '@amplitude/analytics-browser', replacement: path.resolve(__dirname, 'node_modules/@amplitude/analytics-browser') },
      { find: '@segment/analytics-next', replacement: path.resolve(__dirname, 'node_modules/@segment/analytics-next') },
      { find: '@tanstack/react-query', replacement: path.resolve(__dirname, 'node_modules/@tanstack/react-query') },
      { find: 'chroma-js', replacement: path.resolve(__dirname, 'node_modules/chroma-js') },
      { find: 'dayjs', replacement: path.resolve(__dirname, 'node_modules/dayjs') },
      { find: '@trpc/tanstack-react-query', replacement: path.resolve(__dirname, 'node_modules/@trpc/tanstack-react-query') },
      { find: 'i18next-chained-backend', replacement: path.resolve(__dirname, 'node_modules/i18next-chained-backend') },
      { find: 'i18next-resources-to-backend', replacement: path.resolve(__dirname, 'node_modules/i18next-resources-to-backend') },
      { find: 'i18next-browser-languagedetector', replacement: path.resolve(__dirname, 'node_modules/i18next-browser-languagedetector') },
      { find: 'lodash', replacement: path.resolve(__dirname, 'node_modules/lodash') },
      { find: 'react-hook-form', replacement: path.resolve(__dirname, 'node_modules/react-hook-form') },
      // TinyMCE — heavy WYSIWYG. Stub renders the inline-disabled mode
      // (read-only HTML viewer) used by HelpSection and similar; full
      // editing isn't supported, but every consumer in the dev repo
      // either passes initialValue or ignores the editor entirely.
      { find: '@tinymce/tinymce-react', replacement: stub('tinymceReact.tsx') },
      // form-configuration / shared workspace — catch-all stub
      { find: /^@risksmart-app\/form-configuration.*/, replacement: stub('shared.ts') },
      { find: /^@risksmart-app\/shared.*/, replacement: stub('shared.ts') },
      { find: /^@jsonforms\/.*/, replacement: stub('shared.ts') },
      { find: 'socket.io-client', replacement: stub('shared.ts') },
      { find: 'linkify-react', replacement: stub('NullComponent.tsx') },
      { find: 'linkifyjs', replacement: stub('shared.ts') },
      { find: /^src\/data\/rest\/.*/, replacement: stub('queries.ts') },
      { find: 'src/utilityTypes', replacement: stub('shared.ts') },
      { find: /^src\/ratings\/.*/, replacement: stub('queries.ts') },
      { find: 'src/context/moduleContext', replacement: stub('shared.ts') },
      // (note: '@risksmart-app/i18n/src/ratings' is aliased to the real file
      // earlier in this list, before the @risksmart-app/i18n catch-all.)
      { find: '@risksmart-app/modules/src/index', replacement: stub('shared.ts') },
      { find: /^@risksmart-app\/modules.*/, replacement: stub('shared.ts') },
      { find: 'zod', replacement: path.resolve(__dirname, 'node_modules/zod') },
      { find: '@hookform/resolvers/zod', replacement: path.resolve(__dirname, 'node_modules/@hookform/resolvers/zod') },
      { find: '@hookform/resolvers', replacement: path.resolve(__dirname, 'node_modules/@hookform/resolvers') },
      { find: 'axios', replacement: path.resolve(__dirname, 'node_modules/axios') },
      { find: '@cloudscape-design/collection-hooks', replacement: path.resolve(__dirname, 'node_modules/@cloudscape-design/collection-hooks') },
      { find: 'src/App.config', replacement: stub('shared.ts') },
      { find: 'src/providers/TaxonomyProvider', replacement: stub('shared.ts') },
      { find: 'uuid', replacement: path.resolve(__dirname, 'node_modules/uuid') },
      { find: '@dnd-kit/core', replacement: path.resolve(__dirname, 'node_modules/@dnd-kit/core') },
      { find: '@dnd-kit/sortable', replacement: path.resolve(__dirname, 'node_modules/@dnd-kit/sortable') },
      { find: '@dnd-kit/utilities', replacement: path.resolve(__dirname, 'node_modules/@dnd-kit/utilities') },
      // Highcharts and its subpath modules — dev-repo files import these
      // bare; force-resolve to this project's installed copy so the
      // RSHighcharts wrapper works from outside the dev repo's pnpm tree.
      // Anchored regexes (NOT plain strings) so 'highcharts/modules/X'
      // doesn't get prefix-corrupted by the bare 'highcharts' alias.
      { find: /^highcharts$/, replacement: path.resolve(__dirname, 'node_modules/highcharts') },
      { find: /^highcharts\/(.+)$/, replacement: path.resolve(__dirname, 'node_modules/highcharts/$1') },
      { find: /^highcharts-react-official$/, replacement: path.resolve(__dirname, 'node_modules/highcharts-react-official') },
      { find: '@risksmart-app/shared', replacement: stub('shared.ts') },
      { find: 'digraph-js', replacement: stub('digraphJs.ts') },
    ],
  },
  server: {
    fs: {
      allow: [__dirname, path.resolve(__dirname, '..'), DEV_REPO, WEB_SRC, COMPONENTS_SRC],
    },
  },
  optimizeDeps: {
    // Force Vite's dep optimizer to recognise zustand as ESM with its
    // named `create` export. Without this it sometimes pre-bundles using
    // CJS interop and the named export disappears.
    include: ['zustand', 'zustand/middleware'],
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
});
