DO $$
DECLARE environment text;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

-- Eventually will come up with a better way to set new password which applies to all environments
IF environment = 'dev' THEN ALTER USER reporting WITH PASSWORD 'reporting123!';

END IF;

END $$;