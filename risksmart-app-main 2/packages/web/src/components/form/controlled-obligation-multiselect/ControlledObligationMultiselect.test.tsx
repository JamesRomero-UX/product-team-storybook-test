import { getOptions } from './selectUtils';

describe('ControlledObligationMultiSelect', () => {
  describe('getOptions', () => {
    it('returns an empty array if there are no obligations', () => {
      const options = getOptions(
        {
          node: [],
          obligation: [],
        },
        []
      );
      expect(options.length).toEqual(0);
    });

    it('returns all obligations that the user has access to (obligation object exists)', () => {
      const options = getOptions(
        {
          obligation: [
            {
              Id: '1',
              Title: 'Title 1',
              SequentialId: 1,
            },
          ],
          node: [
            {
              Id: '1',
              SequentialId: 1,
            },
            {
              Id: '2',
              SequentialId: 2,
            },
          ],
        },
        []
      );
      expect(options.length).toEqual(1);
      expect(options[0]).toEqual({
        value: '1',
        label: 'Title 1',
      });
    });

    it('includes obligations that the user does not have access to if they are in the default values (saved)', () => {
      const options = getOptions(
        {
          obligation: [
            {
              Id: '1',
              Title: 'Title 1',
            },
          ],
          node: [
            {
              Id: '1',
              SequentialId: 1,
            },
            {
              Id: '2',
              SequentialId: 2,
            },
          ],
        },
        [
          {
            value: '2',
          },
        ]
      );
      expect(options.length).toEqual(2);
      expect(options).toEqual([
        {
          value: '1',
          label: 'Title 1',
        },
        {
          value: '2',
          label: 'O-2',
        },
      ]);
    });
  });
});
