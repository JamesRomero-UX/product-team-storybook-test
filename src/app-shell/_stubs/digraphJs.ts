// Stub for `digraph-js` — only used inside form conditional-fields logic
// which is not exercised by the App Shell or composed page templates.
// Provides a `DiGraph` class with the surface area the dev repo's
// conditionsGraph.ts touches (addVertices, addEdge, hasCycles, traversal).
export class DiGraph<T = unknown> {
  private vertices = new Map<string, T>();
  addVertex(_id: string, _value?: T) {}
  addVertices(_entries: Array<{ id: string; adjacentTo?: string[] }>) {}
  addEdge(_from: string, _to: string) {}
  removeEdge(_from: string, _to: string) {}
  removeVertex(_id: string) {}
  hasCycles() {
    return false;
  }
  hasVertex(_id: string) {
    return false;
  }
  getVertex(_id: string): any {
    return undefined;
  }
  toDict() {
    return {} as any;
  }
  traverseEager(_id: string): any[] {
    return [];
  }
  *traverse(): Generator<any> {}
}

export default { DiGraph };
