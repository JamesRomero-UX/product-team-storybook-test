export const isLocal = (stage: string) =>
  ['dev-cloud', 'staging', 'prod'].indexOf(stage) == -1;

export const isPr = (stage: string) => stage.startsWith('pr-');

export const isProd = (stage: string) => ['prod'].indexOf(stage) > -1;
