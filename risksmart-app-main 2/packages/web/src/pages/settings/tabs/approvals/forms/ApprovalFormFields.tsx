import { useQuery } from '@apollo/client';
import { workflows } from '@risksmart-app/shared/approvals/workflows';
import {
  Approval_In_Flight_Edit_Rule_Enum,
  GetObjectTypeByIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { SwitchHorizontal01, Trash01 } from '@untitled-ui/icons-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledSelect from 'src/components/form/controlled-select';

import type { ApprovalFormValues } from './approvalFormSchema';
import ControlledApprovalLevels from './ControlledApprovalLevels';

type Props = {
  parentId?: string;
};

const ApprovalFormFields = ({ parentId }: Props) => {
  const { control, watch, setValue } = useFormContext<ApprovalFormValues>();
  const { t } = useTranslation(['common'], { keyPrefix: 'approvals' });
  const { t: st } = useTranslation(['common']);
  const { data } = useQuery(GetObjectTypeByIdDocument, {
    variables: { Id: parentId! },
    skip: !parentId,
  });
  const parentTypeMap = st('objectTypes', { returnObjects: true });
  const workflowMap = t('workflows', { returnObjects: true });
  const workflowDescriptions = t('workflowDescriptions', {
    returnObjects: true,
  });

  const id = watch('Id');
  const updating = !!id;

  useEffect(() => {
    setValue('ParentId', parentId);
  }, [parentId, setValue]);

  const workflowOptions = Object.entries(workflows)
    .filter(([category]) => {
      if (!parentId) {
        return true;
      }

      return data?.node?.ObjectType === category;
    })
    .map(([category, workflows]) => ({
      label: parentTypeMap[category as keyof typeof parentTypeMap],
      options: workflows.map((workflow) => ({
        value: workflow,
        label: workflowMap[workflow],
        description: workflowDescriptions[workflow],
        iconSvg: workflow.includes('delete-') ? (
          <Trash01 viewBox={'0 0 24 24'} />
        ) : (
          <SwitchHorizontal01 viewBox={'0 0 24 24'} />
        ),
      })),
    }));

  const inFlightEditTranslations = t('in_flight_edit_rules');
  const inFlightEditOptions = Object.values(
    Approval_In_Flight_Edit_Rule_Enum
  ).map((value) => ({
    value,
    label: inFlightEditTranslations?.[value] ?? value,
  }));

  return (
    <div data-testid={'approval-form-fields'}>
      <ControlledSelect
        options={workflowOptions}
        name={'Workflow'}
        label={t('fields.workflow')}
        placeholder={t('fields.workflow_placeholder')}
        description={t('fields.workflow_help')}
        control={control}
        disabled={updating}
        testId={'workflow'}
      />

      <ControlledApprovalLevels
        name={'levels'}
        control={control}
        label={t('fields.levels')}
        description={t('fields.levels_help')}
        parentId={parentId}
      />
      <ControlledSelect
        testId={'inFlightEditRule'}
        options={inFlightEditOptions}
        name={'InFlightEditRule'}
        label={t('fields.inflight_edit_rule')}
        placeholder={t('fields.inflight_edit_rule_placeholder')}
        description={t('fields.inflight_edit_rule_help')}
        control={control}
      />
    </div>
  );
};

export default ApprovalFormFields;
