import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { RiskSmartFormProvider } from 'src/components/form/form/customisable-form/RiskSmartFormProvider';
import { CustomisableFormDataProvider } from 'src/components/form/form/customisable-form-data/CustomisableFormDataProvider';

export function TestFormProvider<T extends FieldValues>({
  children,
  values,
  parentType,
  includeCustomisableFormData,
}: {
  children: ReactNode;
  values?: T;
  parentType?: FormId;
  includeCustomisableFormData?: boolean;
}) {
  const methods = useForm<T>({
    values,
  });

  let form = (
    <FormProvider {...methods}>
      <RiskSmartFormProvider
        parentType={parentType}
        setOnSave={() => null}
        setCustomFormValidation={() => null}
        previewChanges={null}
        defaultOnSave={async () => void 0}
        beforeSaveHooks={[]}
        setBeforeSaveHooks={() => null}
      >
        {children}
      </RiskSmartFormProvider>
    </FormProvider>
  );
  if (includeCustomisableFormData) {
    form = (
      <CustomisableFormDataProvider parentType={parentType}>
        {form}
      </CustomisableFormDataProvider>
    );
  }

  return form;
}
