import { useQuery } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  GetActionByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { ActionFormFieldData } from 'src/pages/actions/update/forms/actionsSchema';
import { defaultValues } from 'src/pages/actions/update/forms/actionsSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { useInsertChildAction } from '@/hooks/mutations/action/useInsertChildAction';

import ActionForm from '../../actions/update/forms/ActionForm';
import type { AssessmentTypeEnum } from '../types';
import { useAssessmentTypeConfig } from '../useAssessmentTypeConfig';

type Props = {
  assessmentMode: AssessmentTypeEnum;
  readonly: boolean;
  assessmentId: string;
  assessedItem?: ObjectWithContributors;
  id?: string;
  onDismiss?: (saved: boolean) => void;
  beforeFieldsSlot?: ReactNode;
  showAssessmentSelector?: boolean;
  header?: string;
};

const ConnectedActionForm: FC<Props> = ({
  assessmentMode,
  readonly,
  assessmentId,
  id,
  onDismiss,
  beforeFieldsSlot,
  header,
}) => {
  const navigate = useNavigate();
  const { data } = useQuery(GetActionByIdDocument, {
    variables: {
      _eq: id!,
    },
    skip: !id,
  });
  const action = data?.action?.[0];
  const {
    routing: { resultsRegisterUrl },
  } = useAssessmentTypeConfig(assessmentMode);

  const { updateFiles } = useFileUpdate();
  const { insertChildAction } = useInsertChildAction();

  const values: ActionFormFieldData = {
    ...defaultValues,
    ...action,
    files: action?.files.map((rf) => rf.file) ?? [],
    Owners: getOwners(action),
    Contributors: getContributors(action),
    ancestorContributors: action?.ancestorContributors ?? [],
  };

  const onSave = async (data: ActionFormFieldData) => {
    const { files } = data;
    const result = await insertChildAction({
      ...data,
      ParentId: assessmentId,
      CustomAttributeData: data?.CustomAttributeData || undefined,
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      ...ownerAndContributorIds(data),
    });

    if (!result?.insertChildAction?.Id) {
      throw new Error('Action id is missing');
    }

    await updateFiles({
      parentId: result?.insertChildAction?.Id,
      parentType: Parent_Type_Enum.Action,
      selectedFiles: files,
      originalFiles: values?.files ?? [],
    });
    navigate(resultsRegisterUrl(assessmentId));
  };

  return (
    <ActionForm
      header={header}
      onDismiss={onDismiss}
      values={values}
      onSave={onSave}
      readOnly={readonly}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      beforeFieldsSlot={beforeFieldsSlot}
    />
  );
};

export default ConnectedActionForm;
