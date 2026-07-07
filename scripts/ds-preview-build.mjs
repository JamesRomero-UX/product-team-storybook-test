// Mini design-sync converter (preview-bundle stage).
//
// Reconstructs what the /design-sync converter does for one stage: compile a
// Storybook story file into a self-contained `_preview/<Name>.js` IIFE that
// assigns PascalCase render functions to the global `__dsPreview`, with React
// externalized to the window globals the card shell loads (_vendor/react.js).
// Everything else (themed-Cloudscape, the real app components, PageLayout,
// _stubs) is bundled in — matching the existing cloudscape-reference previews.
//
// Usage: node scripts/ds-preview-build.mjs <storyFileAbs> <ExportA,ExportB,...> <outFileAbs>
import { build } from 'vite';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [storyFile, exportsCsv, outFile] = process.argv.slice(2);
if (!storyFile || !exportsCsv || !outFile) {
  console.error('args: <storyFileAbs> <Export,Export> <outFileAbs>');
  process.exit(1);
}
const exportNames = exportsCsv.split(',').map((s) => s.trim()).filter(Boolean);

// Reproduce the Storybook preview CSS environment (.storybook/preview.ts imports
// these as side effects; stories don't, so they'd otherwise be missing from the
// per-story CSS). The .atomic-ui token cascade + global-styles reset + page
// template CSS are what make the app shell (Navigation/PageLayout) render styled.
const dev = (p) => JSON.stringify(resolve(repoRoot, 'risksmart-app-main 2', p));
const own = (p) => JSON.stringify(resolve(repoRoot, p));
const previewEnvCss = [
  `import '@cloudscape-design/global-styles/index.css';`,
  `import ${dev('packages/atomic-ui/src/index.css')};`,
  `import ${own('src/page-templates/_people-picker.css')};`,
  `import ${own('src/page-templates/_risk-dashboard.css')};`,
  `import ${own('src/page-templates/_scheduler.css')};`,
].join('\n');

// Generated entry: re-export each story as a PascalCase render component, with
// Storybook decorators composed (meta.decorators outer, story.decorators inner)
// so provider-wrapped stories (withProviders → RealProviders) render correctly.
// Page-template stories have no meta.decorators (providers live inside render),
// so composition is a no-op there — backward compatible.
const importList = exportNames.map((n) => `${n} as _${n}`).join(', ');
const reexports = exportNames
  .map((n) => `export const ${n} = _mk(_${n});`)
  .join('\n');
const entryCode = `${previewEnvCss}
import * as _React from 'react';
import _meta, { ${importList} } from ${JSON.stringify(storyFile)};
const _md = (_meta && _meta.decorators) || [];
const _ctx = { args: {}, argTypes: {}, globals: {}, hooks: {}, parameters: (_meta && _meta.parameters) || {}, viewMode: 'story', title: (_meta && _meta.title) || '', component: _meta && _meta.component };
function _mk(story) {
  const args = Object.assign({}, (_meta && _meta.args) || {}, (story && story.args) || {});
  const base = (story && story.render) ? () => story.render(args, _ctx)
    : () => _React.createElement((story && story.component) || (_meta && _meta.component), args);
  const decs = [ ..._md, ...((story && story.decorators) || []) ];
  return decs.reduceRight((inner, dec) => () => dec(inner, Object.assign({}, _ctx, { args })), base);
}
${reexports}
`;

// Externalize React to window globals; supply a jsx-runtime shim (the react()
// plugin emits automatic-runtime imports) that routes through window.React —
// so a single shared React instance is used (no dual-React hook crashes).
const reactGlobals = () => {
  const V = new Map([
    ['react', `const R=window.React; export default R; const {createElement,cloneElement,createContext,createRef,forwardRef,isValidElement,lazy,memo,Children,Component,PureComponent,Fragment,StrictMode,Suspense,useCallback,useContext,useDebugValue,useDeferredValue,useEffect,useId,useImperativeHandle,useInsertionEffect,useLayoutEffect,useMemo,useReducer,useRef,useState,useSyncExternalStore,useTransition,startTransition,version}=R; export {createElement,cloneElement,createContext,createRef,forwardRef,isValidElement,lazy,memo,Children,Component,PureComponent,Fragment,StrictMode,Suspense,useCallback,useContext,useDebugValue,useDeferredValue,useEffect,useId,useImperativeHandle,useInsertionEffect,useLayoutEffect,useMemo,useReducer,useRef,useState,useSyncExternalStore,useTransition,startTransition,version};`],
    ['react-dom', `const R=window.ReactDOM; export default R; const {render,hydrate,createPortal,flushSync,unmountComponentAtNode,findDOMNode,unstable_batchedUpdates,unstable_renderSubtreeIntoContainer,createRoot,hydrateRoot,version}=R; export {render,hydrate,createPortal,flushSync,unmountComponentAtNode,findDOMNode,unstable_batchedUpdates,unstable_renderSubtreeIntoContainer,createRoot,hydrateRoot,version};`],
    ['react-dom/client', `const R=window.ReactDOM; export const createRoot=R.createRoot; export const hydrateRoot=R.hydrateRoot; export default R;`],
    // react-dom/server: not in runtime UMD; bundling react-dom@19's server build crashes
    // against React 18.3.1 UMD. Stub it (help-content HTML conversion → '' in previews).
    ['react-dom/server', `function rs(){return '';} const S={renderToStaticMarkup:rs,renderToString:rs,renderToStaticNodeStream:rs,renderToNodeStream:rs,version:'18.3.1'}; export default S; export const renderToStaticMarkup=rs; export const renderToString=rs;`],
    ['react-dom/server.browser', `function rs(){return '';} const S={renderToStaticMarkup:rs,renderToString:rs,version:'18.3.1'}; export default S; export const renderToStaticMarkup=rs; export const renderToString=rs;`],
    ['react/jsx-runtime', `const R=window.React; function j(t,p,k){ if(k!==void 0){p=Object.assign({},p,{key:k});} return R.createElement(t,p); } export const jsx=j; export const jsxs=j; export const Fragment=R.Fragment;`],
    ['react/jsx-dev-runtime', `const R=window.React; function j(t,p,k){ if(k!==void 0){p=Object.assign({},p,{key:k});} return R.createElement(t,p); } export const jsxDEV=j; export const jsx=j; export const jsxs=j; export const Fragment=R.Fragment;`],
  ]);
  return {
    name: 'ds-external-react-globals',
    enforce: 'pre',
    resolveId(id) { return V.has(id) ? '\0dsreact:' + id : null; },
    load(id) { return id.startsWith('\0dsreact:') ? V.get(id.slice('\0dsreact:'.length)) : null; },
  };
};

await build({
  configFile: resolve(repoRoot, 'vite.config.ts'), // inherit aliases + stub plugins
  root: repoRoot,
  logLevel: 'warn',
  plugins: [reactGlobals()],
  define: { 'process.env.NODE_ENV': '"production"' },
  esbuild: { legalComments: 'none' },
  build: {
    write: false,
    minify: 'esbuild',
    cssMinify: true,
    lib: { entry: '\0ds-entry', name: '__dsPreview', formats: ['iife'], fileName: () => 'preview.js' },
    rollupOptions: {
      // virtual entry so we don't drop a temp file into src/
      input: '\0ds-entry',
      output: { compact: true },
      plugins: [{
        name: 'ds-virtual-entry',
        enforce: 'pre',
        resolveId(id) { return id === '\0ds-entry' ? '\0ds-entry' : null; },
        load(id) { return id === '\0ds-entry' ? entryCode : null; },
      }],
    },
  },
}).then((res) => {
  const output = Array.isArray(res) ? res[0].output : res.output;
  const chunk = output.find((o) => o.type === 'chunk');
  const cssAsset = output.find((o) => o.type === 'asset' && String(o.fileName).endsWith('.css'));
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, chunk.code);
  let cssMsg = 'no css';
  if (cssAsset) {
    const cssOut = outFile.replace(/\.js$/, '.css');
    writeFileSync(cssOut, cssAsset.source);
    cssMsg = `+${(cssAsset.source.length / 1024).toFixed(0)} KB css`;
  }
  console.log(`OK wrote ${outFile} (${(chunk.code.length / 1024).toFixed(0)} KB, ${cssMsg}), exports: ${exportNames.join(', ')}`);
});
