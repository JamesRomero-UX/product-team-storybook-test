import type { CardsProps } from '@risk-smart/themed-cloudscape-components/cards';
import CCards from '@risk-smart/themed-cloudscape-components/cards';

import styles from './style.module.scss';

const Cards = <T extends object>(props: CardsProps<T>) => {
  return (
    <div className={styles.cards}>
      <CCards {...props} />
    </div>
  );
};

export default Cards;
