import SegmentedControl from '@risk-smart/themed-cloudscape-components/segmented-control';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';

import styles from './style.module.scss';

type ViewSelectorProps<T extends string> = {
  selectedView: T;
  onSelectedViewChanged: (view: T) => void;
  options: { text: string; id: T }[];
};

const ViewSelector = <T extends string>({
  selectedView,
  onSelectedViewChanged,
  options,
}: ViewSelectorProps<T>) => {
  return (
    <div className={styles.viewSelector}>
      <SpaceBetween size={'s'} alignItems={'end'}>
        <SegmentedControl
          selectedId={selectedView}
          onChange={({ detail }) =>
            onSelectedViewChanged(detail.selectedId as T)
          }
          options={options}
        />
      </SpaceBetween>
    </div>
  );
};

export default ViewSelector;
