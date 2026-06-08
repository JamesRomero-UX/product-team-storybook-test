import type { PropsWithChildren } from 'react';

type Props = {
  key: string;
};

function FieldGroup({ children }: PropsWithChildren<Props>) {
  return children;
}

export default FieldGroup;
