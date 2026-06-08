import type { FC, ReactNode } from 'react';

interface Props {
  size?: 'l' | 'm' | 's' | 'xl';
  children: ReactNode | ReactNode[];
}

const FormRow: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

export default FormRow;
