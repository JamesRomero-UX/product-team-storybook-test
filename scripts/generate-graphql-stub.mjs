// Generates vendor/web-graphql-client/generated/graphql.ts from the checked-in
// .graphql documents in the dev repo. The real codegen output isn't committed
// (it requires a running Hasura instance to introspect the schema), so we
// stub it from the source documents.
//
// Re-run this script when documents change:
//   pnpm graphql-stub
//
// What it does:
//   1. Globs every *.graphql file under the dev repo's graphql/ folder.
//   2. Parses each (via the `graphql` package) to find named operations and
//      fragments. For each, emits:
//        export const <Name>Document = parse(`<verbatim source>`) as any;
//        export type <Name>Query = any;     (kind-appropriate)
//        export type <Name>QueryVariables = any;
//        ...
//   3. Greps the dev repo's web/src and components/src for non-Document/non-
//      *Query/*Mutation/*Subscription/*Fragment named imports from
//      '@risksmart-app/web-graphql-client/generated/graphql' — these are
//      enums and helper types that production code uses at runtime.
//      Each enum becomes a Proxy stub that returns lowercased member name
//      strings (matches Hasura's lowercase enum-table conventions).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse, Kind } from 'graphql';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_REPO = resolve(__dirname, '..', '..', 'risksmart-app-main 2');
const GRAPHQL_ROOT = join(DEV_REPO, 'packages', 'web-graphql-client', 'graphql');
const WEB_SRC = join(DEV_REPO, 'packages', 'web', 'src');
const COMPONENTS_SRC = join(DEV_REPO, 'packages', 'components', 'src');
const OUT = join(__dirname, '..', 'vendor', 'web-graphql-client', 'generated', 'graphql.ts');

// Enums whose members must keep specific casing to match Hasura comparisons.
// Add to this map if the first storybook pass surfaces an enum value mismatch
// at runtime.
const ENUM_OVERRIDES = {
  // Example shape — uncomment / extend per-error if needed:
  // Foo_Bar_Enum: { Risk: 'risk', Document: 'document' },
};

// ─── 1. Walk graphql/ recursively ───────────────────────────────────────────
const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith('.graphql')) {
      out.push(full);
    }
  }
  return out;
};

const documents = [];
for (const file of walk(GRAPHQL_ROOT)) {
  const source = readFileSync(file, 'utf-8');
  let doc;
  try {
    doc = parse(source);
  } catch (e) {
    console.warn(`skip ${file}: parse failed (${e.message})`);
    continue;
  }
  // Each top-level definition could be query / mutation / subscription /
  // fragment. Capture each with its raw printed source so the generated
  // stub re-parses the exact text the dev repo wrote.
  for (const def of doc.definitions) {
    if (
      def.kind === Kind.OPERATION_DEFINITION ||
      def.kind === Kind.FRAGMENT_DEFINITION
    ) {
      const name = def.name?.value;
      if (!name) continue;
      // capture the source slice for this definition
      const start = def.loc?.start ?? 0;
      const end = def.loc?.end ?? source.length;
      const text = source.slice(start, end);
      documents.push({
        name,
        kind: def.kind === Kind.OPERATION_DEFINITION ? def.operation : 'fragment',
        text,
      });
    }
  }
}

// Resolve fragment dependencies: any operation that uses a fragment needs that
// fragment's text concatenated. Build a fragment lookup, then for every
// document compute its transitive fragment closure and emit text accordingly.
const fragmentByName = new Map();
for (const d of documents) if (d.kind === 'fragment') fragmentByName.set(d.name, d);

const findFragmentSpreads = (text) => {
  const re = /\.\.\.([A-Za-z_][A-Za-z0-9_]*)/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text))) out.add(m[1]);
  return out;
};

const expandedTextFor = (doc, seen = new Set()) => {
  const spreads = findFragmentSpreads(doc.text);
  let extra = '';
  for (const spread of spreads) {
    if (seen.has(spread)) continue;
    const frag = fragmentByName.get(spread);
    if (!frag) continue;
    seen.add(spread);
    extra += '\n\n' + expandedTextFor(frag, seen);
  }
  return doc.text + extra;
};

// ─── 2. Grep for enum/helper-type imports from the generated module ─────────
const grepForExports = () => {
  const named = new Set();
  // Walk every .ts/.tsx in web/src and components/src.
  const importRe =
    /from ['"]@risksmart-app\/web-graphql-client\/generated\/graphql['"]/g;
  const namedRe = /\{([^}]+)\}/g;

  const walkSrc = (dir) => {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry);
      let st;
      try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) {
        if (entry === 'node_modules' || entry === 'dist') continue;
        walkSrc(full);
      } else if (/\.(ts|tsx)$/.test(entry)) {
        let text;
        try { text = readFileSync(full, 'utf-8'); } catch { continue; }
        if (!importRe.test(text)) continue;
        importRe.lastIndex = 0;
        // capture every `import { A, B } from '@risksmart-app/.../generated/graphql'`
        const stmtRe = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]@risksmart-app\/web-graphql-client\/generated\/graphql['"]/g;
        let m;
        while ((m = stmtRe.exec(text))) {
          for (const piece of m[1].split(',')) {
            const cleaned = piece
              .replace(/\btype\b/g, '')
              .replace(/\s+as\s+\w+/g, '')
              .trim();
            if (cleaned) named.add(cleaned);
          }
        }
      }
    }
  };
  walkSrc(WEB_SRC);
  walkSrc(COMPONENTS_SRC);
  return named;
};

const referenced = grepForExports();

// ─── 3. Categorise referenced names ─────────────────────────────────────────
const operationNames = new Set(documents.map((d) => d.name));
const isOperationArtifact = (name) => {
  if (operationNames.has(name)) return true;
  for (const d of documents) {
    if (
      name === `${d.name}Document` ||
      name === `${d.name}Query` ||
      name === `${d.name}QueryVariables` ||
      name === `${d.name}Mutation` ||
      name === `${d.name}MutationVariables` ||
      name === `${d.name}Subscription` ||
      name === `${d.name}SubscriptionVariables` ||
      name === `${d.name}Fragment` ||
      name === `${d.name}FragmentDoc` ||
      name === `${d.name}Result`
    ) {
      return true;
    }
  }
  return false;
};

// Anything unreferenced and ending with _Enum, OR any "PascalCase + _Enum" import
// is an enum. Anything else that isn't an operation artefact and isn't `namedOperations`
// is a misc type alias.
const enums = new Set();
const otherTypes = new Set();
for (const name of referenced) {
  if (isOperationArtifact(name)) continue;
  if (name === 'namedOperations') continue;
  if (/_Enum$/.test(name)) {
    enums.add(name);
  } else if (/^[A-Z]/.test(name)) {
    otherTypes.add(name);
  }
}

// ─── 4. Emit the stub file ──────────────────────────────────────────────────
mkdirSync(dirname(OUT), { recursive: true });

const lines = [];
const emittedConsts = new Set();
const emittedTypes = new Set();
const emit = (kind, name, line) => {
  const set = kind === 'const' ? emittedConsts : emittedTypes;
  if (set.has(name)) return false;
  set.add(name);
  lines.push(line);
  return true;
};
lines.push(
  '// GENERATED STUB — do not edit by hand. Run scripts/generate-graphql-stub.mjs to refresh.',
);
lines.push(
  '// Source: ~/Documents/risksmart-app-main 2/packages/web-graphql-client/graphql/**/*.graphql',
);
lines.push('//');
lines.push(
  '// The real generated/graphql.ts is codegen output that requires a running',
);
lines.push(
  '// Hasura instance. This stub re-parses the checked-in .graphql documents at',
);
lines.push(
  '// build time, returns weak `any` types, and exports lowercase-string Proxy',
);
lines.push(
  '// stubs for enums (matches Hasura\'s lowercase enum-table convention).',
);
lines.push('');
lines.push(`/* eslint-disable */`);
lines.push(`import { parse } from 'graphql';`);
lines.push('');

// Document constants — emit once per operation/fragment with expanded fragment text.
for (const d of documents) {
  const fullText = expandedTextFor(d);
  const safe = fullText.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const cName = d.name[0].toUpperCase() + d.name.slice(1);
  emit('const', `${cName}Document`, `export const ${cName}Document = parse(\`${safe}\`) as any;`);
  if (d.kind === 'query') {
    emit('type', `${cName}Query`, `export type ${cName}Query = any;`);
    emit('type', `${cName}QueryVariables`, `export type ${cName}QueryVariables = any;`);
    emit('type', `Get${cName}Query`, `export type Get${cName}Query = any;`);
  } else if (d.kind === 'mutation') {
    emit('type', `${cName}Mutation`, `export type ${cName}Mutation = any;`);
    emit('type', `${cName}MutationVariables`, `export type ${cName}MutationVariables = any;`);
  } else if (d.kind === 'subscription') {
    emit('type', `${cName}Subscription`, `export type ${cName}Subscription = any;`);
    emit('type', `${cName}SubscriptionVariables`, `export type ${cName}SubscriptionVariables = any;`);
  } else if (d.kind === 'fragment') {
    emit('type', `${cName}Fragment`, `export type ${cName}Fragment = any;`);
  }
  // also lowercase-original-name aliases
  if (d.name !== cName) {
    if (d.kind === 'query') {
      emit('type', `${d.name}Query`, `export type ${d.name}Query = any;`);
      emit('type', `${d.name}QueryVariables`, `export type ${d.name}QueryVariables = any;`);
    } else if (d.kind === 'mutation') {
      emit('type', `${d.name}Mutation`, `export type ${d.name}Mutation = any;`);
      emit('type', `${d.name}MutationVariables`, `export type ${d.name}MutationVariables = any;`);
    } else if (d.kind === 'fragment') {
      emit('type', `${d.name}Fragment`, `export type ${d.name}Fragment = any;`);
    }
  }
  lines.push('');
}

// Enums as Proxies returning lowercased member names.
for (const e of enums) {
  if (emittedConsts.has(e)) continue;
  if (ENUM_OVERRIDES[e]) {
    const obj = JSON.stringify(ENUM_OVERRIDES[e]);
    emit('const', e, `export const ${e}: any = ${obj};`);
  } else {
    emit('const', e, `export const ${e}: any = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key.toLowerCase() : undefined });`);
  }
  emit('type', e, `export type ${e} = string;`);
}
lines.push('');

// Helper / non-enum type aliases.
for (const t of otherTypes) {
  if (enums.has(t) || isOperationArtifact(t)) continue;
  if (emittedConsts.has(t) || emittedTypes.has(t)) continue;
  emit('type', t, `export type ${t} = any;`);
  emit('const', t, `export const ${t}: any = undefined;`);
}
lines.push('');

// `namedOperations` is referenced as runtime values (e.g. `namedOperations.Query.getRiskRegister`).
lines.push(`export const namedOperations: any = new Proxy({}, {`);
lines.push(`  get: () => new Proxy({}, { get: (_, key) => String(key) }),`);
lines.push(`});`);
lines.push('');

writeFileSync(OUT, lines.join('\n'));

console.log(`Wrote ${OUT}`);
console.log(`  documents: ${documents.length}`);
console.log(`  enums:     ${enums.size}`);
console.log(`  other:     ${otherTypes.size}`);
