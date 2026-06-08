---
name: add-request-state-event-type
description: Register a new event type (success + failure pair) in the request state API so async request tracking can process it. Use when a new domain event needs to flow through EventBridge into the request state machine.
argument-hint: <SuccessEventName> <FailureEventName>
allowed-tools: Read, Grep, Edit, Write
---

## Required Inputs

- **successEventName** -- The success event name (PascalCase),
  e.g. `ObjectUpdated`
- **failureEventName** -- The failure event name (PascalCase),
  e.g. `ObjectUpdateFailed`

Both names must correspond to existing members of the
`EventType` enum in the events package.

## Input Validation

1. Confirm **successEventName** and **failureEventName** are
   both provided and non-empty. If either is missing, STOP
   and request both a success and failure event name.
2. Read `packages/events/src/types/common.ts` and verify
   both **successEventName** and **failureEventName** appear
   as members of the `EventType` enum. If either is missing,
   STOP and tell the user which enum entry is absent and that
   it must be added first.

## Steps

### 1. Add events to EVENT_ROUTING

Read
`services/request-state-api/src/handlers/events/request-handler.ts`
and study the `EVENT_ROUTING` object. It contains a
`createEventProcessorMappings` call whose array lists every
event type routed to `processUpdateAsyncRequestEvent`.

Add `EventType.{successEventName}` and
`EventType.{failureEventName}` to that array, keeping the
entries in alphabetical order by enum member name, consistent
with the existing style. Do NOT add a new
`createEventProcessorMappings` block -- append to the
existing one.

Reference file:
`services/request-state-api/src/handlers/events/request-handler.ts`

### 2. Add failure-to-success mapping in the update rule

Read
`services/request-state-api/src/event-store/rules/update-async-request.rule.ts`.

Locate the `FAILURE_TO_SUCCESS_MAP` record inside
`findTasksForFailureEvent`. Add a new entry mapping
`[EventType.{failureEventName}]` to
`EventType.{successEventName}`, keeping alphabetical order
by key.

Then locate the `FAILURE_EVENT_TYPES` Set near the bottom
of the file. Add `EventType.{failureEventName}` to the set,
maintaining alphabetical order.

Reference file:
`services/request-state-api/src/event-store/rules/update-async-request.rule.ts`

### 3. Verify event type definitions exist

Read `packages/events/src/types/orguser-events.ts`. Confirm
that:

- A TypeScript type (or Zod-inferred type) exists for the
  success event using `EventType.{successEventName}`.
- A TypeScript type exists for the failure event using
  `EventType.{failureEventName}`.
- Both types are included in the `OrgUserEventTypes` union.

If any of these are missing, inform the user that the event
type definitions must be added to
`packages/events/src/types/orguser-events.ts` before the
request state integration is complete. Do NOT add them
yourself -- that is a separate task with its own patterns
(Zod schemas, data shapes, etc.).

## Verification

After completing all steps, confirm each of the following.
Fix any that fail before reporting completion.

1. `EventType.{successEventName}` and
   `EventType.{failureEventName}` both appear in the
   `EVENT_ROUTING` array in
   `services/request-state-api/src/handlers/events/request-handler.ts`.
2. `FAILURE_TO_SUCCESS_MAP` in
   `services/request-state-api/src/event-store/rules/update-async-request.rule.ts`
   contains an entry mapping `EventType.{failureEventName}`
   to `EventType.{successEventName}`.
3. `FAILURE_EVENT_TYPES` in the same rule file contains
   `EventType.{failureEventName}`.
4. Entries in all three locations are in alphabetical order
   consistent with surrounding entries.
5. No duplicate entries were introduced in any of the three
   locations.
