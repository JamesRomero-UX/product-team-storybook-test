import {
  filterOutDuplicateRisks,
  mergeHierarchies,
  mergeListOfHierarchies,
  reverse,
} from './hierarchy';

describe('Enterprise Risk Hierarchy utils', () => {
  describe('mergeHierarchies', () => {
    it('returns null when the inputs are null', () => {
      expect(mergeHierarchies(null, null)).toBeNull();
    });

    it('returns null when one of the inputs is null', () => {
      const node = { Id: '1', children: [], instances: [] };
      expect(mergeHierarchies(null, node)).toBeNull();
      expect(mergeHierarchies(node, null)).toBeNull();
    });

    it('returns null when the nodes do not share a common parent', () => {
      const node1 = { Id: '1', children: [], instances: [] };
      const node2 = { Id: '2', children: [], instances: [] };
      expect(mergeHierarchies(node1, node2)).toBeNull();
    });

    it('merges the nodes when they share a common parent', () => {
      const node1 = {
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '3', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      };
      const node2 = {
        Id: '1',
        children: [
          {
            Id: '4',
            children: [{ Id: '5', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      };

      const result = mergeHierarchies(node1, node2);

      expect(result).toEqual({
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '3', children: [], instances: [] }],
            instances: [],
          },
          {
            Id: '4',
            children: [{ Id: '5', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      });
    });

    it('merges the nodes when they share a common parent at different levels', () => {
      const node1 = {
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '3', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      };
      const node2 = {
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '4', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      };

      const result = mergeHierarchies(node1, node2);

      expect(result).toEqual({
        Id: '1',
        children: [
          {
            Id: '2',
            children: [
              { Id: '3', children: [], instances: [] },
              { Id: '4', children: [], instances: [] },
            ],
            instances: [],
          },
        ],
        instances: [],
      });
    });

    it('merges the nodes when they dont have the same depth', () => {
      const node1 = {
        Id: '1',
        children: [{ Id: '2', children: [], instances: [] }],
        instances: [],
      };
      const node2 = {
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '3', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      };

      const result = mergeHierarchies(node1, node2);

      expect(result).toEqual({
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '3', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      });
    });

    it('merges the nodes when they dont have the same depth and one node starts deeper', () => {
      const node1 = {
        Id: '1',
        children: [{ Id: '2', children: [], instances: [] }],
        instances: [],
      };
      const node2 = {
        Id: '2',
        children: [{ Id: '3', children: [], instances: [] }],
        instances: [],
      };

      const result = mergeHierarchies(node1, node2);

      expect(result).toEqual({
        Id: '1',
        children: [
          {
            Id: '2',
            children: [{ Id: '3', children: [], instances: [] }],
            instances: [],
          },
        ],
        instances: [],
      });
    });
  });

  describe('reverse', () => {
    it('reverses the child-parent relationship', () => {
      const node = {
        Id: '1',
        parent: {
          Id: '2',
          parent: null,
          instances: [],
        },
        instances: [],
      };

      const result = reverse(node);

      expect(result).toEqual(
        expect.objectContaining({
          Id: '2',
          children: [
            expect.objectContaining({
              Id: '1',
              children: [],
              instances: [],
            }),
          ],
          instances: [],
        })
      );
    });

    it('reverse the child-parent relationship with multiple levels', () => {
      const node = {
        Id: '1',
        parent: {
          Id: '2',
          parent: {
            Id: '3',
            parent: null,
            instances: [],
          },
          instances: [],
        },
        instances: [],
      };

      const result = reverse(node);

      expect(result).toEqual(
        expect.objectContaining({
          Id: '3',
          instances: [],
          children: [
            expect.objectContaining({
              Id: '2',
              instances: [],
              children: [
                expect.objectContaining({
                  Id: '1',
                  children: [],
                  instances: [],
                }),
              ],
            }),
          ],
        })
      );
    });
  });

  describe('mergeListOfHierarchies', () => {
    it('merges a list of hierarchies', () => {
      const hierarchies = [
        {
          Id: '1',
          children: [
            {
              Id: '2',
              children: [{ Id: '3', children: [], instances: [] }],
              instances: [],
            },
          ],
          instances: [],
        },
        {
          Id: '1',
          children: [
            {
              Id: '2',
              children: [{ Id: '4', children: [], instances: [] }],
              instances: [],
            },
          ],
          instances: [],
        },
        {
          Id: '1',
          children: [{ Id: '5', children: [], instances: [] }],
          instances: [],
        },
        {
          Id: 'a',
          children: [
            {
              Id: 'b',
              children: [{ Id: 'c', children: [], instances: [] }],
              instances: [],
            },
          ],
          instances: [],
        },
      ];

      const result = mergeListOfHierarchies(hierarchies);

      expect(result).toEqual([
        {
          Id: '1',
          children: [
            {
              Id: '2',
              children: [
                { Id: '3', children: [], instances: [] },
                { Id: '4', children: [], instances: [] },
              ],
              instances: [],
            },
            {
              Id: '5',
              children: [],
              instances: [],
            },
          ],
          instances: [],
        },
        {
          Id: 'a',
          children: [
            {
              Id: 'b',
              children: [{ Id: 'c', children: [], instances: [] }],
              instances: [],
            },
          ],
          instances: [],
        },
      ]);
    });
  });

  describe('filterOutDuplicateRisks', () => {
    it('works when inputs are empty', () => {
      const result = filterOutDuplicateRisks(
        [],
        { Id: '1', children: [], instances: [] },
        null
      );
      expect(result).toEqual([]);
    });

    it('works with one level, no instances', () => {
      const result = filterOutDuplicateRisks(
        [
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e1',
              },
            },
          },
        ],
        {
          Id: '1',
          children: [],
          instances: [],
        },
        { Id: 'e1' }
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e1',
              },
            },
          },
        ])
      );
    });

    it('works with one level, one instance', () => {
      const result = filterOutDuplicateRisks(
        [
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e1',
              },
            },
          },
        ],
        {
          Id: '1',
          children: [],
          instances: [{ EntityId: 'e1', RiskId: '1' }],
        },
        { Id: 'e1' }
      );

      expect(result).toEqual([]);
    });

    it('works with one level, instance for another entity', () => {
      const result = filterOutDuplicateRisks(
        [
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e2',
              },
            },
          },
        ],
        {
          Id: '1',
          children: [],
          instances: [{ EntityId: 'e1', RiskId: '1' }],
        },
        { Id: 'e2' }
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e2',
              },
            },
          },
        ])
      );
    });

    it('works with two levels, no instances', () => {
      const result = filterOutDuplicateRisks(
        [
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e1',
              },
            },
            childRisks: {
              data: [
                {
                  Title: 'title 2 - 1',
                  Tier: 2,
                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: '2',
                      EntityId: 'e1',
                    },
                  },
                },
                {
                  Title: 'title 2 - 2',
                  Tier: 2,
                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: '3',
                      EntityId: 'e1',
                    },
                  },
                },
              ],
            },
          },
        ],
        {
          Id: '1',
          children: [
            { Id: '2', children: [], instances: [] },
            { Id: '3', children: [], instances: [] },
          ],
          instances: [],
        },
        { Id: 'e1' }
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e1',
              },
            },
            childRisks: {
              data: [
                {
                  Title: 'title 2 - 1',
                  Tier: 2,
                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: '2',
                      EntityId: 'e1',
                    },
                  },
                },
                {
                  Title: 'title 2 - 2',
                  Tier: 2,
                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: '3',
                      EntityId: 'e1',
                    },
                  },
                },
              ],
            },
          },
        ])
      );
    });

    it('works with mutliple levels', () => {
      const result = filterOutDuplicateRisks(
        [
          {
            Title: 'title',
            Tier: 1,
            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: '1',
                EntityId: 'e1',
              },
            },
            childRisks: {
              data: [
                {
                  Title: 'title 2 - 1',
                  Tier: 2,
                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: '2',
                      EntityId: 'e1',
                    },
                  },
                  childRisks: {
                    data: [
                      {
                        Title: 'title 3 - 1',
                        Tier: 3,
                        enterpriseRiskInstance: {
                          data: {
                            EnterpriseRiskId: '3',
                            EntityId: 'e1',
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  Title: 'title 2 - 2',
                  Tier: 2,
                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: '4',
                      EntityId: 'e1',
                    },
                  },
                  childRisks: {
                    data: [
                      {
                        Title: 'title 3 - 2',
                        Tier: 3,
                        enterpriseRiskInstance: {
                          data: {
                            EnterpriseRiskId: '5',
                            EntityId: 'e1',
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        {
          Id: '1',
          children: [
            {
              Id: '2',
              children: [
                {
                  Id: '3',
                  children: [],
                  instances: [],
                },
              ],
              instances: [],
            },
            {
              Id: '4',
              children: [
                {
                  Id: '5',
                  children: [],
                  instances: [{ EntityId: 'e1', RiskId: 'r5' }],
                },
              ],
              instances: [{ EntityId: 'e1', RiskId: 'r4' }],
            },
          ],
          instances: [{ EntityId: 'e1', RiskId: 'r1' }],
        },
        { Id: 'e1' }
      );

      expect(result).toEqual([
        {
          Title: 'title 2 - 1',
          ParentRiskId: 'r1',
          Tier: 2,
          enterpriseRiskInstance: {
            data: {
              EnterpriseRiskId: '2',
              EntityId: 'e1',
            },
          },
          childRisks: {
            data: [
              {
                Title: 'title 3 - 1',
                Tier: 3,
                enterpriseRiskInstance: {
                  data: {
                    EnterpriseRiskId: '3',
                    EntityId: 'e1',
                  },
                },
              },
            ],
          },
        },
      ]);
    });
  });
});
