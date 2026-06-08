import type {
  DynamoDBDocumentClient,
  GetCommandInput,
  QueryCommandInput,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

// A record is written to DynamoDB.
export interface Record {
  // Identifier of the record group.
  _id: string;
  // Event sort key.
  _rng: string;
  // Facet of the event.
  _facet: string;
  // Type of the event.
  _typ: string;
  // Timestamp of the record.
  _ts: number;
  // ISO date.
  _date: string;
  // Sequence of the record.
  _seq: number;
}

// A StateRecord represents the current state of an item.
export type StateRecord<TState> = Record & TState;
// InboundRecords represent all of the change events assocated with an item.
export type InboundRecord = Record;
// OutboundRecords are the events sent to external systems due to item changes.
export type OutboundRecord = Record;

const facetId = (facet: string, id: string) => `${facet}/${id}`;
const byIndexId = (facet: string, by: string, id: string) =>
  `${facet}/${by}/${id}`;

const newRecord = <TItem>(
  facet: string,
  id: string,
  seq: number,
  rng: string,
  type: string,
  item: TItem,
  time: Date
): Record & TItem => ({
  _facet: facet,
  _id: facetId(facet, id),
  _seq: seq,
  _rng: rng,
  _typ: type,
  _ts: time.getTime(),
  _date: time.toISOString(),
  ...item,
});

const isFacet = (facet: string, r: Record) => r._facet === facet;

// Create a new state record to represent the state of an item.
// facet: the name of the DynamoDB facet.
export const newStateRecord = <TItem>(
  facet: string,
  id: string,
  seq: number,
  item: TItem,
  time: Date
): StateRecord<TItem> => newRecord(facet, id, seq, 'STATE', facet, item, time);

export const isStateRecord = <T>(r: StateRecord<T>) => r._rng === 'STATE';

const inboundRecordRangeKey = (type: string, seq: number) =>
  `INBOUND/${type}/${seq}`;

export const newInboundRecord = <T>(
  facet: string,
  id: string,
  seq: number,
  type: string,
  item: T,
  time: Date
): InboundRecord & T =>
  newRecord(facet, id, seq, inboundRecordRangeKey(type, seq), type, item, time);

export const isInboundRecord = (r: InboundRecord) =>
  r._rng.startsWith('INBOUND');

const outboundRecordRangeKey = (type: string, seq: number, index: number) =>
  `OUTBOUND/${type}/${seq}/${index}`;

export const newOutboundRecord = <T>(
  facet: string,
  id: string,
  seq: number,
  index: number,
  type: string,
  item: T,
  time: Date
): OutboundRecord & T =>
  newRecord(
    facet,
    id,
    seq,
    outboundRecordRangeKey(type, seq, index),
    type,
    item,
    time
  );

export const isOutboundRecord = (r: OutboundRecord) =>
  r._rng.startsWith('OUTBOUND');

const createPut = (
  table: string,
  r: Record
): NonNullable<TransactWriteCommandInput['TransactItems']>[number] => ({
  Put: {
    TableName: table,
    Item: r,
    ConditionExpression: 'attribute_not_exists(#_id)',
    ExpressionAttributeNames: {
      '#_id': '_id',
    },
  },
});

const createPutState = (
  table: string,
  r: Record,
  previousSeq: number
): NonNullable<TransactWriteCommandInput['TransactItems']>[number] => ({
  Put: {
    TableName: table,
    Item: r,
    ConditionExpression: 'attribute_not_exists(#_id) OR #_seq = :_seq',
    ExpressionAttributeNames: {
      '#_id': '_id',
      '#_seq': '_seq',
    },
    ExpressionAttributeValues: {
      ':_seq': previousSeq,
    },
  },
});

const createPutIndex = (
  table: string,
  r: Record
): NonNullable<TransactWriteCommandInput['TransactItems']>[number] => ({
  Put: {
    TableName: table,
    Item: r,
  },
});

export class EventDB<TState, TInputEvents = unknown, TOutputEvents = unknown> {
  client: DynamoDBDocumentClient;
  table: string;
  facet: string;
  constructor(client: DynamoDBDocumentClient, table: string, facet: string) {
    this.client = client;
    this.table = table;
    this.facet = facet;
  }
  async getState(id: string): Promise<Record & TState> {
    const params = {
      TableName: this.table,
      Key: {
        _id: facetId(this.facet, id),
        _rng: 'STATE',
      },
      ConsistentRead: true,
    } as GetCommandInput;
    const result = await this.client.send(new GetCommand(params));

    return result.Item as Record & TState;
  }
  async putState(
    state: StateRecord<TState>,
    previousSeq: number,
    inbound: Array<InboundRecord> = [],
    outbound: Array<OutboundRecord> = [],
    stateIndexRecords: Array<StateRecord<TState>> = []
  ) {
    if (!isStateRecord(state)) {
      throw Error('putState: invalid state record');
    }
    if (!isFacet(this.facet, state)) {
      throw Error(
        `putState: state record has mismatched facet. Expected: "${this.facet}", got: "${state._facet}"`
      );
    }
    if (inbound.some((d) => !isInboundRecord(d))) {
      throw Error('putState: invalid inbound record');
    }
    if (inbound.some((d) => !isFacet(this.facet, d))) {
      throw Error('putState: invalid facet for inbound record');
    }
    if (outbound.some((e) => !isOutboundRecord(e))) {
      throw Error('putState: invalid outbound record');
    }
    if (outbound.some((e) => !isFacet(this.facet, e))) {
      throw Error('putState: invalid facet for outbound record');
    }
    const recordCount =
      stateIndexRecords?.length + outbound?.length + inbound?.length + 1;
    if (recordCount > 25) {
      throw Error(
        `putState: cannot exceed maximum DynamoDB transaction count of 25. The transaction attempted to write ${recordCount}.`
      );
    }
    const transactItems = [
      ...inbound.map((d) => createPut(this.table, d)),
      ...outbound.map((e) => createPut(this.table, e)),
      ...stateIndexRecords.map((sir) => createPutIndex(this.table, sir)),
      createPutState(this.table, state, previousSeq),
    ];
    const params = {
      TransactItems: transactItems,
    } as TransactWriteCommandInput;
    await this.client.send(new TransactWriteCommand(params));
  }
  // getRecords returns all records grouped under the ID.
  async getRecords(
    id: string
  ): Promise<
    Array<
      | StateRecord<TState>
      | (InboundRecord & TInputEvents)
      | (OutboundRecord & TOutputEvents)
    >
  > {
    const params = {
      TableName: this.table,
      KeyConditionExpression: '#_id = :_id',
      ExpressionAttributeNames: {
        '#_id': '_id',
      },
      ExpressionAttributeValues: {
        ':_id': facetId(this.facet, id),
      },
      ConsistentRead: true,
    } as QueryCommandInput;
    const result = await this.client.send(new QueryCommand(params));

    return result.Items as Array<
      | StateRecord<TState>
      | (InboundRecord & TInputEvents)
      | (OutboundRecord & TOutputEvents)
    >;
  }
  async queryRecords(
    by: string,
    id: string
  ): Promise<Array<StateRecord<TState>>> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: '#_id = :_id',
      ExpressionAttributeNames: {
        '#_id': '_id',
      },
      ExpressionAttributeValues: {
        ':_id': byIndexId(this.facet, by, id),
      },
      ConsistentRead: true,
    } as QueryCommandInput;
    const result = await this.client.send(new QueryCommand(params));

    return result.Items as Array<StateRecord<TState>>;
  }
  async queryRecordsByRange(
    rng: string,
    id: string
  ): Promise<Array<StateRecord<TState>>> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: '#_id = :_id and begins_with(#_rng, :_rng)',
      ExpressionAttributeNames: {
        '#_id': '_id',
        '#_rng': '_rng',
      },
      ExpressionAttributeValues: {
        ':_id': facetId(this.facet, id),
        ':_rng': rng,
      },
      ConsistentRead: true,
    } as QueryCommandInput;

    const result = await this.client.send(new QueryCommand(params));

    return result.Items as Array<StateRecord<TState>>;
  }

  async putIntegrationState(
    state: StateRecord<TState>,
    previousSeq: number,

    stateIndexRecords: Array<StateRecord<TState>> = []
  ) {
    if (!isStateRecord(state)) {
      throw Error('putState: invalid state record');
    }
    if (!isFacet(this.facet, state)) {
      throw Error(
        `putState: state record has mismatched facet. Expected: "${this.facet}", got: "${state._facet}"`
      );
    }

    const recordCount = stateIndexRecords?.length;
    if (recordCount > 25) {
      throw Error(
        `putState: cannot exceed maximum DynamoDB transaction count of 25. The transaction attempted to write ${recordCount}.`
      );
    }
    const transactItems = [
      ...stateIndexRecords.map((sir) => createPutIndex(this.table, sir)),
      createPutState(this.table, state, previousSeq),
    ];
    const params = {
      TransactItems: transactItems,
    } as TransactWriteCommandInput;
    await this.client.send(new TransactWriteCommand(params));
  }
}
