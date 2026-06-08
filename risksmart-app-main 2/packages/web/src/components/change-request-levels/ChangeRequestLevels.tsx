import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import HelpPanel from '@risk-smart/themed-cloudscape-components/help-panel';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ChangeRequestPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Status_Enum,
  GetApprovalLevelsDocument,
  GetChangeRequestByParentIdDocument,
  GetUsersDocument,
  Parent_Type_Enum,
  UpdateApproverResponsesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import Loading from 'src/components/loading';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { z } from 'zod';

import { CHANGE_REQUEST_OVERRIDE_ACTION } from '@/components/change-request-override-modal/changeRequestTypes';
import { getOwners, useChangeRequests } from '@/hooks/useChangeRequests';
import { toLocalDate, toLocalDateTime } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import { useGetDetailParentPath } from '../../routes/useGetDetailParentPath';
import ButtonDropdown from '../button-dropdown';
import ChangeRequestOverrideModal from '../change-request-override-modal/ChangeRequestOverrideModal';
import Select from '../form/select';
import { UserPreview } from './UserPreview';

type ChangeRequestLevelsProps = {
  changeRequestId?: string;
  parentId: string;
};

export const ChangeRequestLevels = ({
  changeRequestId,
  parentId,
}: ChangeRequestLevelsProps) => {
  const navigate = useNavigate();
  const { data } = useSubscription(GetChangeRequestByParentIdDocument, {
    variables: {
      Id: parentId,
    },
    skip: !parentId,
  });
  const client = useApolloClient();
  const [_searchParams, setSearchParams] = useSearchParams();

  const { user, isLoading } = useRisksmartUser();

  const { t } = useTranslation('common', { keyPrefix: 'approvals' });
  const statuses = t('status', { returnObjects: true });

  const {
    hasPermission: hasPermissionToOverride,
    loading: isLoadingToOverride,
  } = useHasPermissionQuery('delete:change_request');

  const clearParentFromCache = () => {
    const cacheData = client.cache.extract();
    const cacheShape = z.object({
      ROOT_QUERY: z.record(
        z.string(),
        z.object({ Id: z.string().optional() }).array()
      ),
    });
    const rootCache = cacheShape.safeParse(cacheData);
    if (rootCache.success) {
      const keys = Object.entries(rootCache.data.ROOT_QUERY).filter(
        ([_, value]) => {
          return !!value.find((item) => item.Id === parentId);
        }
      );
      keys.forEach(([key]) => {
        client.cache.evict({
          id: 'ROOT_QUERY',
          fieldName: key,
        });
        client.cache.gc();
      });
    }
  };

  const parentPath = useGetDetailParentPath(parentId ?? '', true);

  const [previousStatus, setPreviousStatus] =
    useState<Approval_Status_Enum | null>(null);
  const { addNotification } = useNotifications();

  const [selectedChangeRequest, setSelectedChangeRequest] =
    useState<ChangeRequestPartsFragment | null>();

  const [previousSelectedChangeRequest, setPreviousSelectedChangeRequest] =
    useState<ChangeRequestPartsFragment | null>();

  const [showChangeRequestOverrideModal, setShowChangeRequestOverrideModal] =
    useState(false);
  const [changeRequestOverrideMode, setChangeRequestOverrideMode] =
    useState<CHANGE_REQUEST_OVERRIDE_ACTION>(
      CHANGE_REQUEST_OVERRIDE_ACTION.OVERRIDE
    );

  useEffect(() => {
    if (data?.change_request) {
      const selected = changeRequestId
        ? data.change_request.find((cr) => cr.Id === changeRequestId)
        : (data.change_request.filter(
            (cr) => cr.ChangeRequestStatus === Approval_Status_Enum.Pending
          )[0] ?? data.change_request[0]);
      setSelectedChangeRequest(selected);
    }
  }, [data?.change_request, changeRequestId]);

  const changeRequestOptions = useMemo(() => {
    if (!data?.change_request) {
      return [];
    }

    return data.change_request
      .filter((c) => c.SequentialId)
      .sort((a, b) => a.SequentialId! - b.SequentialId!)
      .map((cr) => ({
        label: `${getFriendlyId(
          Parent_Type_Enum.ChangeRequest,
          cr.SequentialId
        )} - ${toLocalDate(cr.CreatedAtTimestamp)} - ${
          statuses[cr.ChangeRequestStatus]
        }`,
        value: cr.Id,
      }));
  }, [data?.change_request, statuses]);

  useEffect(() => {
    const newStatus = selectedChangeRequest?.ChangeRequestStatus;
    if (newStatus) {
      if (
        previousStatus === Approval_Status_Enum.Pending &&
        newStatus !== Approval_Status_Enum.Pending &&
        selectedChangeRequest?.Id === previousSelectedChangeRequest?.Id
      ) {
        clearParentFromCache();
        if (
          selectedChangeRequest?.Type === 'delete' &&
          newStatus === Approval_Status_Enum.Approved
        ) {
          navigate(parentPath);
        }
        addNotification({
          type: newStatus === 'approved' ? 'success' : 'error',
          content: `Request ${newStatus}`,
        });
      }
      setPreviousStatus(newStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChangeRequest, client]);

  const workflow =
    selectedChangeRequest?.responses[0]?.approver?.level?.approval?.Workflow;
  const ParentId = selectedChangeRequest?.responses.find(
    (response) => response.approver.level?.approval?.ParentId !== null
  )?.approver.level?.approval?.ParentId;

  const { data: levelData, loading } = useQuery(GetApprovalLevelsDocument, {
    variables: {
      Workflow: workflow!,
      ParentId: ParentId ?? '00000000-0000-0000-0000-000000000000',
    },
    skip: !workflow,
  });

  const [updateResponse, { loading: updating }] = useMutation(
    UpdateApproverResponsesDocument,
    {
      update: (cache) => {
        evictField(cache, 'change_request_by_pk');
      },
    }
  );

  const {
    isActiveApprover,
    activeLevelId,
    loading: isChangeRequestLoading,
  } = useChangeRequests(undefined);

  const { data: users, loading: usersLoading } = useQuery(GetUsersDocument);

  const changeRequest = selectedChangeRequest;

  const activeLevel = useMemo(() => {
    if (changeRequest) {
      return activeLevelId(changeRequest);
    }

    return null;
  }, [changeRequest, activeLevelId]);

  const overriddenBy = useMemo(() => {
    if (changeRequest?.OverriddenByUser) {
      return users?.user.find(
        (user) => user.Id === changeRequest.OverriddenByUser
      );
    }

    return null;
  }, [changeRequest, users]);

  const submitResponse = async (approved: boolean, comment: string) => {
    if (!selectedChangeRequest) {
      throw new Error('No change request selected');
    }

    if (!activeLevel) {
      throw new Error('No active level to approve');
    }

    await updateResponse({
      variables: {
        input: {
          ChangeRequestId: selectedChangeRequest?.Id,
          Response: approved,
          Comment: comment,
          OverrideLevel: false,
          LevelId: activeLevel,
        },
      },
    });
  };

  if (
    !changeRequest ||
    loading ||
    usersLoading ||
    isChangeRequestLoading ||
    isLoading ||
    isLoadingToOverride
  ) {
    return <Loading />;
  }

  const levels =
    levelData?.levels.filter((level) =>
      changeRequest.responses
        .map((response) => response.approver.level?.Id)
        .includes(level.Id)
    ) ?? [];

  const responsesWithNoLevel = changeRequest.responses.filter(
    (response) =>
      !levels.map((lvl) => lvl.Id).includes(response.approver.level?.Id ?? '')
  );

  const activeApprover = isActiveApprover(
    changeRequest,
    getOwners(selectedChangeRequest)
  );

  return (
    <HelpPanel
      header={
        <div className={'w-48'}>
          <div className={'flex flex-col gap-6'}>
            <h2>
              {'Approval'}
              {changeRequest && (
                <span
                  className={'ml-3 text-grey font-normal'}
                  data-testid={'change-request-id'}
                >
                  {'('}
                  {getFriendlyId(
                    Parent_Type_Enum.ChangeRequest,
                    changeRequest.SequentialId
                  )}
                  {')'}
                </span>
              )}
            </h2>
            {changeRequestOptions.length > 1 && (
              <Select
                selectedOption={{
                  value: selectedChangeRequest.Id,
                  label: `${getFriendlyId(
                    Parent_Type_Enum.ChangeRequest,
                    selectedChangeRequest.SequentialId
                  )} - ${toLocalDate(
                    selectedChangeRequest.CreatedAtTimestamp
                  )}`,
                }}
                data-testid={'change-request-select'}
                options={changeRequestOptions}
                onChange={(evt) => {
                  setPreviousSelectedChangeRequest(selectedChangeRequest);
                  setSearchParams((prev) => {
                    prev.set(
                      'requestId',
                      evt.detail.selectedOption.value as string
                    );
                    prev.set('showRequest', 'true');

                    return prev;
                  });
                }}
              />
            )}
          </div>
          {hasPermissionToOverride &&
            changeRequest.ChangeRequestStatus ===
              Approval_Status_Enum.Pending && (
              <ButtonDropdown
                className={'absolute top-4 right-7'}
                expandToViewport
                ariaLabel={'Change request settings'}
                items={[
                  {
                    text: 'Skip workflow level',
                    id: CHANGE_REQUEST_OVERRIDE_ACTION.SKIP,
                    disabled: false,
                  },
                  {
                    text: 'Override workflow',
                    id: CHANGE_REQUEST_OVERRIDE_ACTION.OVERRIDE,
                    disabled: false,
                  },
                ]}
                variant={'icon'}
                onItemClick={(e) => {
                  if (
                    e.detail.id === CHANGE_REQUEST_OVERRIDE_ACTION.OVERRIDE ||
                    e.detail.id === CHANGE_REQUEST_OVERRIDE_ACTION.SKIP
                  ) {
                    setShowChangeRequestOverrideModal(true);
                    setChangeRequestOverrideMode(e.detail.id);
                  }
                }}
              />
            )}
        </div>
      }
    >
      <div className={'flex flex-col gap-6'}>
        {changeRequest.createdBy ? (
          <div>
            <h4>{'Requesters'}</h4>
            <div className={'flex flex-col gap-3'}>
              <UserPreview
                user={changeRequest.createdBy}
                responseDate={changeRequest.CreatedAtTimestamp}
                hideIcon={true}
              />
              {changeRequest.contributors.map((contributor, i) =>
                contributor.user ? (
                  <UserPreview
                    user={contributor.user}
                    key={i}
                    hideIcon={true}
                  />
                ) : null
              )}
            </div>
          </div>
        ) : null}
        {changeRequest.RequesterComment && (
          <Alert
            type={'info'}
            header={t('requester_rationale_header')}
            data-testid={'requester-rationale-alert'}
          >
            {changeRequest.RequesterComment}
          </Alert>
        )}
        {changeRequest.OverriddenAtTimestamp &&
          changeRequest.OverriddenByUser && (
            <div>
              <Alert type={'warning'} test-id={'override-alert'}>
                {'The change request was'}{' '}
                <b>{changeRequest.ChangeRequestStatus}</b>
                {' by'} {overriddenBy?.FriendlyName}
                {' on'} {toLocalDateTime(changeRequest.OverriddenAtTimestamp)}
                {'.'}
                <div className={'mt-6'}>
                  <b>{'Rationale: '}</b>
                  {changeRequest.Comment}
                </div>
              </Alert>
            </div>
          )}
        <div>
          <h4>{'Approval Steps'}</h4>
          {levels.map((level, i) => (
            <div
              key={level.Id}
              className={`mb-4 ${
                level.Id === activeLevel && !changeRequest.OverriddenAtTimestamp
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
            >
              <div
                className={`flex flex-col p-3 border-solid rounded-lg ${
                  level.Id === activeLevel
                    ? 'border animate-border-pulse'
                    : 'border border-grey150'
                }`}
              >
                <h5>
                  {'Level '}
                  {i + 1}
                </h5>
                <div className={'flex flex-col gap-3'}>
                  {changeRequest.responses
                    .filter(
                      (response) => response.approver.level?.Id === level.Id
                    )
                    .map((response, j) =>
                      response.approver.user || response.approver.group ? (
                        <div key={j}>
                          <UserPreview
                            user={response.approver.user}
                            group={response.approver.group}
                            response={
                              response.Approved === null &&
                              level.Id !== activeLevel
                                ? undefined
                                : response.Approved
                            }
                            showApproveReject={
                              response.Approved === null &&
                              activeApprover &&
                              (response.approver.OwnerApprover ||
                                response.approver.user?.Id === user?.userId ||
                                response.approver.group?.users.some(
                                  (c) => c.UserId === user?.userId
                                )) &&
                              changeRequest.ChangeRequestStatus ===
                                Approval_Status_Enum.Pending &&
                              level.Id === activeLevel
                            }
                            submitResponse={submitResponse}
                            updating={updating}
                            comment={response.Comment}
                            hasPermissionToOverride={hasPermissionToOverride}
                            responseId={response.Id}
                            responseDate={
                              response.Approved
                                ? response.ModifiedAtTimestamp
                                : null
                            }
                            approvedByUserId={
                              response.Approved ? response.ApprovedByUser : null
                            }
                            currentUserId={user?.userId}
                          />
                        </div>
                      ) : (
                        <div key={j}>
                          <UserPreview
                            owner
                            response={
                              response.Approved === null &&
                              level.Id !== activeLevel
                                ? undefined
                                : response.Approved
                            }
                            showApproveReject={
                              response.Approved === null &&
                              activeApprover &&
                              changeRequest.ChangeRequestStatus ===
                                Approval_Status_Enum.Pending &&
                              level.Id === activeLevel
                            }
                            submitResponse={submitResponse}
                            updating={updating}
                            comment={response.Comment}
                            hasPermissionToOverride={hasPermissionToOverride}
                            responseId={response.Id}
                            responseDate={
                              response.Approved
                                ? response.ModifiedAtTimestamp
                                : null
                            }
                            approvedByUserId={
                              response.Approved ? response.ApprovedByUser : null
                            }
                          />
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          ))}
          {responsesWithNoLevel.length > 0 && (
            <div className={'mb-4'}>
              <h5>{'No Level'}</h5>
              <div className={'flex flex-col gap-3'}>
                {responsesWithNoLevel.map((response, i) =>
                  response.approver.user ? (
                    <UserPreview
                      key={i}
                      user={response.approver.user}
                      response={
                        response.Approved === null
                          ? undefined
                          : response.Approved
                      }
                      responseId={response.Id}
                      responseDate={
                        response.Approved ? response.ModifiedAtTimestamp : null
                      }
                      approvedByUserId={
                        response.Approved ? response.ApprovedByUser : null
                      }
                    />
                  ) : (
                    <UserPreview
                      key={i}
                      owner
                      response={
                        response.Approved === null
                          ? undefined
                          : response.Approved
                      }
                      responseId={response.Id}
                      responseDate={
                        response.Approved ? response.ModifiedAtTimestamp : null
                      }
                      approvedByUserId={
                        response.Approved ? response.ApprovedByUser : null
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {activeLevel && (
        <ChangeRequestOverrideModal
          changeRequestId={selectedChangeRequest.Id}
          onDismiss={() => {
            setShowChangeRequestOverrideModal(false);
          }}
          mode={changeRequestOverrideMode}
          visible={showChangeRequestOverrideModal}
          activeLevel={activeLevel}
        />
      )}
    </HelpPanel>
  );
};
