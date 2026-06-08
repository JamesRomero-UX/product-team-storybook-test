import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import AttestationCards from 'src/components/attestations-cards';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { AttestationFlatField } from '../types';
import { useGetCollectionCardProps } from './config';

describe('Attestation config', () => {
  const defaultAttestation: AttestationFlatField = {
    Active: false,
    CreatedAtTimestamp: '',
    ModifiedAtTimestamp: '',
    AttestationStatus: Attestation_Record_Status_Enum.Attested,
    UserId: '',
    NodeId: '',
    Id: '',
    user: {
      __typename: undefined,
      Id: '',
      FriendlyName: undefined,
      Email: undefined,
    },
    node: {
      __typename: undefined,
      documentFile: {
        Id: '',
        Version: '',
        parent: {
          Id: '',
          Title: 'Need for speed',
          ownerGroups: [{ UserGroupId: '' }],
          owners: [{ UserId: '' }],
        },
      },
    },
  };

  const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));

  beforeEach(() => {
    window.localStorage.clear();
    vi.setSystemTime(mockDate);
  });
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const mocks = [
    ...defaultMocks,
    mockedGetUserTablePreferences('attestationsByUserRegister'),
  ];

  describe('useGetCollectionCardProps', () => {
    const TestHarness: FC<{ records: AttestationFlatField[] }> = ({
      records,
    }) => {
      const collectionProps = useGetCollectionCardProps(records);

      return (
        <AttestationCards
          pagination={collectionProps.pagination}
          items={collectionProps.items}
          empty={collectionProps.empty}
          filter={collectionProps.filter}
          preferences={collectionProps.preferenceDetails.preferences}
          setPreferences={collectionProps.preferenceDetails.setPreferences}
        />
      );
    };

    it('should display 2 card sections and a card title by default', async () => {
      const { container } = render(
        <TestHarness records={[defaultAttestation]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(createWrapper(container).findCards()).toBeTruthy()
      );

      const sections = createWrapper(container)
        .findCards()
        ?.findItems()[0]
        .findSections();

      const header = createWrapper(container)
        .findCards()
        ?.findItems()[0]
        .findCardHeader();

      expect(sections?.length).toBe(2);
      expect(header?.getElement().textContent).toBe('Need for speedAttested');
    });

    it('should have the option to display 2 card sections', async () => {
      const { container } = render(
        <TestHarness records={[defaultAttestation]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(createWrapper(container).findCards()).toBeTruthy()
      );

      const preferences = createWrapper(container)
        .findCards()
        ?.findCollectionPreferences();

      preferences?.findTriggerButton().click();

      const options = preferences
        ?.findModal()
        ?.findVisibleContentPreference()
        ?.findOptions();

      expect(options?.length).toEqual(2);

      const optionsText = options?.map(
        (option) => option.getElement().textContent
      );

      expect(optionsText).toEqual(['Summary', 'Owners']);
    });

    it('should display the correct card data', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultAttestation,
              user: {
                FriendlyName: 'User 1 name',
                Id: '123',
              },
              CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
              ExpiresAt: '2023-01-15T12:41:58.03502+00:00',
              ModifiedAtTimestamp: '2023-01-15T12:41:58.03502+00:00',
              AttestationStatus: Attestation_Record_Status_Enum.Pending,
              Active: true,
              AttestedAt: '2023-01-17T18:41:58.03502+00:00',
              node: {
                documentFile: {
                  Id: '345',
                  Version: '2.2',
                  parent: {
                    Title: 'The Lord of the Rings',
                    Id: '568',
                    ownerGroups: [{ UserGroupId: '' }],
                    owners: [{ UserId: '', user: { FriendlyName: 'Aragon' } }],
                  },
                },
              },
            },
          ]}
        />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(createWrapper(container).findCards()).toBeTruthy()
      );

      const sections = createWrapper(container)
        .findCards()!
        .findItems()[0]
        .findSections();

      const header = createWrapper(container)
        .findCards()!
        .findItems()[0]
        .findCardHeader();

      expect(sections[0].getElement().textContent).toEqual(
        'Updated on: 15 Jan 2023Version: 2.2'
      );
      expect(sections[1].getElement().textContent).toEqual('Aragon');
      expect(header?.getElement().textContent).toBe(
        'The Lord of the RingsPending'
      );
    });
  });
  describe('export', () => {
    it('should export in correct format', async () => {
      const { result } = renderHook(
        () =>
          useGetCollectionCardProps([
            {
              ...defaultAttestation,
              user: {
                FriendlyName: 'User 1 name',
                Id: '123',
              },
              CreatedAtTimestamp: '2023-01-15T17:41:58.03502+00:00',
              ModifiedAtTimestamp: '2023-01-17T13:41:58.03502+00:00',
              ExpiresAt: '2024-01-15T12:41:58.03502+00:00',
              AttestationStatus: Attestation_Record_Status_Enum.Pending,
              Active: true,
              AttestedAt: '2023-01-17T18:41:58.03502+00:00',
              node: {
                documentFile: {
                  Id: '345',
                  Version: '2.2',
                  parent: {
                    Title: 'The Lord of the Rings',
                    Id: '568',
                    ownerGroups: [{ UserGroupId: '' }],
                    owners: [
                      { UserId: '', user: { FriendlyName: 'Frodo' } },
                      { UserId: '', user: { FriendlyName: 'Samwise' } },
                    ],
                  },
                },
              },
            },
          ]),
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitFor(() => {
        expect(result.current.exportToCsvString).toBeDefined();
      });

      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"Document","Version","Attestation status","Owners","Updated On"\r\n' +
          '"The Lord of the Rings","2.2","pending","Frodo,Samwise,","17/01/2023 13:41"'
      );
    });
  });
});
