// Stub for `src/routes/useNavItems` from packages/web.
//
// The production hook builds the menu by combining:
//   - useTranslation (i18n keys)
//   - useIsFeatureFlagEnabledLazy / useIsModuleEnabled (module visibility)
//   - useHasPermissionQuery / useCheckNavigationVisibility (permissions)
//
// In Storybook these run through stubbed providers that return defaults,
// which produces an inconsistent menu (wrong hrefs, missing items, broken
// active-state matching). The Cloudscape Reference SideNavigation story
// works correctly because it uses our pre-built nav config directly —
// this stub makes AuthenticatedAppLayout (and therefore PageLayout, the
// App Shell, and every Page Template story) use the SAME pre-built config.
//
// Source of truth: ../  _nav-items.tsx — RISKSMART_NAV_ITEMS_WITH_ICONS.

import { RISKSMART_NAV_ITEMS_WITH_ICONS } from '../_nav-items';

// The production hook is named `useNavItems` and returns `NavItemWithIcon[]`.
// Mirror that exact shape so the import-side type-checking passes.
export const useNavItems = () => RISKSMART_NAV_ITEMS_WITH_ICONS;

// Some consumers might import default; export both for safety.
export default useNavItems;
