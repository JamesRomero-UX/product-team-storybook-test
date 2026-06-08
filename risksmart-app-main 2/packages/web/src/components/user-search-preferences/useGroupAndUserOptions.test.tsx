import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { act, renderHook } from '@testing-library/react';
import { clearPromises } from 'src/testing/clearPromises';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { buildAuth0User } from 'src/testing/testUser';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { buildUser } from '../form/controlled-group-and-user-select/userBuilder';
import { buildUserGroup } from '../form/controlled-group-and-user-select/userGroupBuilder';
import { useGroupAndUserOptions } from './useGroupAndUserOptions';

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
const useRisksmartUserMock = vi.mocked(useRisksmartUser);

describe('useGroupAndUserOptions', () => {
  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(
      buildAuth0User({ isCustomerSupport: false })
    );
  });

  it('does NOT include an empty option when addEmptyOption=false', () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse(),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );

    expect(result.current.optionItems.length).toEqual(0);
  });

  it('hasUserLocation true when user data contains at least 1 OfficeLocation set', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({
                  OfficeLocation: 'Location',
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.hasUserLocation).toEqual(true);
  });

  it('hasUserLocation false when user data contains no OfficeLocation data', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({
                  OfficeLocation: null,
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.hasUserLocation).toEqual(false);
  });

  it('hasDirectoryDepartments true when user data contains at least 1 Department set', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({
                  Department: 'ABC',
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.hasDirectoryDepartments).toEqual(true);
  });

  it('hasDirectoryDepartments false when user data contains no Department data', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({
                  Department: null,
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.hasDirectoryDepartments).toEqual(false);
  });

  it('hasJobTitle true when user data contains at least 1 JobTitle set', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({
                  JobTitle: 'ABC',
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.hasJobTitle).toEqual(true);
  });

  it('hasJobTitle false when user data contains no JobTitle data', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: false }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({
                  JobTitle: null,
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.hasJobTitle).toEqual(false);
  });

  it('includes an empty option when addEmptyOption=true', () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ addEmptyOption: true }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse(),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual({ label: '-', value: '' });
  });

  it('return a user option when users api returns a user', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(() => useGroupAndUserOptions(), {
      wrapper: getWrapper(
        [
          mockedUserGroupResponse(),
          mockedUsersResponse({
            user: [buildUser()],
          }),
          mockedUserSearchPreferencesResponses(),
        ],
        'i18n',
        'graphql'
      ),
    });

    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0].label).toEqual('Users');
    const usesOptionGroup = result.current
      .optionItems[0] as SelectProps.OptionGroup;
    expect(usesOptionGroup.options.length).toEqual(1);
    expect(usesOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        value: '123',
        label: 'john.doe',
        type: 'user',
        tags: ['-', '-'],
      })
    );
  });

  it('sets hidden=true on users that have status=archived when hideArchivedUsers=true', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(
      () => useGroupAndUserOptions({ hideArchivedUsers: true }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({ FriendlyName: 'Active', LastSeen: '2014-01-01' }),
                buildUser({ FriendlyName: 'Inactive', LastSeen: null }),
                buildUser({
                  FriendlyName: 'Archived',
                  LastSeen: '2014-01-01',
                  Status: 'archived',
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );

    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0].label).toEqual('Users');
    const usesOptionGroup = result.current
      .optionItems[0] as SelectProps.OptionGroup;
    expect(usesOptionGroup.options.length).toEqual(2);
    expect(usesOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        label: 'Active',
        hidden: false,
      })
    );
    expect(usesOptionGroup.options[1]).toEqual(
      expect.objectContaining({
        label: 'Inactive',
        hidden: false,
      })
    );

    expect(result.current.optionItems[0].label).toEqual('Users');
  });

  it('sets hidden=true on users that have not logged in (LastSeen=null) when hideInActiveUsers=true', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(
      () => useGroupAndUserOptions({ hideInActiveUsers: true }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({
              user: [
                buildUser({ FriendlyName: 'Active', LastSeen: '2014-01-01' }),
                buildUser({ FriendlyName: 'Inactive', LastSeen: null }),
                buildUser({
                  FriendlyName: 'Archived',
                  LastSeen: '2014-01-01',
                  Status: 'archived',
                }),
              ],
            }),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );

    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(2);
    expect(result.current.optionItems[0].label).toEqual('Users');
    const usesOptionGroup = result.current
      .optionItems[0] as SelectProps.OptionGroup;
    expect(usesOptionGroup.options.length).toEqual(2);
    expect(usesOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        label: 'Active',
        hidden: false,
      })
    );
    expect(usesOptionGroup.options[1]).toEqual(
      expect.objectContaining({
        label: 'Inactive',
        hidden: true,
      })
    );

    expect(result.current.optionItems[0].label).toEqual('Users');
    const archivedOptionGroup = result.current
      .optionItems[1] as SelectProps.OptionGroup;

    expect(archivedOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        label: 'Archived',
        hidden: false,
      })
    );
  });

  it('returns additional user attributes as tags', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(() => useGroupAndUserOptions(), {
      wrapper: getWrapper(
        [
          mockedUserGroupResponse(),
          mockedUsersResponse({
            user: [
              buildUser({
                Department: 'Department',
                Email: 'Email@test.com',
                RoleKey: 'Standard',
              }),
            ],
          }),
          mockedUserSearchPreferencesResponses(),
        ],
        'i18n',
        'graphql'
      ),
    });

    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0].label).toEqual('Users');
    const usesOptionGroup = result.current
      .optionItems[0] as SelectProps.OptionGroup;
    expect(usesOptionGroup.options.length).toEqual(1);
    expect(usesOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        value: '123',
        label: 'john.doe',
        type: 'user',
        tags: ['Email@test.com', 'Standard'],
      })
    );
  });

  it('returns an archived option group when some users have a status of archived', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(() => useGroupAndUserOptions(), {
      wrapper: getWrapper(
        [
          mockedUserGroupResponse(),
          mockedUsersResponse({
            user: [
              buildUser({
                FriendlyName: 'ActiveUser1',
                Status: 'active',
                Id: '1',
              }),
              buildUser({
                FriendlyName: 'ArchivedUser1',
                Status: 'archived',
                Id: '2',
              }),
            ],
          }),
          mockedUserSearchPreferencesResponses(),
        ],
        'i18n',
        'graphql'
      ),
    });

    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(2);
    expect(result.current.optionItems[0].label).toEqual('Users');
    const usesOptionGroup = result.current
      .optionItems[0] as SelectProps.OptionGroup;
    expect(usesOptionGroup.options.length).toEqual(1);
    expect(usesOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        label: 'ActiveUser1',
      })
    );

    expect(result.current.optionItems[1].label).toEqual('Archived');
    const archivedOptionGroup = result.current
      .optionItems[1] as SelectProps.OptionGroup;
    expect(archivedOptionGroup.options.length).toEqual(1);
    expect(archivedOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        label: 'ArchivedUser1',
      })
    );
  });

  it.each([
    {
      field: 'department',
      displayedAttributes: { ShowDirectoryDepartment: true },
    },
    {
      field: 'email',
      displayedAttributes: { ShowUserEmail: true },
    },
    {
      field: 'role',
      displayedAttributes: { ShowUserPlatformRole: true },
    },
    {
      field: 'location',
      displayedAttributes: { ShowUserLocation: true },
    },
    {
      field: 'jobTitle',
      displayedAttributes: { ShowUserJobTitle: true },
    },
  ])(
    'returns return $field as tag when $displayedAttributes',
    async ({ displayedAttributes, field }) => {
      // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
      console.error = vi.fn();
      const { result } = renderHook(
        () =>
          useGroupAndUserOptions({
            displayedAttributes: {
              ShowUserPlatformRole: false,
              ShowUserJobTitle: false,
              ShowDirectoryDepartment: false,
              ShowUserLocation: false,
              ShowUserEmail: false,
              ...displayedAttributes,
            },
          }),
        {
          wrapper: getWrapper(
            [
              mockedUserGroupResponse(),
              mockedUsersResponse({
                user: [
                  buildUser({
                    Department: 'department',
                    Email: 'email',
                    RoleKey: 'role',
                    OfficeLocation: 'location',
                    JobTitle: 'jobTitle',
                  }),
                ],
              }),
              mockedUserSearchPreferencesResponses(),
            ],
            'i18n',
            'graphql'
          ),
        }
      );

      await act(async () => {
        await clearPromises();
      });

      expect(result.current.optionItems.length).toEqual(1);
      expect(result.current.optionItems[0].label).toEqual('Users');
      const usesOptionGroup = result.current
        .optionItems[0] as SelectProps.OptionGroup;
      expect(usesOptionGroup.options.length).toEqual(1);
      expect(usesOptionGroup.options[0]).toEqual(
        expect.objectContaining({
          tags: [field],
        })
      );
    }
  );

  it('includes groups includeGroups=true', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(
      () => useGroupAndUserOptions({ includeGroups: true }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse({
              user_group: [buildUserGroup({ OwnerContributor: true })],
            }),
            mockedUsersResponse(),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual(
      expect.objectContaining({
        label: 'Groups',
        hidden: undefined,
      })
    );

    const groupOptionGroup = result.current
      .optionItems[0] as SelectProps.OptionGroup;
    expect(groupOptionGroup.options.length).toEqual(1);
    expect(groupOptionGroup.options[0]).toEqual(
      expect.objectContaining({
        value: 'b3d6e665-2860-456c-a499-6764230d5bf1',
        label: 'Approval team',
      })
    );
  });

  it('Sets group hidden field to true when hideGroups=true', async () => {
    // Warning: Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?
    console.error = vi.fn();
    const { result } = renderHook(
      () => useGroupAndUserOptions({ hideGroups: true, includeGroups: true }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse({
              user_group: [buildUserGroup({ OwnerContributor: true })],
            }),
            mockedUsersResponse(),
            mockedUserSearchPreferencesResponses(),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual(
      expect.objectContaining({
        label: 'Groups',
        hidden: true,
      })
    );
  });

  it('Returns recent users', async () => {
    const { result } = renderHook(() => useGroupAndUserOptions({}), {
      wrapper: getWrapper(
        [
          mockedUserGroupResponse(),
          mockedUsersResponse({ user: [buildUser({ Id: '123' })] }),
          mockedUserSearchPreferencesResponses({
            user_search_preferences: [
              {
                RecentUserIds: ['123'],
                ShowGroups: false,
                FilterByActivePlatformUsers: false,
                ShowUserPlatformRole: false,
                ShowUserJobTitle: false,
                ShowDirectoryDepartment: false,
                ShowUserLocation: false,
                ShowUserEmail: false,
                ShowArchivedUsers: false,
                ShowInheritedContributors: false,
              },
            ],
          }),
        ],
        'i18n',
        'graphql'
      ),
    });
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual(
      expect.objectContaining({
        label: 'Recents',
      })
    );
  });

  it('Does not return recent users when disableRecentUsers=true', async () => {
    const { result } = renderHook(
      () => useGroupAndUserOptions({ disableRecentUsers: true }),
      {
        wrapper: getWrapper(
          [
            mockedUserGroupResponse(),
            mockedUsersResponse({ user: [buildUser({ Id: '123' })] }),
            mockedUserSearchPreferencesResponses({
              user_search_preferences: [
                {
                  RecentUserIds: ['123'],
                  ShowGroups: false,
                  FilterByActivePlatformUsers: false,
                  ShowUserPlatformRole: false,
                  ShowUserJobTitle: false,
                  ShowDirectoryDepartment: false,
                  ShowUserLocation: false,
                  ShowUserEmail: false,
                  ShowArchivedUsers: false,
                  ShowInheritedContributors: false,
                },
              ],
            }),
          ],
          'i18n',
          'graphql'
        ),
      }
    );
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual(
      expect.objectContaining({
        label: 'Users',
      })
    );
  });

  it('Returns hidden customer support users if the logged in user is not customer support', async () => {
    useRisksmartUserMock.mockReturnValue(
      buildAuth0User({ isCustomerSupport: false })
    );
    const { result } = renderHook(() => useGroupAndUserOptions({}), {
      wrapper: getWrapper(
        [
          mockedUserGroupResponse(),
          mockedUsersResponse({
            user: [
              buildUser({ Id: 'IsCustomerSupport', IsCustomerSupport: true }),
              buildUser({
                Id: 'IsNOTCustomerSupport',
                IsCustomerSupport: false,
              }),
            ],
          }),
          mockedUserSearchPreferencesResponses(undefined),
        ],
        'i18n',
        'graphql'
      ),
    });
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual(
      expect.objectContaining({
        label: 'Users',
      })
    );

    expect(
      (result.current.optionItems[0] as SelectProps.OptionGroup).options.length
    ).toEqual(2);
    expect(
      (result.current.optionItems[0] as SelectProps.OptionGroup).options[0]
    ).toEqual(
      expect.objectContaining({
        value: 'IsCustomerSupport',
        hidden: true,
      })
    );
    expect(
      (result.current.optionItems[0] as SelectProps.OptionGroup).options[1]
    ).toEqual(
      expect.objectContaining({
        value: 'IsNOTCustomerSupport',
        hidden: false,
      })
    );
  });

  it('Returns customer support users if the logged in user is also customer support', async () => {
    useRisksmartUserMock.mockReturnValue(
      buildAuth0User({ isCustomerSupport: true })
    );
    const { result } = renderHook(() => useGroupAndUserOptions({}), {
      wrapper: getWrapper(
        [
          mockedUserGroupResponse(),
          mockedUsersResponse({
            user: [
              buildUser({ Id: 'IsCustomerSupport', IsCustomerSupport: true }),
              buildUser({
                Id: 'IsNOTCustomerSupport',
                IsCustomerSupport: false,
              }),
            ],
          }),
          mockedUserSearchPreferencesResponses(undefined),
        ],
        'i18n',
        'graphql'
      ),
    });
    await act(async () => {
      await clearPromises();
    });

    expect(result.current.optionItems.length).toEqual(1);
    expect(result.current.optionItems[0]).toEqual(
      expect.objectContaining({
        label: 'Users',
      })
    );
    expect(
      (result.current.optionItems[0] as SelectProps.OptionGroup).options.length
    ).toEqual(2);
    expect(
      (result.current.optionItems[0] as SelectProps.OptionGroup).options[0]
    ).toEqual(
      expect.objectContaining({
        value: 'IsCustomerSupport',
        hidden: false,
      })
    );
    expect(
      (result.current.optionItems[0] as SelectProps.OptionGroup).options[1]
    ).toEqual(
      expect.objectContaining({
        value: 'IsNOTCustomerSupport',
        hidden: false,
      })
    );
  });
});
