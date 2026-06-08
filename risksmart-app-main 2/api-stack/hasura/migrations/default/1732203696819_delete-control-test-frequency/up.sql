ALTER TABLE risksmart.control DROP CONSTRAINT control_test_frequency_fkey;

ALTER TABLE risksmart.control
ADD FOREIGN KEY ("TestFrequency") REFERENCES risksmart.test_frequency("Value");

DROP TABLE risksmart.control_test_frequency;