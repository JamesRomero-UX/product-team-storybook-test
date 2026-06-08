import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import IssueFormFields from './IssueFormFields';
import type { IssueFormDataFields } from './issueSchema';
import { defaultValues, IssueFormSchema } from './issueSchema';

type Props = Omit<
  FormContextProps<IssueFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & { beforeFieldsSlot?: ReactNode; issueType: ParentIssueType };

const IssueForm: FC<Props> = ({ beforeFieldsSlot, issueType, ...props }) => {
  const { t } = useTranslation('common');
  const issueMapping = IssueTypeMapping[issueType];

  return (
    <CustomisableForm
      {...props}
      schema={IssueFormSchema}
      defaultValues={defaultValues}
      i18n={t(issueMapping.taxonomy)}
      formId={'issue-form'}
      parentType={issueType}
      approvalConfig={{
        object: props.values?.Id ? { Id: props.values.Id } : undefined,
      }}
    >
      {beforeFieldsSlot}
      <IssueFormFields readOnly={props.readOnly} issueType={issueType} />
    </CustomisableForm>
  );
};

export default IssueForm;
