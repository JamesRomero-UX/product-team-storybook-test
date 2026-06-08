import { randomUUID } from 'node:crypto';

import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  obligation,
  obligation_change,
  regulatory_source,
} from '@risksmart-app/drizzle/src/schema';
import { and, eq, or } from 'drizzle-orm';
import { getDatabaseConnection } from 'src/repositories';
import {
  createIngestionManifest,
  manifestRegulatorEntry,
  withRegulators,
  withRunId,
} from 'test/external-obligations-updated/builders/manifest-builder';
import {
  chapter,
  createRegulatorChangeResult,
  obligationChange,
  rule,
  standard,
  task,
  withAdded,
  withObligationChangesAdded,
  withRegulatorId,
  withUpdated,
} from 'test/external-obligations-updated/builders/regulator-change-result-builder';

describe('External Obligations Updated Integration', () => {
  const regulator1Id = randomUUID();
  const regulator2Id = randomUUID();
  const bucketName = 'tech-admin-rulebook-changes';
  const orgKey = 'org_Qshp7tYsxxAWwhVa';

  let db: DB['transaction'];

  const s3Client = new S3Client({
    region: 'eu-west-2',
    endpoint: 'http://localhost:9000',
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  });

  const lambdaClient = new LambdaClient({
    region: 'eu-west-2',
    endpoint: 'http://localhost:3100',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  });

  const triggerEvent = async (runId: string) => {
    const eventDetail = {
      type: 'EXTERNAL_OBLIGATIONS_UPDATED',
      data: {
        location: `s3://${bucketName}/${runId}/manifest.json`,
      },
      metadata: {
        eventId: randomUUID(),
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        domain: 'risksmart.app',
        service: 'risksmart.data-layer',
        correlationId: randomUUID(),
        tenant: 'multitenant',
        orgKey,
        userId: 'SYSTEM',
      },
    };

    const lambdaEvent = {
      version: '0',
      id: randomUUID(),
      'detail-type': 'EXTERNAL_OBLIGATIONS_UPDATED',
      source: 'risksmart.app',
      account: '123456789012',
      time: new Date().toISOString(),
      region: 'eu-west-2',
      resources: [],
      detail: eventDetail,
    };

    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: 'eu-west-2-tech-admin-data-layer-org-event-handler',
        Payload: JSON.stringify(lambdaEvent),
      })
    );
  };

  const uploadRegulatorFiles = async (
    runId: string,
    ...regulators: ReturnType<typeof createRegulatorChangeResult>[]
  ) => {
    const manifest = createIngestionManifest(
      withRunId(runId),
      withRegulators(
        ...regulators.map((reg) =>
          manifestRegulatorEntry({
            id: reg.regulatorId,
            name: `Regulator ${reg.regulatorId}`,
            obligations: {
              added: reg.obligations.added.length,
              updated: reg.obligations.updated.length,
              removed: reg.obligations.removed.length,
            },
            obligationChanges: {
              added: reg.obligationChanges.added.length,
              updated: reg.obligationChanges.updated.length,
              removed: reg.obligationChanges.removed.length,
            },
            location: `s3://${bucketName}/${runId}/regulators/${reg.regulatorId}.json`,
          })
        )
      )
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `${runId}/manifest.json`,
        Body: JSON.stringify(manifest),
      })
    );

    for (const reg of regulators) {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: `${runId}/regulators/${reg.regulatorId}.json`,
          Body: JSON.stringify(reg),
        })
      );
    }
  };

  beforeAll(async () => {
    db = await getDatabaseConnection({
      tenant: 'multitenant',
      orgKey,
    });

    const regulator1 = createRegulatorChangeResult(
      withRegulatorId(regulator1Id),
      withAdded(
        standard({ externalId: 'std-1', title: 'Standard 1' }, [
          chapter({ externalId: 'ch-1', title: 'Chapter 1' }, [
            rule({ externalId: 'r-1', title: 'Rule 1' }, [
              task({
                referenceCode: 'ref-1',
                sourceUrl: 'https://example.com/ref-1',
                externalId: 't-1',
                title: 'Task 1',
              }),
            ]),
          ]),
        ])
      ),
      withObligationChangesAdded(
        obligationChange({
          externalId: 'oc-1',
          externalParentId: 'r-1',
          description: {
            before: 'Original rule text',
            after: 'Updated rule text',
          },
          rationale: 'Annual regulatory review',
          effectiveDate: '2024-06-01',
          contentHash: 'hash-oc-1',
        }),
        obligationChange({
          externalId: 'oc-2',
          externalParentId: 'r-1',
          description: {
            before: 'Previous wording',
            after: 'New wording',
          },
          contentHash: 'hash-oc-2',
        })
      )
    );

    const regulator2 = createRegulatorChangeResult(
      withRegulatorId(regulator2Id),
      withAdded(
        standard({ externalId: 'std-1', title: 'Standard 1' }, [
          chapter({ externalId: 'ch-1', title: 'Chapter 1' }, [
            rule({ externalId: 'r-1', title: 'Rule 1' }, [
              task({
                referenceCode: 'ref-2',
                sourceUrl: 'https://example.com/ref-2',
                externalId: 't-1',
                title: 'Task 1',
              }),
            ]),
          ]),
        ])
      ),
      withObligationChangesAdded(
        obligationChange({
          externalId: 'oc-1',
          externalParentId: 'r-1',
          description: {
            before: 'Old content',
            after: 'New content',
          },
          contentHash: 'hash-oc-1-reg2',
        })
      )
    );

    const runId = randomUUID();
    await uploadRegulatorFiles(runId, regulator1, regulator2);
    await triggerEvent(runId);
  }, 30_000);

  it('should create regulatory sources in the database based on the regulator change results in the manifest', async () => {
    const regulatorySources = await db((tx) =>
      tx
        .select()
        .from(regulatory_source)
        .where(
          and(
            eq(regulatory_source.OrgKey, orgKey),
            or(
              eq(regulatory_source.ExternalRegulatorId, regulator1Id),
              eq(regulatory_source.ExternalRegulatorId, regulator2Id)
            )
          )
        )
    );

    expect(regulatorySources).toHaveLength(2);

    for (const regulatorySource of regulatorySources) {
      const obligations = await db((tx) =>
        tx
          .select()
          .from(obligation)
          .where(
            and(
              eq(obligation.OrgKey, orgKey),
              eq(obligation.RegulatorySourceId, regulatorySource.Id)
            )
          )
      );

      expect(obligations).toHaveLength(4);
    }
  });

  it('should create obligation changes linked to their parent rule', async () => {
    const regulatorySources = await db((tx) =>
      tx
        .select()
        .from(regulatory_source)
        .where(
          and(
            eq(regulatory_source.OrgKey, orgKey),
            or(
              eq(regulatory_source.ExternalRegulatorId, regulator1Id),
              eq(regulatory_source.ExternalRegulatorId, regulator2Id)
            )
          )
        )
    );

    expect(regulatorySources).toHaveLength(2);

    const regulator1Source = regulatorySources.find(
      (rs) => rs.ExternalRegulatorId === regulator1Id
    )!;

    const regulator1Changes = await db((tx) =>
      tx
        .select()
        .from(obligation_change)
        .innerJoin(
          obligation,
          eq(obligation_change.ObligationId, obligation.Id)
        )
        .where(
          and(
            eq(obligation.RegulatorySourceId, regulator1Source.Id),
            eq(obligation.ExternalId, 'r-1'),
            eq(obligation_change.OrgKey, orgKey)
          )
        )
    );

    // regulator 1 has 2 obligation changes both linked to rule 'r-1'
    expect(regulator1Changes).toHaveLength(2);

    const externalIds = regulator1Changes.map(
      (row) => row.obligation_change.ExternalId
    );
    expect(externalIds).toContain('oc-1');
    expect(externalIds).toContain('oc-2');

    const oc1 = regulator1Changes.find(
      (row) => row.obligation_change.ExternalId === 'oc-1'
    )!;
    expect(oc1.obligation_change.DescriptionBefore).toEqual(
      'Original rule text'
    );
    expect(oc1.obligation_change.DescriptionAfter).toEqual('Updated rule text');
    expect(oc1.obligation_change.Rationale).toEqual('Annual regulatory review');
    expect(oc1.obligation_change.ObligationId).not.toBeNull();
  });

  it('should update existing obligations in the database when they are included as updated in the regulator change results', async () => {
    const regulator1 = createRegulatorChangeResult(
      withRegulatorId(regulator1Id),
      withUpdated(
        standard({ externalId: 'std-1', title: 'Standard 1' }, [
          chapter({ externalId: 'ch-1', title: 'Chapter 1' }, [
            rule({ externalId: 'r-1', title: 'Rule 1' }, [
              task({
                referenceCode: 'ref-1',
                sourceUrl: 'https://example.com/ref-1',
                externalId: 't-1',
                title: 'Task 1',
                description: 'Updated description',
              }),
            ]),
          ]),
        ])
      )
    );

    const runId = randomUUID();
    await uploadRegulatorFiles(runId, regulator1);
    await triggerEvent(runId);

    const obligations = await db((tx) =>
      tx
        .select()
        .from(obligation)
        .fullJoin(
          regulatory_source,
          eq(obligation.RegulatorySourceId, regulatory_source.Id)
        )
        .where(
          and(
            eq(obligation.OrgKey, orgKey),
            eq(obligation.ExternalId, 't-1'),
            eq(regulatory_source.ExternalRegulatorId, regulator1Id)
          )
        )
    );

    expect(obligations).toHaveLength(1);
    expect(obligations[0]!.obligation!.Description).toEqual(
      'Updated description'
    );
    expect(obligations[0]!.obligation!.ParentId).not.toBeNull();
  }, 30_000);

  it('should upsert obligation changes idempotently on re-run with same content hash', async () => {
    const regulator1 = createRegulatorChangeResult(
      withRegulatorId(regulator1Id),
      withObligationChangesAdded(
        obligationChange({
          externalId: 'oc-1',
          externalParentId: 'r-1',
          description: {
            before: 'Original rule text',
            after: 'Updated rule text',
          },
          rationale: 'Annual regulatory review',
          effectiveDate: '2024-06-01',
          // same contentHash as beforeAll — should not update
          contentHash: 'hash-oc-1',
        })
      )
    );

    const runId = randomUUID();
    await uploadRegulatorFiles(runId, regulator1);
    await triggerEvent(runId);

    const changes = await db((tx) =>
      tx
        .select()
        .from(obligation_change)
        .where(
          and(
            eq(obligation_change.OrgKey, orgKey),
            eq(obligation_change.ExternalId, 'oc-1')
          )
        )
    );

    // still one row — upsert did not create a duplicate
    const regulator1Changes = changes.filter(
      (c) => c.ContentHash === 'hash-oc-1'
    );
    expect(regulator1Changes).toHaveLength(1);
  }, 30_000);
});
