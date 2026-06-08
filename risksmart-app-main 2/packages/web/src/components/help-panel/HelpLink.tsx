import Popover from '@risk-smart/themed-cloudscape-components/popover';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { InfoCircle } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import type { FC } from 'react';
import { useEffect } from 'react';

import { useIsInModal } from '../form/form/modal-provider/ModalContext';
import HelpSection from './HelpSection';
import type { FieldContent } from './useHelpStore';
import { useHelpStore } from './useHelpStore';

type Props = FieldContent & {
  id: string;
};

const HelpLink: FC<Props> = ({ id, title, content }) => {
  const [, setToolsContent] = useTools();

  const { addFieldHelp, removeFieldHelp, setContentId, contentId } =
    useHelpStore();

  const showFieldHelpInPopover = useIsInModal();
  useEffect(() => {
    addFieldHelp(id, { title, content });

    return () => removeFieldHelp(id);
    // i18n content ref changes when text is the same
  }, [addFieldHelp, removeFieldHelp, id, title, content]);
  const isSelected = contentId === id;
  const classes = clsx(
    'rounded-[18px] h-[18px] w-[18px] border-0 text-navy cursor-pointer p-[0px] content-baseline flex justify-center items-center',
    isSelected ? 'bg-teal' : 'bg-[#ecfbfa]'
  );
  const link = (
    <button
      data-testid={'field-help-button'}
      className={classes}
      onClick={() => {
        if (isSelected) {
          setToolsContent(undefined);
          setContentId(null);
        } else {
          if (showFieldHelpInPopover) {
            return;
          }
          setToolsContent('help');
          setContentId(id);
        }
      }}
    >
      <InfoCircle
        viewBox={'0 0 24 24'}
        className={'w-[16px] h-[16px] relative'}
      />
    </button>
  );
  if (showFieldHelpInPopover) {
    return (
      <Popover
        header={' '}
        dismissButton={false}
        size={'large'}
        triggerType={'custom'}
        content={<HelpSection title={''} htmlContent={content} />}
      >
        {link}
      </Popover>
    );
  }

  return link;
};

export default HelpLink;
