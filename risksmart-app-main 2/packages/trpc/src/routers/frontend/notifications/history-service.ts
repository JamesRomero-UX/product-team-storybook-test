import { TRPCError } from '@trpc/server';

import type { KnockConfig } from './knock-client';
import { fetchWithRetry } from './knock-client';
import type {
  KnockActivity,
  KnockActivityListResponse,
  KnockMessage,
  KnockMessageBatchResponse,
  KnockMessageListResponse,
  ListBatchInput,
} from './types/history';

const PAGES_PER_BATCH = 10;
const MAX_ACTIVITY_PAGES = 10;

export const listBatchMessages = async (
  config: KnockConfig,
  params: ListBatchInput,
  tenant: string
): Promise<KnockMessageBatchResponse> => {
  const allItems: KnockMessage[] = [];
  let cursor: string | null = params.cursor ?? null;

  for (let page = 0; page < PAGES_PER_BATCH; page++) {
    const url = new URL(`${config.apiBase}/v1/messages`);
    url.searchParams.set('tenant', tenant);
    url.searchParams.set('page_size', '50');

    if (params.insertedAtGt) {
      url.searchParams.set('inserted_at.gt', params.insertedAtGt);
    }
    if (params.insertedAtLt) {
      url.searchParams.set('inserted_at.lt', params.insertedAtLt);
    }
    if (params.objectId) {
      url.searchParams.set('trigger_data[objectId]', params.objectId);
    }
    if (cursor) {
      url.searchParams.set('after', cursor);
    }

    try {
      const data = await fetchWithRetry<KnockMessageListResponse>(
        url.toString(),
        config
      );
      allItems.push(...data.items);

      if (!data.page_info.after) {
        return { items: allItems, nextCursor: null };
      }
      cursor = data.page_info.after;
    } catch (err) {
      if (err instanceof TRPCError) {
        throw err;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Knock API unreachable',
      });
    }
  }

  return { items: allItems, nextCursor: cursor };
};

const isDigestMessage = (msg: KnockMessage): boolean =>
  msg.source?.key === 'digest' || msg.workflow === 'digest';

export const fetchDigestActivities = async (
  config: KnockConfig,
  messageId: string,
  _tenant: string
): Promise<KnockActivityListResponse> => {
  const allItems: KnockActivity[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_ACTIVITY_PAGES; page++) {
    const url = new URL(
      `${config.apiBase}/v1/messages/${encodeURIComponent(messageId)}/activities`
    );
    url.searchParams.set('page_size', '50');
    if (cursor) {
      url.searchParams.set('after', cursor);
    }

    const data = await fetchWithRetry<KnockActivityListResponse>(
      url.toString(),
      config
    );
    allItems.push(...data.items);

    if (!data.page_info.after) {
      return { items: allItems, page_info: data.page_info };
    }
    cursor = data.page_info.after;
  }

  return {
    items: allItems,
    page_info: { after: cursor, before: null, page_size: 50 },
  };
};

const fetchDigestActivityCounts = async (
  config: KnockConfig,
  messages: KnockMessage[]
): Promise<Map<string, number>> => {
  const digests = messages.filter(isDigestMessage);
  if (digests.length === 0) {
    return new Map();
  }

  const counts = new Map<string, number>();
  const CONCURRENCY = 10;

  for (let i = 0; i < digests.length; i += CONCURRENCY) {
    const batch = digests.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (msg) => {
        try {
          const url = new URL(
            `${config.apiBase}/v1/messages/${encodeURIComponent(msg.id)}/activities`
          );
          url.searchParams.set('page_size', '1');

          const data = await fetchWithRetry<KnockActivityListResponse>(
            url.toString(),
            config
          );

          return [
            msg.id,
            data.page_info.total_count ?? data.items.length,
          ] as const;
        } catch {
          return [msg.id, undefined] as const;
        }
      })
    );

    for (const [id, count] of results) {
      if (count !== undefined) {
        counts.set(id, count);
      }
    }
  }

  return counts;
};

interface ResolvedRecipient {
  email?: string;
  name?: string;
}

const fetchKnockUser = async (
  config: KnockConfig,
  userId: string
): Promise<ResolvedRecipient | undefined> => {
  try {
    const user = await fetchWithRetry<{
      email?: string;
      name?: string;
    }>(`${config.apiBase}/v1/users/${encodeURIComponent(userId)}`, config);

    return { email: user.email, name: user.name };
  } catch {
    return undefined;
  }
};

const fetchKnockObject = async (
  config: KnockConfig,
  collection: string,
  objectId: string
): Promise<ResolvedRecipient | undefined> => {
  try {
    const obj = await fetchWithRetry<{
      properties?: { name?: string; email?: string };
    }>(
      `${config.apiBase}/v1/objects/${encodeURIComponent(collection)}/${encodeURIComponent(objectId)}`,
      config
    );

    return {
      name: obj.properties?.name,
      email: obj.properties?.email || undefined,
    };
  } catch {
    return undefined;
  }
};

interface RecipientLookupKey {
  id: string;
  collection?: string;
}

const resolveRecipients = async (
  config: KnockConfig,
  messages: KnockMessage[]
): Promise<Map<string, ResolvedRecipient>> => {
  const lookups: RecipientLookupKey[] = [];
  for (const msg of messages) {
    const recipient = msg.recipient;
    if (typeof recipient === 'string') {
      lookups.push({ id: recipient });
    } else if (recipient && typeof recipient === 'object') {
      if (!recipient.email && !recipient.name) {
        lookups.push({
          id: recipient.id,
          collection: recipient.collection,
        });
      }
    }
  }

  // Deduplicate by composite key
  const seen = new Set<string>();
  const unique: RecipientLookupKey[] = [];
  for (const l of lookups) {
    const key = l.collection ? `${l.collection}:${l.id}` : l.id;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(l);
    }
  }

  if (unique.length === 0) {
    return new Map();
  }

  // Batch lookups with concurrency limit to avoid overwhelming Knock API
  const CONCURRENCY = 10;
  const map = new Map<string, ResolvedRecipient>();

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (lookup) => {
        const resolved = lookup.collection
          ? await fetchKnockObject(config, lookup.collection, lookup.id)
          : await fetchKnockUser(config, lookup.id);
        const key = lookup.collection
          ? `${lookup.collection}:${lookup.id}`
          : lookup.id;

        return [key, resolved] as const;
      })
    );

    for (const [key, resolved] of results) {
      if (resolved) {
        map.set(key, resolved);
      }
    }
  }

  return map;
};

const CHANNEL_TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  in_app_feed: 'In-app',
  chat: 'Chat',
  push: 'Push',
  sms: 'SMS',
  http: 'Webhook',
};

const resolveChannelLabel = (channel?: {
  name: string;
  type: string;
}): string => {
  if (!channel) {
    return '';
  }

  return CHANNEL_TYPE_LABELS[channel.type] || channel.name;
};

export const enrichMessages = async (
  config: KnockConfig,
  messages: KnockMessage[]
): Promise<KnockMessage[]> => {
  const [recipientMap, activityCounts] = await Promise.all([
    resolveRecipients(config, messages),
    fetchDigestActivityCounts(config, messages),
  ]);

  return messages.map((msg) => {
    let recipientEmail: string | undefined;
    let recipientName: string | undefined;

    if (typeof msg.recipient === 'object' && msg.recipient) {
      // Use inline fields if present
      recipientEmail = msg.recipient.email || undefined;
      recipientName = msg.recipient.name || undefined;

      // Fall back to Knock API lookup
      if (!recipientEmail && !recipientName) {
        const collection = msg.recipient.collection;
        const key = collection
          ? `${collection}:${msg.recipient.id}`
          : msg.recipient.id;
        const resolved = recipientMap.get(key);
        recipientEmail = resolved?.email;
        recipientName = resolved?.name;
      }
    } else if (typeof msg.recipient === 'string') {
      const resolved = recipientMap.get(msg.recipient);
      recipientEmail = resolved?.email;
      recipientName = resolved?.name;
    }

    return {
      ...msg,
      recipientEmail,
      recipientName,
      channelName: resolveChannelLabel(msg.channel),
      totalActivities: activityCounts.get(msg.id),
    };
  });
};
