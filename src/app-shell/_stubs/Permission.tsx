// Storybook stub — render children unconditionally (allowed: this is a
// permission GATE, not a UI-rendering component; it controls visibility).
import type { FC, ReactNode } from 'react';

export const Permission: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;
export default Permission;
