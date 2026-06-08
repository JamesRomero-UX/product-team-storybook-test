import type { FieldValues } from 'react-hook-form';
import { useGetDocumentList } from 'src/hooks/queries';

import ControlledSelect from '../controlled-select';
import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  excludedIds?: string[];
  testId: string;
}

export const ControlledDocumentSelect = <T extends FieldValues>({
  excludedIds,
  ...props
}: Props<T>) => {
  const { data: documents, loading } = useGetDocumentList({ queryArgs: {} });

  return (
    <ControlledSelect
      filteringType={'auto'}
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      options={
        documents?.document
          ?.filter((document) => !excludedIds?.includes(document.Id))
          .map((document) => ({
            value: String(document.Id),
            label: String(document.Title),
          })) || []
      }
    />
  );
};
