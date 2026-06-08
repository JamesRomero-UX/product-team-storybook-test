import { buildDocument, insertDocument } from '@risksmart-app/test-data';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Document', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('list query should return documents ordered by Title', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create documents with different titles to verify ordering
    const {
      Meta: meta1,
      OrgKey: orgKey1,
      ...document1Props
    } = buildDocument(orgKey, userId, { Title: 'B - Second Document' });
    await insertDocument({ Meta: meta1, OrgKey: orgKey1, ...document1Props });

    const {
      Meta: meta2,
      OrgKey: orgKey2,
      ...document2Props
    } = buildDocument(orgKey, userId, { Title: 'A - First Document' });
    await insertDocument({ Meta: meta2, OrgKey: orgKey2, ...document2Props });

    const {
      Meta: meta3,
      OrgKey: orgKey3,
      ...document3Props
    } = buildDocument(orgKey, userId, { Title: 'C - Third Document' });
    await insertDocument({ Meta: meta3, OrgKey: orgKey3, ...document3Props });

    const response = await trpcClient.frontend.document.list.query();

    // Verify we got at least the 3 documents we created
    expect(response.length).toBeGreaterThanOrEqual(3);

    // Find our test documents in the response
    const testDocuments = response.filter((doc) =>
      [document1Props.Id, document2Props.Id, document3Props.Id].includes(doc.Id)
    );

    // Verify all 3 test documents are in the response
    expect(testDocuments.length).toEqual(3);

    // Verify documents are ordered by Title ascending
    expect(testDocuments[0]?.Title).toEqual('A - First Document');
    expect(testDocuments[1]?.Title).toEqual('B - Second Document');
    expect(testDocuments[2]?.Title).toEqual('C - Third Document');

    // Verify only Id and Title are returned (no extra fields)
    testDocuments.forEach((doc) => {
      expect(Object.keys(doc)).toEqual(['Id', 'Title']);
    });
  });

  it('list query should return only documents user has access to', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a document for this user/org
    const { Meta, OrgKey, ...documentProps } = buildDocument(orgKey, userId);
    await insertDocument({ Meta, OrgKey, ...documentProps });

    const response = await trpcClient.frontend.document.list.query();

    // Verify the document is in the response
    const foundDocument = response.find((doc) => doc.Id === documentProps.Id);
    expect(foundDocument).toBeDefined();
    expect(foundDocument).toEqual({
      Id: documentProps.Id,
      Title: documentProps.Title,
    });
  });

  it('list query should return empty array when no documents exist', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response = await trpcClient.frontend.document.list.query();

    // New org should have no documents
    expect(response).toEqual([]);
  });
});
