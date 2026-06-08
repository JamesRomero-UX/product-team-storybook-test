import { getOptions } from './multiselectUtils';

describe('ControlledControlMultiSelect', () => {
  describe('getOptions', () => {
    it('returns an empty array if there are no controls', () => {
      const options = getOptions(
        {
          node: [],
          control: [],
        },
        []
      );
      expect(options.length).toEqual(0);
    });

    it('returns all controls that the user has access to (controls object exists)', () => {
      const options = getOptions(
        {
          control: [{ Id: '1', SequentialId: 1, Title: 'Title 1' }],
          node: [
            {
              Id: '1',
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
        tags: ['C-1'],
      });
    });

    it('includes controls that the user does not have access to if they are in the default values (saved)', () => {
      const options = getOptions(
        {
          control: [
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
          tags: ['C-1'],
        },
        {
          value: '2',
          label: 'C-2',
          tags: [],
        },
      ]);
    });
  });
});
