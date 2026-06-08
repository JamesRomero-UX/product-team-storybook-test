import 'dotenv/config';

import type { ReassignUserMutation } from '../../generated/graphql';
import { getUser, reassignUser } from '../graphqlClient';
import { getEnv } from '../utils/environment';

const OldUserId = getEnv('OLD_USER_ID');
const NewUserId = getEnv('NEW_USER_ID');
const OrgKey = getEnv('ORG_KEY');
const validateOnly = getEnv('VALIDATE_ONLY');

(async () => {
  console.log(
    `Reassigning items from user ${OldUserId} to ${NewUserId} within org ${OrgKey}`
  );

  const oldUser = await getUser({ userId: OldUserId });
  if (oldUser.errors) {
    console.error(oldUser.errors);

    return;
  }
  if (oldUser.data && oldUser.data.user.length !== 1) {
    console.log('Old user not found');

    return;
  }

  const newUser = await getUser({ userId: NewUserId });
  if (newUser.errors) {
    console.error(newUser.errors);

    return;
  }
  if (newUser.data && newUser.data.user.length !== 1) {
    console.log('New user not found');

    return;
  }
  console.log('Old user', oldUser.data.user[0].UserName);
  console.log('New user', newUser.data.user[0].UserName);

  if (validateOnly.toLowerCase() === 'true') {
    console.log('Validate only mode. Skipping import');

    return;
  }

  const now = new Date();
  const result = await reassignUser({
    OldUserId,
    NewUserId,
    OrgKey,
    ModifiedAtTimestamp1: now.toISOString(),
    // Pretty horrible, but if a table has two user columns, we need to do two update statements.
    // These update statements need different update timestamps so the pk on the audit table is unique.
    // using now() within the graphql uses the transaction timestamp which will be the same for each query, so not useable.
    ModifiedAtTimestamp2: new Date(now.getTime() + 1).toISOString(),
  });

  for (const key in result.data) {
    if (!result.data) {
      console.log('Reassign failed');

      return;
    }

    const updateKey = key as keyof ReassignUserMutation;

    if (updateKey != '__typename') {
      const recordsUpdated = result.data[updateKey];
      if (recordsUpdated!.affected_rows > 0) {
        console.log(
          `${updateKey} - ${recordsUpdated?.affected_rows} records updated`
        );
      }
    }
  }

  console.log('Complete');
})();
