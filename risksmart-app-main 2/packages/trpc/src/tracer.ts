import tracer from 'dd-trace';

const DD_TRACER_INIT_KEY = '__RS_DD_TRACER_INIT__' as const;

type GlobalWithDdTracerInit = typeof globalThis & {
  [DD_TRACER_INIT_KEY]?: boolean;
};

const globalWithDdTracerInit = globalThis as GlobalWithDdTracerInit;

if (!globalWithDdTracerInit[DD_TRACER_INIT_KEY]) {
  tracer.init({
    logInjection: true,
    service: process.env.DD_SERVICE,
    env: process.env.DD_ENV,
    version: process.env.DD_VERSION,
  });

  globalWithDdTracerInit[DD_TRACER_INIT_KEY] = true;
}
export default tracer;
