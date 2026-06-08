/**
 * Kinesis Firehose Mock
 *
 * Implements the Firehose PutRecord/PutRecordBatch wire protocol.
 * Logs records to console (and optionally writes to RustFS via HTTP PUT).
 *
 * AWS_ENDPOINT_URL_FIREHOSE=http://localhost:3011
 */

import { createServer } from 'node:http';

const PORT = parseInt(process.env.FIREHOSE_MOCK_PORT || '3011', 10);
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

/**
 * Writes a Firehose record to RustFS via raw HTTP PUT (no SDK dependency).
 */
async function writeToS3(deliveryStreamName, data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `firehose/${deliveryStreamName}/${timestamp}-${crypto.randomUUID()}.json`;
  const bucket =
    deliveryStreamName.replace(/-ai-feedback$/, '') + '-ai-feedback';

  try {
    await fetch(`${S3_ENDPOINT}/${bucket}/${key}`, {
      method: 'PUT',
      body: data,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Silently fail — bucket may not exist
  }
}

async function handleRequest(req, res) {
  if (req.url === '/healthz' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'firehose-mock' }));
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end();
    return;
  }

  const target = req.headers['x-amz-target'] || '';
  const body = await readBody(req);

  try {
    const parsed = JSON.parse(body);

    if (target.includes('PutRecord')) {
      const streamName = parsed.DeliveryStreamName;
      const data = parsed.Record?.Data
        ? Buffer.from(parsed.Record.Data, 'base64').toString()
        : '';

      console.log(`PutRecord -> ${streamName}`);
      await writeToS3(streamName, data);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({ RecordId: crypto.randomUUID(), Encrypted: false })
      );
      return;
    }

    if (target.includes('PutRecordBatch')) {
      const streamName = parsed.DeliveryStreamName;
      const records = parsed.Records || [];

      console.log(
        `PutRecordBatch -> ${streamName} (${records.length} records)`
      );

      for (const record of records) {
        const data = record.Data
          ? Buffer.from(record.Data, 'base64').toString()
          : '';
        await writeToS3(streamName, data);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          FailedPutCount: 0,
          Encrypted: false,
          RequestResponses: records.map(() => ({
            RecordId: crypto.randomUUID(),
          })),
        })
      );
      return;
    }

    if (target.includes('DescribeDeliveryStream')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          DeliveryStreamDescription: {
            DeliveryStreamName: parsed.DeliveryStreamName,
            DeliveryStreamStatus: 'ACTIVE',
            DeliveryStreamType: 'DirectPut',
          },
        })
      );
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({}));
  } catch (error) {
    console.error('Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));
  }
}

export function startFirehoseMock() {
  const server = createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
  return server;
}
