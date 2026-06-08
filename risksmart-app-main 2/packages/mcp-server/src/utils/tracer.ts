import tracer from 'dd-trace';

tracer.init({
  logInjection: false, // Manual mixin in logger.ts handles trace ID injection
  service: process.env.DD_SERVICE,
  env: process.env.DD_ENV,
  version: process.env.DD_VERSION,
});

export default tracer;
