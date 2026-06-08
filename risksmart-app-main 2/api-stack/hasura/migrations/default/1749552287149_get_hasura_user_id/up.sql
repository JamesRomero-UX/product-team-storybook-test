/**
 Strictly should be renamed to risksmart.get_risksmart_user_id, however this function is used in many places
 Now supports getting user id as set by hasura, then falling back to user id as set by risksmart TRPC
 **/
CREATE OR REPLACE FUNCTION risksmart.get_hasura_user_id() RETURNS text LANGUAGE 'plpgsql' AS $BODY$
DECLARE user_id TEXT;

BEGIN
SELECT coalesce(
        cast(current_setting('hasura.user', 't') as JSON)->>'x-hasura-user-id'::text,
        current_setting('risksmart.user_id', 't')::text
    ) into user_id;

IF user_id IS NULL THEN user_id := 'SYSTEM';

END IF;

RETURN user_id;

END;

$BODY$;