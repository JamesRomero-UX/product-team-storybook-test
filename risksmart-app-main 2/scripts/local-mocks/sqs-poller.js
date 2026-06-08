/**
 * Local SQS Poller
 *
 * Bridges SQS (ElasticMQ) → Lambda (SAM) for local development.
 * Replaces AWS::Lambda::EventSourceMapping that AWS handles in production.
 *
 * Polls configured SQS queues and invokes Lambda functions via SAM's
 * invoke endpoint when messages are received.
 *
 * Environment variables:
 *   SQS_ENDPOINT          (default: http://localhost:9324)
 *   SAM_LAMBDA_ENDPOINT   (default: http://localhost:3100)
 *   QUEUE_MAPPINGS        JSON array of { queueUrl, functionName, batchSize }
 */

const SQS_ENDPOINT = process.env.SQS_ENDPOINT || 'http://localhost:9324';
const SAM_LAMBDA_ENDPOINT =
  process.env.SAM_LAMBDA_ENDPOINT || 'http://localhost:3100';

let mappings = [];
try {
  mappings = JSON.parse(process.env.QUEUE_MAPPINGS || '[]');
} catch {
  console.error('Failed to parse QUEUE_MAPPINGS');
  process.exit(1);
}

/** Unescape XML entities. */
function xmlUnescape(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** Parse a single XML tag value. */
function xmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? xmlUnescape(match[1]) : null;
}

/** Parse all occurrences of an XML element. */
function xmlAll(xml, tag) {
  const results = [];
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1]);
  }
  return results;
}

/** Receive messages from an SQS queue via the query API. */
async function receiveMessages(queueUrl, maxMessages = 1, waitTime = 5) {
  const params = new URLSearchParams({
    Action: 'ReceiveMessage',
    MaxNumberOfMessages: String(maxMessages),
    WaitTimeSeconds: String(waitTime),
    AttributeName: 'All',
  });

  const response = await fetch(queueUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`ReceiveMessage failed: ${response.status}`);
  }

  const xml = await response.text();
  const messageBlocks = xmlAll(xml, 'Message');

  return messageBlocks.map((block) => ({
    messageId: xmlValue(block, 'MessageId'),
    receiptHandle: xmlValue(block, 'ReceiptHandle'),
    body: xmlValue(block, 'Body'),
  }));
}

/** Delete a message from the queue. */
async function deleteMessage(queueUrl, receiptHandle) {
  const params = new URLSearchParams({
    Action: 'DeleteMessage',
    ReceiptHandle: receiptHandle,
  });

  const response = await fetch(queueUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    console.error(`DeleteMessage failed: ${response.status}`);
  }
}

/** Invoke a Lambda function via SAM's local invoke endpoint. */
async function invokeLambda(functionName, event) {
  const url = `${SAM_LAMBDA_ENDPOINT}/2015-03-31/functions/${functionName}/invocations`;

  console.log(`Invoking ${functionName} via ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

  const body = await response.text();

  if (!response.ok) {
    console.error(
      `Lambda invoke ${functionName} failed: ${response.status} ${body}`
    );
    throw new Error(`Lambda invoke ${functionName} failed: ${response.status}`);
  }

  if (body) {
    // Log function errors returned in the response body
    try {
      const parsed = JSON.parse(body);
      if (parsed.errorMessage) {
        console.error(
          `${functionName} returned error: ${parsed.errorMessage}`
        );
      }
    } catch {
      // not JSON, ignore
    }
  }

  console.log(`${functionName} invoke completed (${response.status})`);
  return response;
}

/** Convert SQS messages to the Lambda SQS event format. */
function toSqsEvent(messages, queueArn) {
  return {
    Records: messages.map((msg) => ({
      messageId: msg.messageId,
      receiptHandle: msg.receiptHandle,
      body: msg.body,
      attributes: {},
      messageAttributes: {},
      md5OfBody: '',
      eventSource: 'aws:sqs',
      eventSourceARN: queueArn,
      awsRegion: process.env.AWS_REGION || 'eu-west-2',
    })),
  };
}

let running = true;

function shutdown() {
  console.log('Shutting down...');
  running = false;
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/** Poll a single queue continuously until shutdown. */
async function pollQueue(mapping) {
  const { queueUrl, functionName, batchSize = 1, queueArn = '' } = mapping;
  const shortName = queueUrl.split('/').pop();

  console.log(
    `Polling ${shortName} → ${functionName} (batch=${batchSize})`
  );

  while (running) {
    try {
      const messages = await receiveMessages(queueUrl, batchSize, 5);

      if (!running || messages.length === 0) continue;

      console.log(
        `${shortName}: received ${messages.length} message(s)`
      );

      const event = toSqsEvent(messages, queueArn);
      await invokeLambda(functionName, event);

      console.log(
        `${shortName}: invoked ${functionName} successfully`
      );

      // Delete processed messages
      for (const msg of messages) {
        await deleteMessage(queueUrl, msg.receiptHandle);
      }
    } catch (error) {
      if (!running) break;
      if (error.cause?.code === 'ECONNREFUSED') {
        // Silently retry — SAM or ElasticMQ not ready yet
        await new Promise((r) => setTimeout(r, 5000));
      } else {
        console.error(`${shortName}: ERROR: ${error.message}`);
        if (error.stack) console.error(`${error.stack}`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  console.log(`Stopped polling ${shortName}`);
}

/**
 * Wait for the SAM Lambda endpoint to be ready before polling.
 * SAM takes a while to start and warm containers — invoking too early
 * causes failures that block FIFO queues for the visibility timeout duration.
 */
async function waitForSamReady() {
  const maxWait = 120_000; // 2 minutes
  const interval = 3_000;
  const start = Date.now();

  console.log(`Waiting for SAM Lambda endpoint at ${SAM_LAMBDA_ENDPOINT}...`);

  while (Date.now() - start < maxWait) {
    try {
      // SAM returns 404 for unknown functions but 200-level when the server is up
      const res = await fetch(
        `${SAM_LAMBDA_ENDPOINT}/2015-03-31/functions/`,
        { method: 'GET', signal: AbortSignal.timeout(2000) }
      );
      // Any response (even 403/404) means SAM is listening
      console.log(`SAM Lambda endpoint ready (${res.status})`);
      return true;
    } catch {
      // Not ready yet
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  console.error('SAM Lambda endpoint not ready after 2 minutes — starting anyway');
  return false;
}

export async function startSqsPoller() {
  if (mappings.length === 0) {
    console.log('No queue mappings configured — skipping');
    return;
  }

  console.log(`Starting with ${mappings.length} queue mapping(s)`);
  console.log(`SQS endpoint: ${SQS_ENDPOINT}`);
  console.log(`SAM endpoint: ${SAM_LAMBDA_ENDPOINT}`);

  await waitForSamReady();

  for (const mapping of mappings) {
    pollQueue(mapping);
  }
}
