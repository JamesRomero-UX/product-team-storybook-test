import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import Loading from '@risksmart-app/components/src/loading';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGetEnterpriseRiskByTier } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRisksByTier';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';

import ControlledSelect from '../form/controlled-select';

type Props = {
  entityId: null | string | undefined;
  enterpriseRiskId: null | string | undefined;
  riskTier: number;
  modalSubType: 'enterpriseRisk' | 'entity';
};

const InstantiateEnterpriseRiskForm: FC<Props> = ({
  riskTier,
  modalSubType,
}) => {
  const { control } = useFormContext();
  const { data: entities, loading } = useGetEntities({ queryArgs: {} });
  const { data: enterpriseRisks, loading: enterpriseRisksLoading } =
    useGetEnterpriseRiskByTier({ queryArgs: { tier: riskTier } });
  const { t } = useTranslation(['common'], { keyPrefix: 'enterpriseRisks' });

  const enterpriseRiskOptions = useMemo(() => {
    return enterpriseRisks?.enterprise_risk.map((risk) => ({
      label: risk.Title,
      value: risk.Id,
    }));
  }, [enterpriseRisks]);

  const entityOptions = useMemo(
    () => [
      ...(entities?.entity
        .filter((entity) => !entity.children || !entity.children.length)
        .map((entity) => ({
          label: entity.Name,
          value: entity.Id,
        })) ?? []),
    ],
    [entities]
  );

  if (loading || enterpriseRisksLoading) {
    return <Loading />;
  }

  return (
    <>
      {modalSubType === 'enterpriseRisk' && (
        <TextContent>
          {t('addRiskToEnterpriseRisk.enterpriseRiskInstructions')}
        </TextContent>
      )}
      {modalSubType === 'entity' && (
        <TextContent>
          {t('addRiskToEnterpriseRisk.entityInstructions')}
        </TextContent>
      )}

      <SpaceBetween direction={'vertical'} size={'xs'}>
        {modalSubType === 'enterpriseRisk' && (
          <ControlledSelect
            key={'enterpriseRisk'}
            testId={'enterpriseRisk'}
            control={control}
            options={enterpriseRiskOptions}
            name={'EnterpriseRiskId'}
            label={'Enterprise Risk'}
          />
        )}
        <ControlledSelect
          key={'entity'}
          testId={'entity'}
          control={control}
          options={entityOptions}
          name={'EntityId'}
          label={'Entity'}
        />
      </SpaceBetween>
    </>
  );
};

export default InstantiateEnterpriseRiskForm;
