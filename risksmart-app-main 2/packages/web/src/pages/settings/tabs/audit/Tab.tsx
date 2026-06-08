import Box from '@risk-smart/themed-cloudscape-components/box';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';

import { AuditEntityRetriever } from './AuditEntityRetriever';
import { useGetAuditTableProps } from './config';
import type { AuditEntityRetrieverInput } from './types';

const AuditTab: FC = () => {
  useI18NSummaryHelpContent('auditLog.help');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [auditEntity, setAuditEntity] = useState<
    AuditEntityRetrieverInput | undefined
  >(undefined);

  const useHandleAuditEntityClick = async (
    input: AuditEntityRetrieverInput
  ) => {
    setIsModalVisible(true);
    setAuditEntity(input);
  };

  const tableProps = useGetAuditTableProps(useHandleAuditEntityClick);
  const { t } = useTranslation(['common'], { keyPrefix: 'auditLog' });
  const onDismiss = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader>{t('auditTableTitle')}</TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
      />
      <Modal
        onDismiss={onDismiss}
        visible={isModalVisible}
        closeAriaLabel={'Close'}
        size={'max'}
        footer={
          <Box float={'left'}>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button variant={'link'} onClick={onDismiss}>
                {'Done'}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        {auditEntity ? <AuditEntityRetriever {...auditEntity} /> : <></>}
      </Modal>
    </>
  );
};

export default AuditTab;
