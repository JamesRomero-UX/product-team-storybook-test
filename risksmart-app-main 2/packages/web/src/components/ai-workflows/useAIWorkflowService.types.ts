export interface AIWorkflowJobResult<T> {
  jobId: string;
  result: null | T;
  error: null | string;
  location: string;
  streamLocation: string;
  runId: string | null;
}
