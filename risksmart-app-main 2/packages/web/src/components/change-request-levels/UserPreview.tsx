import Button from '@risksmart-app/components/src/button';
import { getAccessibleTextColor } from '@risksmart-app/components/src/utils/colours';
import { User01, Users01 } from '@untitled-ui/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import stc from 'string-to-color';

import { UserPreviewStatus } from '@/components/change-request-levels/UserPreviewStatus';
import { toLocalDateTime } from '@/utils/dateUtils';

import { TextareaInput } from '../form/controlled-textarea/ControlledTextarea';
import styles from './style.module.scss';

type UserPreviewProps = {
  user?: {
    FriendlyName?: null | string;
    Email?: null | string;
  } | null;
  group?: {
    Name?: null | string;
    users: {
      UserId: string;
      user?:
        | {
            FriendlyName?: null | string | undefined;
          }
        | null
        | undefined;
    }[];
  } | null;
  owner?: boolean;
  response?: boolean | null;
  responseDate?: null | string;
  updating?: boolean;
  submitResponse?: (response: boolean, comment: string) => Promise<void>;
  showApproveReject?: boolean;
  hideIcon?: boolean;
  comment?: null | string;
  hasPermissionToOverride?: boolean;
  currentUserId?: null | string;
  approvedByUserId?: null | string;
  responseId?: null | string;
};

enum ApprovalOperation {
  Approve = 'Approve',
  Reject = 'Reject',
}

export const UserPreview = ({
  user,
  group,
  owner,
  response,
  responseDate,
  updating,
  submitResponse,
  showApproveReject,
  comment,
  hideIcon,
  currentUserId,
  approvedByUserId,
  responseId,
}: UserPreviewProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [activeComment, setActiveComment] = useState<string>('');
  const [expandedUser, setExpandedUser] = useState<boolean>(false);
  const [approvalOperation, setApprovalOperation] =
    useState<ApprovalOperation | null>(null);
  const { t } = useTranslation('common');
  const { t: ta } = useTranslation('common', { keyPrefix: 'approvals' });
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    try {
      if (user || group) {
        const generatedColor = stc(user?.Email ?? group?.Name);
        ref.current.style.backgroundColor = generatedColor;
        ref.current.style.color = getAccessibleTextColor(
          generatedColor ?? '#000000'
        );
      } else if (owner) {
        const color = '#444';
        ref.current.style.backgroundColor = color;
        ref.current.style.color = getAccessibleTextColor(color);
      }
    } catch (e) {
      console.error(e);
      ref.current.style.backgroundColor = '#000000';
      ref.current.style.color = '#FFFFFF';
    }
  }, [user, ref, owner, group]);

  return (
    <div
      className={
        'p-4 border-2 border-solid border-grey150 bg-off_white rounded-md'
      }
      onClick={() => setExpandedUser(!expandedUser)}
    >
      <div className={'flex items-center justify-between'}>
        <div className={'flex gap-4 items-center'}>
          <div
            ref={ref}
            className={`w-9 h-9 rounded-full grid place-items-center font-bold text-white text-lg`}
            data-testid={'user-preview-icon'}
          >
            {user ? (
              <span className={'opacity-80'}>
                {(user.FriendlyName || '🤷')[0].toUpperCase()}
              </span>
            ) : null}
            {owner ? <User01 data-testid={'owner-icon'} /> : null}
            {group ? <Users01 data-testid={'group-icon'} /> : null}
          </div>
          {/* Tailwind max-w-44 doesnt work for some reason */}
          <div className={'flex gap-1 flex-col'} style={{ maxWidth: '176px' }}>
            <h4 className={'!m-0 truncate'}>
              {owner ? 'Owner' : group?.Name || user?.FriendlyName}
            </h4>
            {owner || user?.Email || group ? (
              <p className={'!m-0 text-xs'}>
                {owner
                  ? 'Owner approval required'
                  : group
                    ? 'Any user from this group must approve'
                    : (user?.Email ?? 'No email')}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <UserPreviewStatus
            response={response}
            hideIcon={hideIcon}
            responseId={responseId}
          />
        </div>
      </div>
      {(expandedUser || showApproveReject) && group && (
        <>
          <div className={'text-xs font-bold text-gray-400 my-2'}>
            {ta('group_users')}
          </div>
          {group.users.map((c) => (
            <div
              key={c.UserId}
              className={`flex justify-between my-1 p-1 text-xs text-gray-400 truncate ${currentUserId === c.UserId ? 'border-solid rounded border border-[#00DECB]' : ''}`}
            >
              <span>{c.user?.FriendlyName ?? '-'}</span>
              {approvedByUserId === c.UserId && (
                <UserPreviewStatus response={response} hideIcon={hideIcon} />
              )}
            </div>
          ))}
        </>
      )}
      {expandedUser && responseDate && (
        <div className={'text-xs text-gray-400 text-right !my-4'}>
          {toLocalDateTime(responseDate)}
        </div>
      )}
      {(expandedUser || showApproveReject) &&
        (comment || showApproveReject) && (
          <div className={'bg-off_white pt-4'}>
            {comment && (
              <>
                <h4 className={'text-grey !text-xs'}>{'Comments:'}</h4>
                <p className={'p-4 !m-0 border-2 border-solid border-grey150 '}>
                  {comment}
                </p>
              </>
            )}
            {showApproveReject && (
              <>
                <TextareaInput
                  label={'Comment'}
                  value={activeComment ?? ''}
                  onChange={(val) => {
                    setActiveComment?.(val);
                  }}
                  inferenceDisabled={true}
                />
                <div className={'flex justify-between'}>
                  <Button
                    loading={
                      updating &&
                      approvalOperation === ApprovalOperation.Approve
                    }
                    disabled={approvalOperation === ApprovalOperation.Reject}
                    onClick={async (e) => {
                      e.preventDefault();
                      setApprovalOperation(ApprovalOperation.Approve);
                      await submitResponse?.(true, activeComment);
                      setApprovalOperation(null);
                    }}
                    variant={'primary'}
                  >
                    {t('approve')}
                  </Button>
                  <Button
                    loading={
                      updating && approvalOperation === ApprovalOperation.Reject
                    }
                    disabled={approvalOperation === ApprovalOperation.Approve}
                    onClick={async (e) => {
                      e.preventDefault();
                      setApprovalOperation(ApprovalOperation.Reject);
                      await submitResponse?.(false, activeComment);
                      setApprovalOperation(null);
                    }}
                    {...{ className: styles.dangerButton }}
                  >
                    {t('reject')}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
    </div>
  );
};
