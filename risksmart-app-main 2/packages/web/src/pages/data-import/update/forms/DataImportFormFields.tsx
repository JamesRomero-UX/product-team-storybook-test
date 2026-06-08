import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';

import type { DataImportDataFields } from './dataImportSchema';

const DataImportFormFields: FC = () => {
  const { control } = useFormContext<DataImportDataFields>();

  return (
    <ControlledFileUpload
      testId={'attachFiles'}
      multiple={true}
      name={'files'}
      label={'Files'}
      control={control}
    />
  );
};

export default DataImportFormFields;
