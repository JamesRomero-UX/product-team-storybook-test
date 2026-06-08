import { Accordion, cn } from '@risksmart-app/atomic-ui';
import { type ReactNode, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useFormEditorDialogStore } from '../useFormEditorDialogStore';

export const SwitchSectionField = ({
  value,
  title,
  name,
  children,
}: {
  value: string;
  title: string;
  name: string;
  children?: ReactNode;
}) => {
  const openSections = useFormEditorDialogStore((s) => s.openSections);
  const toggleSwitchSection = useFormEditorDialogStore(
    (s) => s.toggleSwitchSection
  );
  const { control, watch } = useFormContext();

  // Use refs to avoid stale closures in the sync effect
  const openSectionsRef = useRef(openSections);
  openSectionsRef.current = openSections;

  const formValue = watch(name);
  const prevFormValue = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (prevFormValue.current !== formValue) {
      prevFormValue.current = formValue;
      const isInStore = openSectionsRef.current.includes(value);
      if (formValue && !isInStore) {
        toggleSwitchSection(value, true);
      } else if (!formValue && isInStore) {
        toggleSwitchSection(value, false);
      }
    }
  }, [formValue, value, toggleSwitchSection]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const isOpen = openSections.includes(value);
        const handleCheckedChange = (checked: boolean) => {
          field.onChange(checked);
          toggleSwitchSection(value, checked);
        };

        return (
          <Accordion.SwitchItem value={value} className={cn('w-full')}>
            <Accordion.SwitchTrigger
              checked={isOpen}
              onCheckedChange={handleCheckedChange}
              variant={'card'}
            >
              {title}
            </Accordion.SwitchTrigger>
            <Accordion.Content className={'pt-0'}>{children}</Accordion.Content>
          </Accordion.SwitchItem>
        );
      }}
    />
  );
};
