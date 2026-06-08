import { request } from 'http';

const options = {
  timeout: 2000,
  host: 'localhost',
  port: process.env.PORT || 8080,
  path: '/healthz', // must be the same as HEALTHCHECK in Dockerfile
};

const req = request(options, (res) => {
  console.info('STATUS: ' + res.statusCode);
  process.exitCode = res.statusCode === 200 ? 0 : 1;
  process.exit();
});

req.on('error', function (err) {
  console.error('ERROR', err);
  process.exit(1);
});

req.end();
