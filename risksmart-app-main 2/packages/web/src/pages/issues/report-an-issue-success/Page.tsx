import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import Button from '@risksmart-app/components/src/button';
import { useGetNumberParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageLayout } from 'src/layouts';

import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { logoutUrl, reportAnIssueUrl } from '@/utils/urls';

type Props = {
  issueType: ParentIssueType;
};

const Page: FC<Props> = ({ issueType }) => {
  const navigate = useNavigate();
  const issueMapping = IssueTypeMapping[issueType];

  const { t } = useTranslation(['common']);

  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueMapping.taxonomy,
  });
  const defaultTitle = st('report_issue_title');
  const sequentialId = useGetNumberParam('sequentialId');

  return (
    <PageLayout title={defaultTitle} actions={<></>}>
      <Container>
        <Box
          textAlign={'center'}
          margin={{ vertical: 'l' }}
          padding={{ vertical: 'xxl' }}
        >
          <Box margin={'l'} variant={'h2'}>
            {st('issue_submitted_title')}
          </Box>
          <Box margin={'l'} textAlign={'center'} variant={'h3'}>
            {st('issue_submitted_subtitle', {
              id: getFriendlyId(issueType, sequentialId),
            })}
          </Box>
          <img alt={'Thumbs up'} src={'/report-an-issue/thumbsUp.png'} />
          <Grid
            gridDefinition={[
              {
                colspan: { xs: 10, s: 8, m: 6 },
                offset: { xs: 1, s: 2, m: 3 },
              },
            ]}
          >
            <Box margin={'l'} textAlign={'center'}>
              {`We've let an administrator know and have captured your details
            incase they need to contact you.`}
            </Box>
          </Grid>
          <Box margin={'l'} textAlign={'center'}>
            <Box margin={'xxs'} display={'inline-block'}>
              <Button
                variant={'primary'}
                formAction={'none'}
                onClick={() => navigate(logoutUrl())}
              >
                {t('signOut')}
              </Button>
            </Box>
            <Box margin={'xxs'} display={'inline-block'}>
              <Button
                formAction={'none'}
                variant={'normal'}
                onClick={() => navigate(reportAnIssueUrl())}
              >
                {st('report_another_issue')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default Page;
