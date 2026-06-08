import axios from 'axios';
import express from 'express';
import helmet from 'helmet';

import config from './config.mjs';

const app = express();

app.use(helmet());

app.use(express.json());

app.get('/healthz', function (req, res, next) {
  console.log('GET healthz OK');
  res.send('I am healthy\n');
});

const enabledOrgs = {
  // START - Default org keys for local dev
  org_Qshp7tYsxxAWwhVa: true,
  org_Wry1ylTIzMeSDBkT: true,
  org_weM43nU7Ac58JzHL: true,
  org_o2dH1p42UjGrBaYU: true,
  org_3M30tDxIkHGml9Lj: true,
  org_x1k5b5rI81SrERhj: true,
  org_CXY5CU84ik89hpme: true,
  org_xDKQuocuDTTcspRO: true,
  // END - Default org keys for local dev
};

axios.interceptors.request.use((request) => {
  console.log('Starting Request', JSON.stringify(request, null, 2));

  return request;
});

async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (
        attempt === maxRetries ||
        (error.response?.status >= 400 && error.response?.status < 500)
      ) {
        throw error;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(
        `Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms. Error: ${error.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

app.post('/events', async function (req, res, next) {
  const body = req.body;
  const orgKey = body.event?.data?.new?.OrgKey ?? body.event?.data?.old?.OrgKey;
  const sendEvents = orgKey in enabledOrgs;
  console.log(`orgKey: ${orgKey}. Processing events: ${sendEvents}`);
  if (sendEvents) {
    const server = `https://${config.restApiConfig.uri}/events`;
    const { host: _, ...headers } = req.headers;
    try {
      const { data } = await retryWithBackoff(
        () => axios.post(server, body, { headers }),
        3,
        1000
      );
      if (data.errors) {
        console.log(data.errors);
      }
      console.log(`Complete: ${data}.`);
    } catch (error) {
      console.error(`Failed to forward event to ${server} after retries:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      res
        .status(500)
        .send(`Failed to forward event to ${server}: ${error.message}`);
      return;
    }
  }
  res.send(`Accepted.`);
});

app.post('/enable-events', function (req, res, next) {
  const orgKey = req.body.orgKey;
  console.log(`ENABLE: org key: ${orgKey}`);
  if (orgKey in enabledOrgs) {
    console.log(`orgKey: ${orgKey} already enabled`);
  } else {
    console.log(`enabling: ${orgKey}`);
    enabledOrgs[orgKey] = true;
  }
  res.send(`Events enabled.`);
});

app.post('/disable-events', function (req, res, next) {
  const orgKey = req.body.orgKey;
  console.log(`DISABLE: orgKey: ${orgKey}`);
  if (orgKey in enabledOrgs) {
    delete enabledOrgs[orgKey];
  } else {
    console.log(`orgKey: ${orgKey} already disabled`);
  }
  res.send(`Events disabled.`);
});

export default app;
