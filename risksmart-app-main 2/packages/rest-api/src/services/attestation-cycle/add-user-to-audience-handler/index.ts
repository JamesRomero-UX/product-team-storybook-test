import type { ServiceOptions } from 'src/services/types';

import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import { AttestationRecordAdaptor } from '../adaptors/attestation-record-adaptor';
import { addUserToAudienceCommandHandler as handler } from './add-user-to-audience-handler';

export const createAddUserToAudienceCommandHandler = (opts: ServiceOptions) => {
  const {
    getByUserGroup: attestationCycleByUserGroupReader,
    getAllActiveGlobal: globalAttestationCycleReader,
  } = AttestationCycleDataAdaptor(opts);

  const {
    create: createAttestationRecordWriter,
    updateStatus: updateAttestationRecordStatusWriter,
  } = AttestationRecordAdaptor(opts);

  return handler({
    globalAttestationCycleReader,
    attestationCycleByUserGroupReader,
    createAttestationRecordWriter,
    updateAttestationRecordStatusWriter,
  });
};
