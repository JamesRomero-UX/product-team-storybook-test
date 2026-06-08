import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs';

import useTabs from '@/hooks/useTabs';
import { riskDetailsUrl } from '@/utils/urls';

import PageLayout from '../../../../layouts/PageLayout';

const Page = () => {
  const riskId = useGetGuidParam('riskId');
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Appetite,
    parent: null,
    hrefRoot: `${riskDetailsUrl(riskId)}/appetite/add`,
  });
  const { t: st } = useTranslation(['common'], { keyPrefix: 'appetites' });

  return (
    <PageLayout title={st('create_modal_title')}>
      <ControlledTabs
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Appetite}
        disableSettings
      />
    </PageLayout>
  );
};

export default Page;
