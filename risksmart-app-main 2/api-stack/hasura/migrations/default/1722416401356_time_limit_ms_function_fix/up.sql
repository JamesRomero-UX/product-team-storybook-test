DROP FUNCTION risksmart.attestation_time_limit_ms;

CREATE OR REPLACE FUNCTION risksmart.attestation_time_limit_ms(attestation_config_row risksmart.attestation_config)
RETURNS BIGINT AS $$
  SELECT EXTRACT(epoch FROM attestation_config_row."AttestationTimeLimit")*1000;
$$ LANGUAGE sql STABLE;
