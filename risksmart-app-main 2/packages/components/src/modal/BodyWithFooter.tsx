import type { FC, ReactNode } from 'react';

interface Props {
  body: ReactNode;
  footer: ReactNode;
}

const BodyWithFooter: FC<Props> = ({ body, footer }) => (
  <div>
    <div className={'p-5'}>{body}</div>
    <div
      className={
        'bottom-0 sticky p-5 bg-white rounded-b-[10px] border-grey200  border-x-0 border-b-0 border-t-[2px] border-solid'
      }
    >
      {footer}
    </div>
  </div>
);

export default BodyWithFooter;
