import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa';
import { VitePWA } from 'vite-plugin-pwa';

import packageConfig from './package.json';

const defaultPwaOptions = (
  mode: 'development' | 'production' | undefined
): Partial<VitePWAOptions> => ({
  mode,
  base: '/',
  devOptions: {
    enabled: mode === 'development',
    type: 'module',
    navigateFallback: 'index.html',
  },
  workbox: {
    globIgnores: [
      'organisation/**', // Exclude due customer list leaking
      'tenant/**', // Exclude due customer list leaking
    ],
  },
  manifest: {
    name: 'RiskSmart',
    short_name: 'RiskSmart',
    description:
      "Build resilience, centralise your work, and unlock your risk team's potential. There simply isn't an easier way to manage risk.",
    theme_color: '#41d9cc',
    background_color: '#0F0F2D',
    display: 'minimal-ui',
    scope: '/',
    start_url: '/',
    dir: 'auto' as 'ltr' | 'rtl' | undefined,
    orientation: 'any',
    icons: [
      {
        src: 'app_images/windows11/Square150x150Logo.scale-100.png',
        sizes: '150x150',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'app_images/windows11/Wide310x150Logo.scale-100.png',
        sizes: '310x150',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'app_images/windows11/LargeTile.scale-100.png',
        sizes: '310x310',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'app_images/android/android-launchericon-192-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'app_images/ios/180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'app_images/ios/512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
  },
});

export const getPwaPlugin = (
  mode: 'development' | 'production' | undefined
) => {
  const selfDestroying = process.env.SW_DESTROY === 'true';
  const pwaOptions: Partial<VitePWAOptions> = defaultPwaOptions(mode);
  pwaOptions.mode = mode as 'development' | 'production';
  pwaOptions.srcDir = 'src';
  pwaOptions.filename = 'prompt-sw.ts';
  pwaOptions.strategies = 'injectManifest';
  const manifest: Partial<ManifestOptions> =
    pwaOptions.manifest as Partial<ManifestOptions>;
  manifest.name = 'RiskSmart';
  manifest.short_name = 'RiskSmart';
  // TODO: check why types don't include this field? is it used..
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (manifest as any).version = packageConfig.version;
  pwaOptions.injectManifest = {
    minify: true,
    enableWorkboxModulesLogs: true,
    maximumFileSizeToCacheInBytes: 12000000,
  };

  if (selfDestroying) {
    pwaOptions.selfDestroying = selfDestroying;
  }

  return VitePWA(pwaOptions);
};
