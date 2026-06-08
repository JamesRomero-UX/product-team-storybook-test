// Catch-all stub for @risksmart-app/shared imports
const proxy: any = new Proxy(
  {},
  {
    get(_t, prop: string) {
      if (prop === '__esModule' || prop === 'default') return proxy;
      return new Proxy(() => undefined, { get: () => undefined });
    },
  },
);
export default proxy;
