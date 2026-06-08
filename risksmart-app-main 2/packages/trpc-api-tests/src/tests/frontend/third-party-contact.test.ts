import {
  buildThirdParty,
  buildThirdPartyContact,
  insertThirdParty,
  insertThirdPartyContact,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('ThirdPartyContact', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('list', () => {
    it('should return contacts for a third party', async () => {
      const ctx = await createTestContext();
      contexts.push(ctx);
      const { orgKey, userId, trpcClient } = ctx;

      const thirdPartyId = randomUUID();
      const thirdParty = buildThirdParty(orgKey, userId, { Id: thirdPartyId });
      await insertThirdParty(thirdParty);

      const contact1Id = randomUUID();
      const contact2Id = randomUUID();
      const contact1 = buildThirdPartyContact({
        orgKey,
        userId,
        thirdPartyId,
        overrides: { Id: contact1Id },
      });
      const contact2 = buildThirdPartyContact({
        orgKey,
        userId,
        thirdPartyId,
        overrides: { Id: contact2Id },
      });
      await insertThirdPartyContact(contact1);
      await insertThirdPartyContact(contact2);

      const response = await trpcClient.frontend.thirdPartyContact.list.query({
        thirdPartyId,
      });

      expect(response.contacts.length).toEqual(2);
      expect(response.contacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: contact1Id,
            Email: contact1.Email,
            ThirdPartyId: thirdPartyId,
          }),
          expect.objectContaining({
            Id: contact2Id,
            Email: contact2.Email,
            ThirdPartyId: thirdPartyId,
          }),
        ])
      );
    });

    it('should return empty contacts array for non-existent third party', async () => {
      const ctx = await createTestContext();
      contexts.push(ctx);
      const { trpcClient } = ctx;

      const response = await trpcClient.frontend.thirdPartyContact.list.query({
        thirdPartyId: randomUUID(),
      });

      expect(response.contacts).toEqual([]);
    });

    it('should include revoked contacts when isIncludingRevoked is true', async () => {
      const ctx = await createTestContext();
      contexts.push(ctx);
      const { orgKey, userId, trpcClient } = ctx;

      const thirdPartyId = randomUUID();
      await insertThirdParty(
        buildThirdParty(orgKey, userId, { Id: thirdPartyId })
      );

      const activeContactId = randomUUID();
      const revokedContactId = randomUUID();
      await insertThirdPartyContact(
        buildThirdPartyContact({
          orgKey,
          userId,
          thirdPartyId,
          overrides: { Id: activeContactId },
        })
      );
      await insertThirdPartyContact(
        buildThirdPartyContact({
          orgKey,
          userId,
          thirdPartyId,
          overrides: { Id: revokedContactId, IsRevoked: true },
        })
      );

      const response = await trpcClient.frontend.thirdPartyContact.list.query({
        thirdPartyId,
        isIncludingRevoked: true,
      });

      expect(response.contacts.length).toEqual(2);
      expect(response.contacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: activeContactId,
            IsRevoked: false,
          }),
          expect.objectContaining({
            Id: revokedContactId,
            IsRevoked: true,
          }),
        ])
      );
    });
  });

  describe('getById', () => {
    it('should return a contact by its ID', async () => {
      const ctx = await createTestContext();
      contexts.push(ctx);
      const { orgKey, userId, trpcClient } = ctx;

      const thirdPartyId = randomUUID();
      await insertThirdParty(
        buildThirdParty(orgKey, userId, { Id: thirdPartyId })
      );

      const contactId = randomUUID();
      const contact = buildThirdPartyContact({
        orgKey,
        userId,
        thirdPartyId,
        overrides: { Id: contactId },
      });
      await insertThirdPartyContact(contact);

      const response =
        await trpcClient.frontend.thirdPartyContact.getById.query({
          contactId,
        });

      expect(response).toEqual(
        expect.objectContaining({
          Id: contactId,
          Email: contact.Email,
          Name: contact.Name,
          JobTitle: contact.JobTitle,
          ThirdPartyId: thirdPartyId,
          IsRevoked: false,
        })
      );
    });

    it('should throw for a non-existent contact ID', async () => {
      const ctx = await createTestContext();
      contexts.push(ctx);
      const { trpcClient } = ctx;

      await expect(
        trpcClient.frontend.thirdPartyContact.getById.query({
          contactId: randomUUID(),
        })
      ).rejects.toThrow();
    });
  });

  describe('getActiveContacts', () => {
    it('should return only active contacts', async () => {
      const ctx = await createTestContext();
      contexts.push(ctx);
      const { orgKey, userId, trpcClient } = ctx;

      const thirdPartyId = randomUUID();
      await insertThirdParty(
        buildThirdParty(orgKey, userId, { Id: thirdPartyId })
      );

      const activeContactId = randomUUID();
      const activeContact = buildThirdPartyContact({
        orgKey,
        userId,
        thirdPartyId,
        overrides: { Id: activeContactId },
      });
      await insertThirdPartyContact(activeContact);
      await insertThirdPartyContact(
        buildThirdPartyContact({
          orgKey,
          userId,
          thirdPartyId,
          overrides: { IsRevoked: true },
        })
      );

      const response =
        await trpcClient.frontend.thirdPartyContact.getActiveContacts.query({
          thirdPartyId,
        });

      expect(response.contacts.length).toEqual(1);
      expect(response.contacts[0]).toEqual(
        expect.objectContaining({
          Id: activeContactId,
          Email: activeContact.Email,
          IsRevoked: false,
        })
      );
    });
  });
});
