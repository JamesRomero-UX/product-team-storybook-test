import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import { useTranslation } from 'react-i18next';

import { useGetConsequenceAuditById } from '@/hooks/queries';

import { getAuditItems } from './auditEntityFinder';
import AuditViewComponent from './AuditViewComponent';
import type { AuditEntityRetrieverInput } from './types';

const ConsequenceAudit = (input: AuditEntityRetrieverInput) => {
  const { data: result, loading } = useGetConsequenceAuditById({
    queryArgs: { id: input.id },
  });
  const { t } = useTranslation('common');

  const { current, previous } = getAuditItems(
    result?.consequence_audit,
    input.operationDate
  );

  if (loading) {
    return (
      <div className={'flex justify-center items-center gap-4'}>
        <Spinner />
        <p>{`${t('loading')}...`}</p>
      </div>
    );
  }

  return (
    <AuditViewComponent
      operation={input.operation}
      current={JSON.stringify(current, null, 2)}
      previous={JSON.stringify(previous, null, 2)}
    />
  );
};

export default ConsequenceAudit;
