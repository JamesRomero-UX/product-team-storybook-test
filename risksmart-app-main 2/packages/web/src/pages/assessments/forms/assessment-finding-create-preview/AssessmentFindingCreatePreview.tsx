import { isApolloError } from '@apollo/client';
import Icon from '@risk-smart/themed-cloudscape-components/icon';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import i18next from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import axios from 'axios';
import type { ParseKeys } from 'i18next';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { mutationResultNotification } from '@/hooks/useMutationResultNotification';
import { getErrorMessage, handleError } from '@/utils/errorUtils';
import {
  assessmentResultsAddUrl,
  complianceMonitoringAssessmentResultsAddUrl,
  internalAuditReportResultsAddUrl,
} from '@/utils/urls';

import type { AssessmentTypeEnum } from '../../types';
import type {
  AssessmentActivityFormDataFields,
  LinkedItem,
} from '../assessment-activity-form/assessmentActivitySchema';

interface AssessmentFindingLink {
  id: string;
  label: string;
}

interface Props {
  entityLabel: ParseKeys<'common'>;
  ratingType: Parent_Type_Enum;
  assessmentId: string;
  mode: AssessmentTypeEnum;
  onSubmit: (variables: AssessmentActivityFormDataFields) => Promise<void>;
}

const Item: FC<AssessmentFindingLink> = ({ id, label }) => {
  return (
    <div key={`lr-${id}`}>
      <h5 className={'m-0 font-semibold text-gray-300'}>{label}</h5>
    </div>
  );
};

export const AssessmentFindingCreatePreview: FC<Props> = ({
  entityLabel,
  assessmentId,
  ratingType,
  onSubmit,
  mode,
}) => {
  const navigate = useNavigate();
  const methods = useFormContext();
  const { t } = useTranslation(['common']);
  const { addNotification } = useNotifications();
  const { isValid, isDirty } = methods.formState;
  const linkedItemField = methods.watch('LinkedItemIds');
  const assessmentLinks = linkedItemField
    .filter((c: LinkedItem) => {
      switch (ratingType) {
        case Parent_Type_Enum.TestResult: {
          return c.Type === Parent_Type_Enum.Control;
        }
        case Parent_Type_Enum.DocumentAssessmentResult: {
          return c.Type === Parent_Type_Enum.Document;
        }
        case Parent_Type_Enum.RiskAssessmentResult: {
          return c.Type === Parent_Type_Enum.Risk;
        }
        case Parent_Type_Enum.ObligationAssessmentResult: {
          return c.Type === Parent_Type_Enum.Obligation;
        }
      }

      return false;
    })
    .map(
      (a: LinkedItem): AssessmentFindingLink => ({
        label: a.Label,
        id: a.Id,
      })
    );

  const navigateToFindingCreate = () => {
    const ids = assessmentLinks.map((c: AssessmentFindingLink) => c.id);
    switch (mode) {
      case 'compliance_monitoring_assessment': {
        navigate(complianceMonitoringAssessmentResultsAddUrl(assessmentId), {
          state: {
            type: 'rating',
            ratingType: ratingType,
            ids: ids,
          },
        });
        break;
      }
      case 'internal_audit_report': {
        navigate(internalAuditReportResultsAddUrl(assessmentId), {
          state: {
            type: 'rating',
            ratingType: ratingType,
            ids: ids,
          },
        });
        break;
      }
      case 'rating': {
        navigate(assessmentResultsAddUrl(assessmentId), {
          state: {
            type: 'rating',
            ratingType: ratingType,
            ids: ids,
          },
        });
        break;
      }
    }
  };

  const handleClick = async () => {
    await methods.trigger();
    if (!isValid) {
      return;
    }

    if (!isDirty) {
      navigateToFindingCreate();

      return;
    }

    await mutationResultNotification({
      addNotification,
      successMessageKey: 'update_success_message',
      entityName: t('activity_one'),
      asyncAction: async () => {
        try {
          await methods.handleSubmit(async (variables) => {
            await onSubmit(variables as AssessmentActivityFormDataFields);
            navigateToFindingCreate();
          })();
        } catch (error) {
          const e = error as Error;
          handleError(e);
          if (axios.isAxiosError(e) && e.config?.url?.startsWith('/files')) {
            // @ts-ignore
            methods.setError('newFiles', {
              message: getErrorMessage(e) || 'Unable to upload files',
            });
          } else if (isApolloError(e)) {
            // @ts-ignore
            methods.setError('global', {
              message: e.message,
              type: e.graphQLErrors?.[0]?.extensions?.code as string,
            });
          }

          return false;
        }

        return true;
      },
    })({});
  };

  return (
    <>
      {assessmentLinks && assessmentLinks.length > 0 && (
        <div
          className={`m-3 p-5 bg-off_white rounded-md flex flex-col gap-4 justify-items-start cursor-pointer`}
          onClick={handleClick}
        >
          <div
            className={
              'p-4 bg-white border-grey150 border-solid border-2 rounded-md gap-2 cursor-pointer'
            }
          >
            <div className={'flex items-center justify-between'}>
              <h4 className={'m-0 font-semibold text-gray-300'}>
                {t('assessmentActivities.findingCreateMessage', {
                  entity: i18next.format(t(entityLabel), 'lowercase'),
                  finding: t('finding', { count: assessmentLinks.length }),
                })}
              </h4>
              <Icon name={'add-plus'} />
            </div>
            <div className={'flex flex-column'}>
              <div className={'p-1'}>
                {assessmentLinks
                  ?.map((afl: AssessmentFindingLink) => ({ ...afl }))
                  .map(Item)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentFindingCreatePreview;
