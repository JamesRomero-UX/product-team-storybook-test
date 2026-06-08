import type { FC, ReactNode } from 'react';
import ButtonDropdown from 'src/components/button-dropdown';

export type ActionItem = {
  text: string;
  id: string;
  disabled?: boolean;
  onItemClick: () => Promise<void> | void;
  iconSvg?: ReactNode;
};

export type Props = {
  buttonText: string;
  items: ActionItem[];
  variant?: 'normal' | 'primary';
  testId?: string;
  disabled?: boolean;
};

const ActionsButton: FC<Props> = ({
  buttonText,
  items,
  variant,
  testId,
  disabled = false,
}) => {
  return (
    <ButtonDropdown
      disabled={disabled}
      data-testid={testId}
      items={items}
      variant={variant || 'normal'}
      onItemClick={(event) => {
        items.find((option) => option.id === event.detail.id)?.onItemClick();
      }}
    >
      {buttonText}
    </ButtonDropdown>
  );
};

export default ActionsButton;
