CREATE OR REPLACE FUNCTION risksmart.attestation_time_limit_ms(attestation_config_row risksmart.attestation_config)
RETURNS INTEGER AS $$
  SELECT EXTRACT(epoch FROM attestation_config_row."AttestationTimeLimit")
$$ LANGUAGE sql STABLE;
