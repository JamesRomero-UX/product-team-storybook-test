import {
  latestResultValueFromData,
  previousResultValueFromData,
} from './latestResultValueFromData';

describe('latestResultValueFromData', () => {
  it('supports negative indicator results', async () => {
    const result = await latestResultValueFromData({
      orderedResults: [
        {
          ResultDate: '2024-01-01',
          TargetValueNum: -6,
        },
      ],
    });
    expect(result).toEqual('-6');
  });

  it('supports text values', async () => {
    const result = await latestResultValueFromData({
      orderedResults: [
        {
          ResultDate: '2024-01-01',
          TargetValueTxt: 'hello',
        },
      ],
    });
    expect(result).toEqual('hello');
  });
});

describe('previousResultValueFromData', () => {
  it('supports negative indicator results', async () => {
    const result = await previousResultValueFromData({
      orderedResults: [
        {
          ResultDate: '2024-01-02',
          TargetValueNum: -1,
        },
        {
          ResultDate: '2024-01-01',
          TargetValueNum: -6,
        },
      ],
    });
    expect(result).toEqual('-6');
  });

  it('supports text values', async () => {
    const result = await previousResultValueFromData({
      orderedResults: [
        {
          ResultDate: '2024-01-02',
          TargetValueTxt: 'hello2',
        },
        {
          ResultDate: '2024-01-01',
          TargetValueTxt: 'hello',
        },
      ],
    });
    expect(result).toEqual('hello');
  });
});
