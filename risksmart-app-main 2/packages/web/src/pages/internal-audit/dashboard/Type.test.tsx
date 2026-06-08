import { render, screen } from '@testing-library/react';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { buildInternalAuditRegisterFields } from '../../../testing/test-data/internalAuditRegisterFields';
import type { Props } from './Type';
import Type from './Type';

describe('Type', () => {
  const defaultProps: Props = {
    type: 'internalAuditEntity',
    internalAudits: [],
    selectedId: '1',
    loading: false,
    onSelectAction: vi.fn(),
  };

  it.each([
    {
      internalAudits: [],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
      ],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          Id: '1a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA A',
          Id: '2a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA Z',
          Id: '3a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA 3',
          Id: '4a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
      ],
    },
  ])(
    'should render the title in a card for each item when internal audit type selected',
    async ({ internalAudits }) => {
      render(
        <Type
          {...defaultProps}
          internalAudits={internalAudits}
          selectedId={'BusinessArea1'}
        />,
        {
          wrapper: getWrapper(
            [
              mockedRoleAccessResponse(),
              mockedGetOrganisation(),
              mockedGetOrganisationModuleResponse(),
            ],
            'graphql',
            'router',
            'permission',
            'trpc',
            'features'
          ),
        }
      );
      await waitUntilLoaded();
      for (const internalAudit of internalAudits) {
        const title = screen.queryByText(internalAudit.Title);
        expect(title).toBeInTheDocument();
      }
      const cards = screen.queryAllByLabelText('Item selection', {
        exact: false,
      });
      expect(cards.length).toBe(internalAudits.length);
    }
  );

  it.each([
    {
      internalAudits: [],
      expectedTitles: [],
      unexpectedTitles: [],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
      ],
      expectedTitles: ['IA 1'],
      unexpectedTitles: [],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          businessArea: {
            Id: 'BusinessArea2',
            Title: 'Business Area 2',
            SequentialId: 2,
          },
        }),
      ],
      expectedTitles: [],
      unexpectedTitles: ['IA 1'],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          Id: '1a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA A',
          Id: '2a',
          businessArea: {
            Id: 'BusinessArea2',
            Title: 'Business Area 2',
            SequentialId: 2,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA Z',
          Id: '3a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA 3',
          Id: '4a',
          businessArea: {
            Id: 'BusinessArea2',
            Title: 'Business Area 2',
            SequentialId: 2,
          },
        }),
      ],
      expectedTitles: ['IA Z', 'IA 1'],
      unexpectedTitles: ['IA A', 'IA 3'],
    },
  ])(
    'internal audit mode should only render selected business area IDs',
    async ({ internalAudits, expectedTitles, unexpectedTitles }) => {
      render(
        <Type
          {...defaultProps}
          internalAudits={internalAudits}
          selectedId={'BusinessArea1'}
        />,
        {
          wrapper: getWrapper(
            [
              mockedRoleAccessResponse(),
              mockedGetOrganisation(),
              mockedGetOrganisationModuleResponse(),
            ],
            'graphql',
            'router',
            'permission',
            'trpc',
            'features'
          ),
        }
      );
      await waitUntilLoaded();
      for (const title of expectedTitles) {
        const titleLabel = screen.queryByText(title);
        expect(titleLabel).toBeInTheDocument();
      }
      for (const title of unexpectedTitles) {
        const titleLabel = screen.queryByText(title);
        expect(titleLabel).not.toBeInTheDocument();
      }
      const cards = screen.queryAllByLabelText('Item selection', {
        exact: false,
      });
      expect(cards.length).toBe(expectedTitles.length);
    }
  );

  it.each([
    {
      internalAudits: [],
      expectedTitles: [],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
      ],
      expectedTitles: ['Business Area 1'],
    },
    {
      internalAudits: [
        buildInternalAuditRegisterFields({
          Title: 'IA 1',
          Id: '1a',
          businessArea: {
            Id: 'BusinessArea1',
            Title: 'Business Area 1',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA A',
          Id: '2a',
          businessArea: {
            Id: 'BusinessArea2',
            Title: 'Business Area 2',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA Z',
          Id: '3a',
          businessArea: {
            Id: 'BusinessArea3',
            Title: 'Business Area 3',
            SequentialId: 1,
          },
        }),
        buildInternalAuditRegisterFields({
          Title: 'IA 3',
          Id: '4a',
          businessArea: {
            Id: 'BusinessArea3',
            Title: 'Business Area 3',
            SequentialId: 1,
          },
        }),
      ],
      expectedTitles: ['Business Area 1', 'Business Area 2', 'Business Area 3'],
    },
  ])(
    'should render the title in a card for each business area when business area type selected',
    async ({ internalAudits, expectedTitles }) => {
      render(
        <Type
          {...defaultProps}
          internalAudits={internalAudits}
          type={'businessArea'}
        />,
        {
          wrapper: getWrapper(
            [
              mockedRoleAccessResponse(),
              mockedGetOrganisation(),
              mockedGetOrganisationModuleResponse(),
            ],
            'graphql',
            'router',
            'permission',
            'trpc',
            'features'
          ),
        }
      );
      await waitUntilLoaded();
      for (const businessAreaTitles of expectedTitles) {
        const label = screen.queryByText(businessAreaTitles);
        expect(label).toBeInTheDocument();
      }

      const cards = screen.queryAllByLabelText('Item selection', {
        exact: false,
      });
      expect(cards.length).toBe(expectedTitles.length);
    }
  );
});
