import { dateTimeString } from './sharedSchemas';

describe('dateTimeString', () => {
  it('validates ISO date', () => {
    const result = dateTimeString.safeParse('2011-10-05T14:48:00.000Z');
    expect(result.success).toEqual(true);
    expect(result.success && result.data).toEqual('2011-10-05T14:48:00.000Z');
  });

  it('validates wrong date', () => {
    const result = dateTimeString.safeParse('wrong');
    expect(result.success).toEqual(false);
  });

  it('validates dd/mm/yyyy date', () => {
    const result = dateTimeString.safeParse('06/01/2023');
    expect(result.success).toEqual(true);
    expect(result.success && result.data).toEqual('2023-01-06T00:00:00.000Z');
  });

  it('validates dd/mm/yyyy date for BST', () => {
    const result = dateTimeString.safeParse('06/06/2023');
    expect(result.success).toEqual(true);
    // strictly speaking, '2023-06-05T23:00:00.000Z' is correct, but isn't currently handled correctly by the front end
    expect(result.success && result.data).toEqual('2023-06-06T00:00:00.000Z');
  });

  it('validates yyyy-mm-ddThh:mm:ss date', () => {
    const result = dateTimeString.safeParse('2024-03-31T00:00:00');
    expect(result.success).toEqual(true);
    expect(result.success && result.data).toEqual('2024-03-31T00:00:00.000Z');
  });

  it('validates yyyy-mm-ddThh:mm:ss for BST', () => {
    const result = dateTimeString.safeParse('2024-06-06T00:00:00');
    expect(result.success).toEqual(true);
    // strictly speaking, '2024-06-05T23:00:00.000Z' is correct, but isn't currently handled correctly by the front end
    expect(result.success && result.data).toEqual('2024-06-06T00:00:00.000Z');
  });

  it('supports nullable', () => {
    const result = dateTimeString.nullable().safeParse(null);
    expect(result.success).toEqual(true);
    expect(result.success && result.data).toEqual(null);
  });
});
