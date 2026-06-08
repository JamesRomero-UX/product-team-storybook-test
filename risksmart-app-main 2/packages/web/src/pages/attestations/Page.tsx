import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import ViewSelector from 'src/components/view-selector';

import { useGetAttestationsRegister } from '@/hooks/queries';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import AllPage from './all-attestations/Page';
import ByUserPage from './by-user/Page';
import CyclesPage from './cycles/Page';

const Page: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  const enableImprovedAttestations = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  const { hash } = useLocation();
  const navigate = useNavigate();

  const { data, loading } = useGetAttestationsRegister({ queryArgs: {} });
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

  const title = t('register_title');

  type View = 'all' | 'attestation_cycles' | 'by_user';

  const defaultView = enableImprovedAttestations
    ? (hashParams.get('view') as View) || 'all'
    : 'by_user';

  const [selectedView, setSelectedView] = useState<View>(defaultView);
  const viewOptions: { text: string; id: View }[] = [
    { text: t('viewSelector.all'), id: 'all' },
    { text: t('viewSelector.attestation_cycles'), id: 'attestation_cycles' },
    { text: t('viewSelector.by_user'), id: 'by_user' },
  ];

  const handleViewChange = (view: View) => {
    setSelectedView(view);
    hashParams.set('view', view);
    navigate(`#${hashParams.toString()}`, { replace: true });
  };

  const viewSelector = enableImprovedAttestations && (
    <ViewSelector<View>
      selectedView={selectedView}
      onSelectedViewChanged={handleViewChange}
      options={viewOptions}
    />
  );

  return (
    <>
      {selectedView === 'all' && (
        <AllPage
          attestationsRegisterData={data}
          loading={loading}
          viewSelector={viewSelector}
          title={title}
          subTitle={t('viewSelector.all')}
        />
      )}

      {selectedView === 'attestation_cycles' && (
        <CyclesPage
          viewSelector={viewSelector}
          title={title}
          subTitle={t('viewSelector.attestation_cycles')}
        />
      )}

      {selectedView === 'by_user' && (
        <ByUserPage
          attestationsRegisterData={data}
          loading={loading}
          viewSelector={viewSelector}
          title={title}
          subTitle={t('viewSelector.by_user')}
        />
      )}
    </>
  );
};

export default Page;
