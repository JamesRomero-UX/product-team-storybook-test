// Type isn't strictly correct, as each value can be string or undefined.
// Should change this once we are correctly asserting the values in code.
export type SessionVariables = { [k: string]: string } | null;

type EventDetail<Record> = {
  session_variables: SessionVariables;
  trace_context: null;
} & (
  | {
      data: {
        new: null;
        old: Record;
      };
      op: 'DELETE';
    }
  | {
      data: {
        new: Record;
        old: null;
      };
      op: 'INSERT';
    }
  | {
      data: {
        new: Record;
        old: Record;
      };
      op: 'UPDATE';
    }
);

export interface DataChangeEvent<Record, TableName extends string> {
  created_at: string;
  delivery_info: {
    current_retry: number;
    max_retries: number;
  };
  event: EventDetail<Record>;
  id: string;
  table: {
    name: TableName;
    schema: string;
  };
  trigger: {
    name: string;
  };
}
