INSERT INTO risksmart.attestation_record_status ("Value", "Comment")
VALUES ('not_attested', 'Attestation was not provided') ON CONFLICT ("Value") DO NOTHING;