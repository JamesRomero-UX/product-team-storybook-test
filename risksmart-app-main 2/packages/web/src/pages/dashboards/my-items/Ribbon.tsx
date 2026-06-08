import { useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { GetMyItemsDashboardDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { DashboardItemProps } from 'src/components/register-dashboard/DashboardItem';
import { DashboardItem } from 'src/components/register-dashboard/DashboardItem';
import RegisterDashboard from 'src/components/register-dashboard/RegisterDashboard';
import { useFilterStore as useActivitiesFilterStore } from 'src/pages/assessments/activities/useFilterStore';

import { useChangeRequests } from '@/hooks/useChangeRequests';
import {
  actionRegisterUrl,
  assessmentActivitiesRegisterPageUrl,
  assessmentRegisterUrl,
  controlRegisterUrl,
  indicatorRegisterUrl,
  issueRegisterUrl,
  obligationRegister,
  policyRegisterUrl,
  publicPoliciesUrl,
  requestsRegisterUrl,
  riskRegisterUrl,
} from '@/utils/urls';

import { useDashboardStore } from '../useDashboardStore';
import useGetClickthroughEnabled from './hooks/useGetClickthroughEnabled';
import { useGetMyItemsFilteringTokens } from './hooks/useGetMyItemsFilteringTokens';
import { useGetQueryVariables } from './hooks/useGetQueryVariables';
import { useGetRibbonItemVisibilities } from './hooks/useGetRibbonItemVisibilities';

const Ribbon: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.myItemsDashboard.ribbonTitles',
  });
  const { t: st } = useTranslation(['common'], { keyPrefix: 'dashboard' });
  const itemVisibilities = useGetRibbonItemVisibilities();

  const noClickthroughMessageContent = useMemo(
    () => st('my_items_filters_alert'),
    [st]
  );

  const { setRCSAActivityFilter } = useActivitiesFilterStore();

  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { isActiveApprover } = useChangeRequests();
  const { getMyItemsFilteringTokens } = useGetMyItemsFilteringTokens();
  const {
    myItemsFilters: { owner },
  } = useDashboardStore();
  const clickThroughEnabled = useGetClickthroughEnabled();

  const queryVars = useGetQueryVariables();

  const { data } = useQuery(GetMyItemsDashboardDocument, {
    variables: queryVars,
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const clickThrough = useCallback(
    (navigate: () => Promise<void> | void) => {
      if (clickThroughEnabled) {
        return () => navigate();
      }
    },
    [clickThroughEnabled]
  );

  return (
    <div className={'flex gap-3'}>
      {itemVisibilities.approvals || itemVisibilities.attestations ? (
        <RegisterDashboard>
          <ConditionalDashboardItem
            show={itemVisibilities.approvals}
            title={t('approvals')}
            value={
              data?.change_request.filter((cr) =>
                isActiveApprover(
                  cr,
                  cr.currentUserOwnerList?.map((u) => u.UserId ?? '')
                )
              ).length ?? 0
            }
            onClick={clickThrough(() =>
              navigate(
                requestsRegisterUrl({
                  tokens: [
                    {
                      propertyKey: 'RequiresAction',
                      value: 'true',
                      operator: '=',
                    },
                  ],
                  operation: 'and',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.attestations}
            title={t('attestations')}
            value={data?.attestation_record_aggregate.aggregate?.count ?? 0}
            onClick={clickThrough(() =>
              navigate(
                publicPoliciesUrl({
                  filtering: {
                    tokens: [
                      {
                        propertyKey: 'AttestationStatusLabel',
                        value: 'Pending',
                        operator: '=',
                      },
                    ],
                    operation: 'and',
                  },
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
        </RegisterDashboard>
      ) : (
        <></>
      )}
      <div data-testid={'my-items-ribbon'} className={'min-w-0 flex-1'}>
        <RegisterDashboard>
          <ConditionalDashboardItem
            show={itemVisibilities.actions}
            title={t('actions')}
            value={data?.action.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                actionRegisterUrl({
                  tokenGroups: [
                    {
                      tokens: [
                        {
                          propertyKey: 'StatusLabelled',
                          value: 'Closed',
                          operator: '!=',
                        },
                      ],
                      operation: 'and',
                    },
                    {
                      tokens: data
                        ? getMyItemsFilteringTokens(data.action)
                        : [],
                      operation: 'or',
                    },
                  ],
                  tokens: [],
                  operation: 'and',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.risks}
            title={t('risks')}
            value={data?.risk.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                riskRegisterUrl({
                  tokens: data ? getMyItemsFilteringTokens(data.risk) : [],
                  operation: 'or',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.rcsa}
            title={t('rcsaActivities')}
            value={owner ? (data?.assessment_activity.length ?? 0) : 0}
            onClick={clickThrough(() => {
              setRCSAActivityFilter({
                tokenGroups: [
                  {
                    tokens: [
                      {
                        propertyKey: 'StatusLabelled',
                        value: 'Complete',
                        operator: '!=',
                      },
                    ],
                    operation: 'or',
                  },
                  {
                    tokens: data
                      ? getMyItemsFilteringTokens(
                          data.assessment_activity,
                          'allAssignedUsers'
                        )
                      : [],
                    operation: 'or',
                  },
                ],
                tokens: [],
                operation: 'and',
              });
              navigate(assessmentActivitiesRegisterPageUrl());
            })}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.indicators}
            title={t('indicators')}
            value={data?.indicator.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                indicatorRegisterUrl({
                  filtering: {
                    tokens: data
                      ? getMyItemsFilteringTokens(data.indicator)
                      : [],
                    operation: 'or',
                  },
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.policies}
            title={t('documents')}
            value={data?.document.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                policyRegisterUrl({
                  tokens: data ? getMyItemsFilteringTokens(data.document) : [],
                  operation: 'or',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.assessments}
            title={t('assessments')}
            value={data?.assessment.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                assessmentRegisterUrl({
                  tokens: data
                    ? getMyItemsFilteringTokens(data.assessment)
                    : [],
                  operation: 'or',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.controls}
            title={t('controls')}
            value={data?.control.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                controlRegisterUrl({
                  tokens: data ? getMyItemsFilteringTokens(data.control) : [],
                  operation: 'or',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.issues}
            title={t('issues')}
            value={data?.issue.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                issueRegisterUrl({
                  filtering: {
                    tokenGroups: [
                      {
                        tokens: [
                          {
                            propertyKey: 'StatusLabelled',
                            value: 'Closed',
                            operator: '!=',
                          },
                        ],
                        operation: 'and',
                      },
                      {
                        tokens: data
                          ? getMyItemsFilteringTokens(data.issue)
                          : [],
                        operation: 'or',
                      },
                    ],
                    tokens: [],
                    operation: 'and',
                  },
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
          <ConditionalDashboardItem
            show={itemVisibilities.obligations}
            title={t('obligations')}
            value={data?.obligation.length ?? 0}
            onClick={clickThrough(() =>
              navigate(
                obligationRegister({
                  tokens: data
                    ? getMyItemsFilteringTokens(data.obligation)
                    : [],
                  operation: 'or',
                })
              )
            )}
            noClickthroughMessageContent={noClickthroughMessageContent}
          />
        </RegisterDashboard>
      </div>
    </div>
  );
};

const ConditionalDashboardItem: FC<DashboardItemProps & { show: boolean }> = ({
  show,
  ...props
}) => {
  if (!show) {
    return <></>;
  }

  return <DashboardItem {...props} />;
};

export default Ribbon;
