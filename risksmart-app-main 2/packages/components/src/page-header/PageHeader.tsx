import type { HeaderProps } from '@risk-smart/themed-cloudscape-components/header';
import Header from '@risk-smart/themed-cloudscape-components/header';
import type { FC } from 'react';

type Props = HeaderProps;

const PageHeader: FC<Props> = ({ children, counter, actions, ...rest }) => {
  const variant = rest.variant || 'h1';

  return (
    <div className={'rs-header'}>
      <Header
        variant={variant}
        actions={<div className={'flex '}>{actions}</div>}
        {...rest}
      >
        <div
          className={
            'flex flex-row items-baseline font-bold text-grey800 text-[30px]/[30px]'
          }
        >
          <div data-testid={'heading-text'}>{children}</div>
          {counter && (
            <span
              data-testid={'heading-count'}
              className={'ml-3 text-grey font-normal text-[24px]'}
            >
              {counter}
            </span>
          )}
        </div>
      </Header>
    </div>
  );
};

export default PageHeader;
