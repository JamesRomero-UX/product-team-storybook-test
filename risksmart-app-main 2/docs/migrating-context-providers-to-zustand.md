# Migration Guide: Swapping out Context Providers for Zustand Stores

## Overview

To address the limitations of React's Context API, we are considering migrating to Zustand for state management. This will allow us
to:

- Simplify state management
- Improve the performance by reducing the number of re-renders (React Context Providers re-render ALL nested children
  when ANY of the state changes)
- Allow for more granular control over state updates
- Simplify unit testing for hooks (it is now possible to test the hooks directly without needing to wrap them in a
  component by using `react-hooks-testing-library`)
- Reduce the amount of boilerplate code and clunky, tightly coupled wrappers needed to manage state

## See Live Example Here → [FormBuilder](../packages/components/FormBuilder/store)
## 🐻 Zustand Docs 🔗 [HERE](https://github.com/pmndrs/zustand)

## Migrating

- **Create a store file** for the component that needs state management. This file should use the `create` function
   provided by `zustand`
  - **Example:** `useMyEntityStore.ts`
    - ```typescript
        import { create } from 'zustand';

        type MyEntityState = {};

        export const useMyEntityStore = create<MyEntityState>((set) => ({}));
       ```
- **Migrate all state** management logic from the Provider to the store file
  - **Example:**
    - **Before:** `myEntityProvider.tsx`
    - ```typescript jsx
      import React, { createContext, useContext, useState } from 'react';

      const MyEntityContext = createContext();

      export const MyEntityProvider = ({ children }) => {
        const [myEntity, setMyEntity] = useState('');

        return (
          <MyEntityContext.Provider value={{ myEntity, setMyEntity }}>
            {children}
          </MyEntityContext.Provider>
        );
      };

      export const useMyEntityContext = () => useContext(MyEntityContext);
      ```
    - **After:** `useMyEntityStore.ts`
    - ```typescript
      import { create } from 'zustand';

      type MyEntityState = {
        myEntity: string;
        setMyEntity: (myEntity: string) => void;
      };

      export const useMyEntityStore = create<MyEntityState>((set) => ({
        myEntity: '',
        setMyEntity: (myEntity: string) => set({ myEntity }),
      }));
      ```
- **Refactor usages of context hook** to use the new store. This will involve importing the new store hook and using the `useShallow` hook from `zustand/react/shallow` to reduce unnecessary re-renders
  - **Example:**
    - `MyEntityComponent.tsx`
    - ```typescript jsx
      // import { useMyEntityContext } from './myEntityProvider'; // REPLACE THIS
      import { useMyEntityStore } from './useMyEntityStore';
      import { useShallow } from 'zustand/react/shallow';

      export const MyEntityComponent = () => {
        // const { myEntity, setMyEntity } = useMyEntityContext(); // REPLACE THIS
        const { myEntity, setMyEntity } = useMyEntityStore( // WITH THIS
          // useShallow is used to prevent unnecessary re-renders
          // This is not strictly necessary but will improve performance
          useShallow((state) => ({
            myEntity: state.myEntity,
            setMyEntity: state.setMyEntity
          }))
        );

        return (
          <div>
            <input value={myEntity} onChange={(e) => setMyEntity(e.target.value)} />
          </div>
        );
      };
      ```
- **Remove unused Provider file(s)** and any wrapped components
- **Write tests** for your new store using `react-hooks-testing-library`
  - **Example:** `useMyEntityStore.test.ts`
    - ```typescript
      import { renderHook, act } from '@testing-library/react-hooks';
      import { useMyEntityStore } from './useMyEntityStore';

      describe('useMyEntityStore', () => {
        it('should set myEntity', () => {
          const { result } = renderHook(() => useMyEntityStore());

          act(() => {
            result.current.setMyEntity('new value');
          });

          expect(result.current.myEntity).toBe('new value');
        });
      });
      ```

## Advanced Usage
- **Referencing state from another store**
  - **Example:** `useMyEntityStore.ts`
    - ```typescript
      import { create } from 'zustand';

      type MyEntityState = {
        myEntity: string;
        setMyEntity: (myEntity: string) => void;
      };

      export const useMyEntityStore = create<MyEntityState>((set) => ({
        myEntity: '',
        setMyEntity: (myEntity: string) => set({ myEntity }),
      }));
      ```
  - **Example:** `useAnotherStore.ts`
    - ```typescript
      import { create } from 'zustand';
      import { useMyEntityStore } from './useMyEntityStore';

      type AnotherState = {
        anotherValue: string;
        setAnotherValue: (anotherValue: string) => void;
      };

      export const useAnotherStore = create<AnotherState>((set) => {
        const { setMyEntity } = useMyEntityStore.getState(); // Access state/actions in the myEntity store

        return {
          anotherValue: '',
          setAnotherValue: (anotherValue: string) => {
            set({ anotherValue });
            setMyEntity('myEntity modified by another store');
          },
        };
      });
      ```
