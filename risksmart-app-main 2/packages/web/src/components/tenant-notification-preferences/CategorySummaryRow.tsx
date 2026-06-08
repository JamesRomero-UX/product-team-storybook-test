import { Switch } from '@risksmart-app/atomic-ui';
import type { EnabledChannel } from '@risksmart-app/shared/knock/schemas';
import { ENABLED_CHANNELS } from '@risksmart-app/shared/knock/schemas';
import { ChevronDown, ChevronRight, Lock01 } from '@untitled-ui/icons-react';

import type { CategorySummaryRow as CategorySummaryRowType } from './types';

type Props = {
  summary: CategorySummaryRowType;
  gridColumns: string;
  isExpanded: boolean;
  categoryLabel: string;
  onToggleExpand: () => void;
};

const CategorySummaryRow = ({
  summary,
  gridColumns,
  isExpanded,
  categoryLabel,
  onToggleExpand,
}: Props) => (
  <div
    key={summary.category}
    data-testid={`category-row-${summary.category}`}
    style={{ display: 'grid', gridTemplateColumns: gridColumns }}
    className={'items-center py-2 px-1 bg-gray-100 font-bold cursor-pointer'}
    onClick={onToggleExpand}
  >
    <div className={'flex items-center gap-1'}>
      {isExpanded ? (
        <ChevronDown width={16} height={16} />
      ) : (
        <ChevronRight width={16} height={16} />
      )}
      {categoryLabel}
    </div>
    {ENABLED_CHANNELS.map((channel: EnabledChannel) => (
      <div key={channel} className={'flex items-center justify-center'}>
        <Switch
          checked={summary.channels[channel]}
          disabled={true}
          aria-label={`${summary.category} ${channel}`}
        />
      </div>
    ))}
    <div className={'flex items-center justify-center'}>
      {summary.enforced && (
        <Lock01 width={16} height={16} aria-label={'Enforced'} />
      )}
    </div>
  </div>
);

export default CategorySummaryRow;
