import { sql } from 'drizzle-orm';

import { getSharedDb } from './shared-db';

export const deleteTestOrg = async (
  orgKey: string,
  userId: string
): Promise<void> => {
  try {
    const db = await getSharedDb();

    // Run the entire cleanup server-side in a single transaction.
    // Using a transaction pins all statements to one pooled connection,
    // and the DO block loops through tables server-side avoiding 200+ round trips.
    await db.admin.transaction(async (tx) => {
      // Pass values into the DO block via session config
      await tx.execute(
        sql`SELECT set_config('cleanup.org_key', ${orgKey}, true),
                   set_config('cleanup.user_id', ${userId}, true)`
      );

      await tx.execute(sql`
        DO $$
        DECLARE
          t RECORD;
          v_org_key TEXT := current_setting('cleanup.org_key');
          v_user_id TEXT := current_setting('cleanup.user_id');
        BEGIN
          SET LOCAL session_replication_role = 'replica';

          FOR t IN
            SELECT c.table_schema, c.table_name
            FROM information_schema.columns c
            JOIN information_schema.tables tt
              ON tt.table_schema = c.table_schema AND tt.table_name = c.table_name
            WHERE c.column_name = 'OrgKey'
              AND c.table_schema IN ('risksmart', 'auth')
              AND tt.table_type = 'BASE TABLE'
              AND c.table_name NOT LIKE '%_view'
          LOOP
            EXECUTE format(
              'DELETE FROM %I.%I WHERE "OrgKey" = %L',
              t.table_schema, t.table_name, v_org_key
            );
          END LOOP;

          EXECUTE format(
            'DELETE FROM auth."user" WHERE "Id" = %L',
            v_user_id
          );
        END $$;
      `);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.warn(`[cleanup] Cleanup failed for org ${orgKey}: ${message}`);
  }
};
