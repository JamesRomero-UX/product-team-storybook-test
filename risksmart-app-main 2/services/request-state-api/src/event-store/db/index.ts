import type { InboundRecord, OutboundRecord, Record, StateRecord } from './db';
import {
  isInboundRecord,
  isOutboundRecord,
  isStateRecord,
  newInboundRecord,
  newOutboundRecord,
  newStateRecord,
} from './db';
import type { Processor } from './processor';
import { Event } from './processor';

export interface GetOutput<T> {
  record: Record;
  item: T;
}

export interface ChangeOutput<TState, TOutputEventType> {
  seq: number;
  item: TState;
  pastOutboundEvents: Array<Event<TOutputEventType>>;
  newOutboundEvents: Array<Event<TOutputEventType>>;
}

// DB is the database access required by Facet<T>. Use EventDB.
export interface DB<TState, TInputEvents, TOutputEvents> {
  getState(id: string): Promise<StateRecord<TState> | null>;
  getRecords(
    id: string
  ): Promise<
    Array<
      | StateRecord<TState>
      | (InboundRecord & TInputEvents)
      | (OutboundRecord & TOutputEvents)
    >
  >;
  queryRecords(by: string, id: string): Promise<Array<StateRecord<TState>>>;
  putState(
    state: StateRecord<TState>,
    previousSeq: number,
    newInboundEvents: Array<InboundRecord>,
    newOutboundEvents: Array<OutboundRecord>,
    stateIndexRecord: Array<StateRecord<TState>>
  ): Promise<void>;
  queryRecordsByRange(
    rng: string,
    id: string
  ): Promise<Array<StateRecord<TState>>>;
  putIntegrationState(state: StateRecord<TState>, seq: number): Promise<void>;
}

// recordsOutput is the return type of the records method.
interface RecordsOutput<TState, TInputEvents, TOutputEvents> {
  state: StateRecord<TState> | null;
  inboundEvents: Array<InboundRecord & TInputEvents>;
  outboundEvents: Array<OutboundRecord & TOutputEvents>;
}

// StateToIndex is a function that reshapes the data to allow it to be queried in a
// different way, such as having the same state data but with a different partition key
// for querying.
type StateToIndex<TState> = (
  state: StateRecord<TState>
) => StateRecord<TState> | null;

// A Facet is a type of record stored in a DynamoDB table. It's constructed of a
// "state" record that contains a view of the up-to-date item, multiple inbound
// event records that result in a changes to the item, and outbound event records that
// are used to send messages asynchronously using DynamoDB Streams. This allows messages
// to be queued for delivery at the same time as the transaction is comitted, removing
// the risk of an item being updated, but a message not being sent (e.g. because SQS
// was temporarily unavailable).
export class Facet<TState, TInputEvents, TOutputEvents> {
  constructor(
    public name: string,
    public db: DB<TState, TInputEvents, TOutputEvents>,
    public processor: Processor<TState, TInputEvents, TOutputEvents>,
    public stateToIndices: Array<StateToIndex<TState>> = []
  ) {}
  async get(id: string): Promise<GetOutput<TState> | null> {
    const state = await this.db.getState(id);

    return state ? mapRecordToOutput(state) : null;
  }
  async query(by: string, id: string): Promise<Array<GetOutput<TState>>> {
    return (await this.db.queryRecords(by, id)).map((r) =>
      mapRecordToOutput(r)
    );
  }

  async queryByRange(
    rng: string,
    id: string
  ): Promise<Array<GetOutput<TState>>> {
    return (await this.db.queryRecordsByRange(rng, id)).map((r) =>
      mapRecordToOutput(r)
    );
  }
  async putIntegrationState(
    id: string,
    state: TState,
    seq: number
  ): Promise<void> {
    const now = new Date();
    const sr = newStateRecord(this.name, id, seq, state, now);
    const indexRecords = this.stateToIndices
      .map((sif) => sif(sr))
      .filter((result) => !!result);
    // Write the new records to the database.
    await this.db.putState(sr, seq, [], [], indexRecords);
  }
  private async records(
    id: string
  ): Promise<RecordsOutput<TState, TInputEvents, TOutputEvents>> {
    const records = await this.db.getRecords(id);
    const result = {
      inboundEvents: new Array<Record & TInputEvents>(),
      outboundEvents: new Array<OutboundRecord & TOutputEvents>(),
    } as RecordsOutput<TState, TInputEvents, TOutputEvents>;
    if (records) {
      records.forEach((r) => {
        if (isInboundRecord(r)) {
          result.inboundEvents.push(r as Record & TInputEvents);

          return;
        }
        if (isOutboundRecord(r)) {
          result.outboundEvents.push(r as OutboundRecord & TOutputEvents);

          return;
        }
        if (isStateRecord(r)) {
          result.state = r as StateRecord<TState>;
        }
      });
    }
    result.inboundEvents = sortRecords(result.inboundEvents) as Array<
      Record & TInputEvents
    >;

    return result;
  }
  // append new event(s) to an item. This method executes two database commands,
  // one to retrieve the current state value, and one to put the updated state back.
  // If your processor requires access to previous events, not just the state record,
  // then you should use the recalculate method.
  async append(
    id: string,
    ...newInboundEvents: Array<Event<TInputEvents>>
  ): Promise<ChangeOutput<TState, TOutputEvents>> {
    const stateRecord = await this.get(id);
    const state = stateRecord ? stateRecord.item : null;
    const seq = stateRecord ? stateRecord.record._seq : 0;

    return this.appendTo(id, state, seq, ...newInboundEvents);
  }
  // appendTo appends new events to an item that has already been retrieved from the
  // database. This method executes a single database command to update the state
  // record.
  async appendTo(
    id: string,
    state: TState | null,
    seq: number,
    ...newInboundEvents: Array<Event<TInputEvents>>
  ) {
    return await this.calculate(
      id,
      state,
      seq,
      new Array<InboundRecord & TInputEvents>(),
      ...newInboundEvents
    );
  }
  // recalculate all the state by reading all previous records in the facet item and
  // processing each inbound event record. This method may execute multiple Query operations
  // and a single put operation.
  async recalculate(
    id: string,
    ...newInboundEvents: Array<Event<TInputEvents>>
  ): Promise<ChangeOutput<TState, TOutputEvents>> {
    // Get the records.
    const records = await this.records(id);
    const seq = records.state ? records.state._seq : 0;

    return this.calculate(
      id,
      null,
      seq,
      records.inboundEvents,
      ...newInboundEvents
    );
  }

  private mapPastInboundRecordToEvent = (
    pastInboundEvents: Array<InboundRecord & TInputEvents>
  ): Event<TInputEvents>[] => {
    const events = pastInboundEvents.map((e) => {
      const { _id, _rng, _facet, _typ, _ts, _date, _seq, ...item } = e;

      return new Event(_typ, item);
    });

    return events as unknown as Event<TInputEvents>[];
  };

  // calculate the state.
  private async calculate(
    id: string,
    state: TState | null,
    seq: number,
    pastInboundEvents: Array<InboundRecord & TInputEvents>,
    ...newInboundEvents: Array<Event<TInputEvents>>
  ): Promise<ChangeOutput<TState, TOutputEvents>> {
    const pastEvents = this.mapPastInboundRecordToEvent(pastInboundEvents);
    const newInboundEventsSequence = newInboundEvents.map(
      (e) => new Event(e.type, e.event)
    );

    // Process the events.
    const processingResult = this.processor.process(
      state,
      pastEvents,
      newInboundEventsSequence
    );

    // Create new records.
    const now = new Date();
    const sr = newStateRecord(
      this.name,
      id,
      seq + newInboundEvents.length,
      processingResult.state,
      now
    );
    const newInboundRecords = newInboundEvents.map((e, i) =>
      newInboundRecord(this.name, id, seq + 1 + i, e.type, e.event, now)
    );
    const newOutboundRecords = processingResult.newOutboundEvents.map((e, i) =>
      newOutboundRecord(
        this.name,
        id,
        seq + newInboundEvents.length,
        i,
        e.type,
        e.event,
        now
      )
    );
    const indexRecords = this.stateToIndices
      .map((sif) => sif(sr))
      .filter((result) => !!result);

    // Write the new records to the database.
    await this.db.putState(
      sr,
      seq,
      newInboundRecords,
      newOutboundRecords,
      indexRecords
    );

    return {
      seq: sr._seq,
      item: processingResult.state,
      pastOutboundEvents: processingResult.pastOutboundEvents,
      newOutboundEvents: processingResult.newOutboundEvents,
    } as ChangeOutput<TState, TOutputEvents>;
  }
}

// sortRecords sorts event records by their sequence number ascending.
const sortRecords = (eventRecords: Array<Record>): Array<Record> =>
  eventRecords.sort((a, b) => {
    if (a._seq < b._seq) {
      return -1;
    }
    if (a._seq === b._seq) {
      return 0;
    }

    return 1;
  });

const mapRecordToOutput = <TState>(record: StateRecord<TState>) => {
  const { _id, _rng, _facet, _typ, _ts, _date, _seq, ...item } = record;

  return {
    record: {
      _id,
      _rng,
      _facet,
      _typ,
      _ts,
      _date,
      _seq,
    },
    item,
  } as unknown as GetOutput<TState>;
};
