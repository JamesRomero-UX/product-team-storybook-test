import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs';
import { PageLayout } from 'src/layouts';

import useTabs from '@/hooks/useTabs'; // Adjust the path based on your project structure

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });
  const title = st('create_title');
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Document,
    parent: undefined,
    hrefRoot: '',
    disabled: true,
  });

  return (
    <PageLayout title={title}>
      <ControlledTabs
        activeTabId={'details'}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Document}
        disableSettings
      />
    </PageLayout>
  );
};

export default Page;
