import { Switch } from '@risksmart-app/atomic-ui';
import type { EnabledChannel } from '@risksmart-app/shared/knock/schemas';
import { ENABLED_CHANNELS } from '@risksmart-app/shared/knock/schemas';
import { Lock01, LockUnlocked01 } from '@untitled-ui/icons-react';

import type { WorkflowPreferenceRow } from './types';

type Props = {
  row: WorkflowPreferenceRow;
  gridColumns: string;
  onToggleChannel: (workflowKey: string, channel: EnabledChannel) => void;
  onToggleEnforced: (workflowKey: string) => void;
};

const LockIcon = ({ locked }: { locked: boolean }) =>
  locked ? (
    <Lock01 width={16} height={16} aria-label={'Enforced'} />
  ) : (
    <LockUnlocked01
      width={16}
      height={16}
      style={{ opacity: 0.4 }}
      aria-label={'Not enforced'}
    />
  );

const WorkflowRow = ({
  row,
  gridColumns,
  onToggleChannel,
  onToggleEnforced,
}: Props) => (
  <div
    key={row.workflowKey}
    data-testid={`workflow-row-${row.workflowKey}`}
    style={{ display: 'grid', gridTemplateColumns: gridColumns }}
    className={'items-center py-1 px-1'}
  >
    <div className={'pl-6'}>{row.label}</div>
    {ENABLED_CHANNELS.map((channel: EnabledChannel) => (
      <div
        key={channel}
        className={'flex items-center justify-center'}
        data-testid={`toggle-${channel}`}
      >
        <Switch
          checked={row.channels[channel]}
          onCheckedChange={() => onToggleChannel(row.workflowKey, channel)}
          disabled={row.enforced}
          aria-label={`${row.label} ${channel}`}
        />
      </div>
    ))}
    <div className={'flex items-center justify-center'}>
      <button
        data-testid={'lock-button'}
        type={'button'}
        aria-pressed={row.enforced}
        onClick={() => onToggleEnforced(row.workflowKey)}
        className={'bg-transparent border-none p-0'}
      >
        <LockIcon locked={row.enforced} />
      </button>
    </div>
  </div>
);

export default WorkflowRow;
