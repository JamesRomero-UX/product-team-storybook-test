alter table risksmart.attestation_group drop constraint "attestation_group_ConfigId_fkey";

alter table risksmart.attestation_group
ADD FOREIGN KEY ("ConfigId") REFERENCES risksmart.attestation_config("ParentId") ON DELETE CASCADE;