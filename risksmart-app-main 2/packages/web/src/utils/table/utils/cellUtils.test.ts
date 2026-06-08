import { toSingleCell } from './cellUtils';

describe('toSingleCell', () => {
  it('should convert an array of tags to a single string', () => {
    const tags = [{ label: 'abc' }, { label: 'def' }, { label: 'ghi' }];
    const stringOfTags = toSingleCell(tags);

    expect(stringOfTags).toEqual('abc, def, ghi');
  });
});
