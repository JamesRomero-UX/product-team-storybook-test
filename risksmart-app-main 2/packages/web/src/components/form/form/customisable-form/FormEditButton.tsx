import Button from '@risk-smart/themed-cloudscape-components/button';
import { Edit05 } from '@untitled-ui/icons-react';

import style from './style.module.scss';

type Props = {
  onClick?: () => void;
};

function FormEditButton({ onClick }: Props) {
  return (
    <div
      className={style.fieldControl}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Button
        variant={'icon'}
        iconSvg={
          <Edit05
            className={'text-grey500'}
            viewBox={'0 0 24 24'}
            width={'100%'}
            height={'100%'}
          />
        }
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }}
      ></Button>
    </div>
  );
}

export default FormEditButton;
