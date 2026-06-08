import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const Ctx = createContext({
  entityIds: [] as string[],
  setEntityIds: (_ids: string[]) => {},
  entityFilter: undefined as any,
  setEntityFilter: (_f: any) => {},
});

export const EntityFilterProvider = ({ children }: { children: ReactNode }) => (
  <Ctx.Provider value={{ entityIds: [], setEntityIds: () => {}, entityFilter: undefined, setEntityFilter: () => {} }}>
    {children}
  </Ctx.Provider>
);

export const useEntityFilter = () => useContext(Ctx);

export default useEntityFilter;
