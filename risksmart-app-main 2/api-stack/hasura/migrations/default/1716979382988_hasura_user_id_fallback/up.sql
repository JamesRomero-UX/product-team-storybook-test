CREATE OR REPLACE FUNCTION risksmart.get_hasura_user_id() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE user_id TEXT;

BEGIN
SELECT cast(current_setting('hasura.user') as JSON)->>'x-hasura-user-id' into user_id;

IF user_id IS NULL THEN
  user_id := 'SYSTEM';
END IF;

RETURN user_id;

END;

$$;
