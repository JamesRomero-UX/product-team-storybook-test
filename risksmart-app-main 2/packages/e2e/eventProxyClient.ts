import fetch from 'cross-fetch';
import fs from 'fs';
import https from 'https';
import path from 'path';

const options = {
  // no-dd-sa
  cert: fs.readFileSync(
    path.resolve(__dirname, '../../api-stack/nginx/certs/nginx-selfsigned.crt'),
    `utf-8`
  ),
  // no-dd-sa
  key: fs.readFileSync(
    path.resolve(__dirname, '../../api-stack/nginx/certs/nginx-selfsigned.key'),
    'utf-8'
  ),
  rejectUnauthorized: false,
  keepAlive: false,
};
const sslConfiguredAgent = new https.Agent(options);

export const enableEventsForOrg = async (orgKey: string) => {
  await fetch('https://localhost/enable-events', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orgKey: orgKey }),
    // @ts-ignore
    agent: sslConfiguredAgent,
  });
};

export const disableEventsForOrg = async (orgKey: string) => {
  await fetch('https://localhost/disable-events', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orgKey: orgKey }),
    // @ts-ignore
    agent: sslConfiguredAgent,
  });
};
