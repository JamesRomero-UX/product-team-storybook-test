import type { EntityWithParent } from '@/utils/entityUtils';
import { formatEntityForDisplay } from '@/utils/entityUtils';

import styles from './EntityLabel.module.css';

interface EntityLabelProps {
  entity: EntityWithParent | null | undefined;
  className?: string;
  showFullPath?: boolean;
  prefix?: string;
  maxLength?: number;
}

/**
 * Component for displaying entity labels with hierarchical path information
 * Used in risk selectors and other components that need to show entity context
 */
export const EntityLabel: React.FC<EntityLabelProps> = ({
  entity,
  className,
  showFullPath = true,
  prefix = 'Entity: ',
  maxLength,
}) => {
  if (!entity) {
    return null;
  }

  const entityText = formatEntityForDisplay(entity, {
    showFullPath,
    prefix,
    maxLength,
  });

  return (
    <div className={`${styles.entityLabel} ${className || ''}`}>
      {entityText}
    </div>
  );
};
