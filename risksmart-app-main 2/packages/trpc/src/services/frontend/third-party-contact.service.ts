import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getThirdPartyContactByIdQueryConfig,
  getThirdPartyContactsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/third-party-contact.query';

import type {
  ThirdPartyContactByIdRow,
  ThirdPartyContactRow,
} from '../../types/third-party-contact.types';
import type {
  ServiceContext,
  ThirdPartyContactService,
} from '../service.types';

export class ThirdPartyContactServiceImpl implements ThirdPartyContactService {
  async getContactsByThirdParty(
    ctx: ServiceContext,
    thirdPartyId: string,
    isIncludingRevoked = false
  ): Promise<{ contacts: ThirdPartyContactRow[] }> {
    const db = await createDrizzleClient(ctx);

    const contacts = await db.org((tx) => {
      return tx.query.third_party_contact.findMany({
        ...getThirdPartyContactsQueryConfig,
        where: isIncludingRevoked
          ? { ThirdPartyId: thirdPartyId }
          : { ThirdPartyId: thirdPartyId, IsRevoked: false },
        orderBy: (contact, { desc }) => [desc(contact.CreatedAtTimestamp)],
      });
    });

    return { contacts };
  }

  async getContactById(
    ctx: ServiceContext,
    contactId: string
  ): Promise<ThirdPartyContactByIdRow> {
    const db = await createDrizzleClient(ctx);

    const contact = await db.org((tx) => {
      return tx.query.third_party_contact.findFirst({
        ...getThirdPartyContactByIdQueryConfig,
        where: { Id: contactId },
      });
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  }

  async getActiveContacts(
    ctx: ServiceContext,
    thirdPartyId: string
  ): Promise<{ contacts: ThirdPartyContactRow[] }> {
    const db = await createDrizzleClient(ctx);

    const contacts = await db.org((tx) => {
      return tx.query.third_party_contact.findMany({
        ...getThirdPartyContactsQueryConfig,
        where: { ThirdPartyId: thirdPartyId, IsRevoked: false },
        orderBy: (contact, { asc }) => [asc(contact.Email)],
      });
    });

    return { contacts };
  }
}
