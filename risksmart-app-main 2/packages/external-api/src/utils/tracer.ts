import tracer from 'dd-trace';

tracer.init({
  logInjection: true, // critical for log-trace correlation
  service: process.env.DD_SERVICE,
  env: process.env.DD_ENV,
  version: process.env.DD_VERSION,
});

export default tracer;
