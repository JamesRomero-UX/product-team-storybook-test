// Stub for @risksmart-app/components/src/tools/useTools
// Production returns a tuple [toolsContent, setToolsContent, locationChanged].
//
// IMPORTANT: the function references must be stable across calls. The
// dev-repo's AuthenticatedAppLayout puts `setToolsContent` and
// `toolsLocationChanged` in a `useEffect` dep array — if a new arrow is
// created on every render, the effect re-runs every render, which in
// turn calls `locationChanged()` on the real useSidePanelStore (now
// unstubbed in Batch C) — that triggers a zustand `set` that produces a
// new state-object reference, which re-renders subscribers, which calls
// useTools again → infinite update loop. Hoist the noop functions to
// module scope to keep references stable.
const noopSetToolsContent = (_v: any) => {};
const noopLocationChanged = (_loc: string) => {};
const STABLE_TUPLE = [undefined, noopSetToolsContent, noopLocationChanged] as const;

export const useTools = () => STABLE_TUPLE;

export default useTools;
