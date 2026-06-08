import { downloadBlob } from '@risksmart-app/components/src/file/fileUtils';
import { useAxiosStore } from '@risksmart-app/components/src/hooks/useAxios';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '@/components/link';

type Props = {
  csvFile: string;
};

const TemplateLink: FC<Props> = ({ csvFile }) => {
  const { authorisedAxiosInstance } = useAxiosStore();
  const csvType = csvFile.replace('.csv', '');
  const { addNotification } = useNotifications();
  const { t } = useTranslation(['common'], { keyPrefix: 'dataImport' });

  return (
    <div data-testid={csvType}>
      <Link
        href={'#'}
        onFollow={async () => {
          try {
            const result = await authorisedAxiosInstance.get(
              '/data-import/template',
              {
                params: { type: csvFile },
                responseType: 'blob',
              }
            );
            downloadBlob(csvFile, result.data);
          } catch {
            addNotification({
              type: 'error',
              content: t('downloadTemplateFailedMessage'),
            });
          }
        }}
      >
        {t('downloadTemplate', { item: csvFile })}
      </Link>
    </div>
  );
};

export default TemplateLink;
