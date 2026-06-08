import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Empty from 'src/components/tools/Empty';

const EmptyPalette: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });

  return (
    <Empty iconUrl={'/dashboard/grid.svg'}>{t('empty_palette_body')}</Empty>
  );
};

export default EmptyPalette;
