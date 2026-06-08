import { useEntityPath } from '@/hooks/useEntityPath';

import styles from './RiskOptionWithEntity.module.css';
import type { RiskOptionWithEntity as RiskOptionWithEntityType } from './selectUtilsWithEntities';

interface RiskOptionWithEntityProps {
  option: RiskOptionWithEntityType;
}

/**
 * Custom option renderer for risk selectors that displays entity information
 */
export const RiskOptionWithEntityComponent: React.FC<
  RiskOptionWithEntityProps
> = ({ option }) => {
  const { getEntityPath } = useEntityPath();
  const entityId = option.entityInfo?.entityId;
  const entityPath = entityId ? getEntityPath(entityId) : undefined;

  return (
    <div className={styles.optionContainer}>
      <div className={styles.riskTitle}>{option.label}</div>
      {entityPath ? (
        <div className={styles.entityInfo}>{`Entity: ${entityPath}`}</div>
      ) : null}
    </div>
  );
};
