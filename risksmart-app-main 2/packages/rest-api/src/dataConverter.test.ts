import { describe } from 'vitest';

import { dataToCsv } from './dataConverter';

describe('dataToCsv', () => {
  it('converts data to CSV string', () => {
    const data = [
      {
        CreatedAtTimestamp: '2025-03-04T15:56:17.546699+00:00',
        ModifiedAtTimestamp: '2025-03-04T15:56:17.546699+00:00',
        Tier: 9,
        IsCustomerSupport: true,
        IsNull: null,
        __typename: 'test',
      },
      {
        CreatedAtTimestamp: '2025-03-04T15:56:17.546699+00:00',
        ModifiedAtTimestamp: '2025-03-04T15:56:17.546699+00:00',
        Tier: 9,
        IsCustomerSupport: true,
        __typename: 'test',
      },
    ];

    const expectedResult =
      'CreatedAtTimestamp,ModifiedAtTimestamp,Tier,IsCustomerSupport,IsNull,__typename\n' +
      '2025-03-04T15:56:17.546699+00:00,2025-03-04T15:56:17.546699+00:00,9,true,,test\n' +
      '2025-03-04T15:56:17.546699+00:00,2025-03-04T15:56:17.546699+00:00,9,true,,test\n';

    const result = dataToCsv(data);

    expect(result).toBe(expectedResult);
  });

  it('escapes special characters and stringifies nested objects', () => {
    const data = [
      {
        CreatedAtTimestamp: '2025-03-04T15:56:17.546699+00:00',
        ModifiedAtTimestamp: '2025-03-04T15:56:17.546699+00:00',
        SpecialCharacters: '2025,-03,-"04T15":"56":17.54-66-99+00:00',
        CustomAttributeData: {
          '1727953153975_date': '2025-01-10T00:00:00.000Z',
          '1729763441489_text': null,
        },
        Schema: {
          required: [],
          properties: {
            '1721833318624_multiselect': {
              enum: ['a', 'b', 'd'],
              type: 'array',
              description: '',
              uniqueItems: true,
              tier: 2,
            },
          },
        },
        Tier: 9,
        IsCustomerSupport: true,
        IsNull: null,
        __typename: 'test',
      },
    ];

    const expectedResult =
      'CreatedAtTimestamp,ModifiedAtTimestamp,SpecialCharacters,CustomAttributeData,Schema,Tier,IsCustomerSupport,IsNull,__typename\n' +
      '2025-03-04T15:56:17.546699+00:00,2025-03-04T15:56:17.546699+00:00,"2025,-03,-""04T15"":""56"":17.54-66-99+00:00","{""1727953153975_date"":""2025-01-10T00:00:00.000Z"",""1729763441489_text"":null}","{""required"":[],""properties"":{""1721833318624_multiselect"":{""enum"":[""a"",""b"",""d""],""type"":""array"",""description"":"""",""uniqueItems"":true,""tier"":2}}}",9,true,,test\n';

    const result = dataToCsv(data);

    expect(result).toBe(expectedResult);
  });

  it('excludes specified columns', () => {
    const data = [
      {
        id: 1,
        name: 'Test',
        secret: null,
      },
      {
        id: 2,
        name: 'Another',
        secret: null,
      },
    ];

    const result = dataToCsv(data, ['secret']);
    const expected = 'id,name\n1,Test\n2,Another\n';

    expect(result).toBe(expected);
    expect(result).not.toContain('secret');
  });

  it('ensures all columns are included even if not in the first item', () => {
    const data = [
      { id: 1, name: 'First' },
      { id: 2, name: 'Second', extra: 'Additional field' },
      { id: 3, anotherField: 'Yet another field' },
    ];

    const result = dataToCsv(data);

    expect(result).toContain('id,name,extra,anotherField');
    expect(result).toContain('1,First,,');
    expect(result).toContain('2,Second,Additional field,');
    expect(result).toContain('3,,,Yet another field');
  });
});
