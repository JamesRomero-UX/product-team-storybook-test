import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellContent,
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { InternalAuditReportResultFields } from './types';

describe('Internal audit report results config', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const internalAuditReport: InternalAuditReportResultFields['internalAuditReports'][number] =
    {
      internalAuditReport: {
        Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
        Title: 'Business integrity check',
        ActualCompletionDate: '2023-07-15T16:41:58.03502+00:00',
        StartDate: '2023-07-14T08:41:58.03502+00:00',
        Status: 'notstarted',
        completedByUser: {
          FriendlyName: 'RiskManager1',
          __typename: 'user',
        },
        __typename: 'internal_audit_report',
      },
      __typename: 'internal_audit_result_parent',
    };

  const documentAssessmentResult: InternalAuditReportResultFields = {
    Id: '73bbbd32-824e-4209-9851-66a126eae39d',
    Rating: 3,
    CustomAttributeData: null,
    Rationale: null,
    TestDate: null,
    __typename: 'document_internal_audit_result',
    internalAuditReports: [internalAuditReport],
    documents: [
      {
        document: {
          Id: '0d3a9abc-dd17-4036-ab52-47d13db75128',
          Title: 'Document 1',
          __typename: 'document',
        },
        node: {
          Id: '0d3a9abc-dd17-4036-ab52-47d13db75128',
          SequentialId: 1,
          ObjectType: 'document',
          __typename: 'node',
        },
        __typename: 'internal_audit_result_parent',
      },
    ],
    files: [],
  };

  const obligationAssessmentResult: InternalAuditReportResultFields = {
    Id: '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f',
    Rating: 5,
    CustomAttributeData: null,
    Rationale: null,
    TestDate: null,
    __typename: 'obligation_internal_audit_result',
    internalAuditReports: [internalAuditReport],
    obligations: [
      {
        obligation: {
          Id: '68873565-c665-4e4d-b086-763c59da1e68',
          Title: 'Obligation 1',
          __typename: 'obligation',
        },
        node: {
          Id: '68873565-c665-4e4d-b086-763c59da1e68',
          SequentialId: 1,
          ObjectType: 'obligation',
          __typename: 'node',
        },
        __typename: 'internal_audit_result_parent',
      },
    ],
    files: [],
  };

  const riskAssessmentResult: InternalAuditReportResultFields = {
    Id: '1dcf43c7-62d8-4aff-93aa-db66c62282a4',
    Likelihood: 4,
    Impact: 2,
    Rating: 1,
    ControlType: 'Controlled',
    CustomAttributeData: null,
    Rationale: null,
    TestDate: null,
    __typename: 'risk_controlled_internal_audit_result',
    internalAuditReports: [internalAuditReport],
    risks: [
      {
        risk: {
          Id: 'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
          Title: 'Risk Title 1',
          __typename: 'risk',
        },
        node: {
          Id: 'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
          SequentialId: 1,
          ObjectType: 'risk',
          __typename: 'node',
        },
        __typename: 'internal_audit_result_parent',
      },
    ],
    files: [],
  };

  describe('useGetCollectionTableProps', () => {
    const TestHarness: FC<{
      records: InternalAuditReportResultFields[];
    }> = ({ records }) => {
      const tableProps = useGetCollectionTableProps(records, vi.fn());

      return <Table {...tableProps} />;
    };

    const testMocks = [
      ...defaultMocks,
      mockedGetAggregationResponse(),
      mockedGetUserTablePreferences('internalAuditReportResultRegister'),
    ];
    const providers: Providers[] = [
      'permission',
      'graphql',
      'trpc',
      'router',
      'features',
    ];

    it('should display 8 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(8);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Result date',
        'Title',
        'Type',
        'Assessed item',
        'Result',
        'Impact',
        'Likelihood',
        'Status',
      ]);
    });

    it('should have the option to display 13 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      openPreferencesModals(container);

      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(13);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Result date',
        'Title',
        'Type',
        'Assessed item',
        'Result',
        'Impact',
        'Likelihood',
        'Start date',
        'Completion date',
        'Completed by',
        'Rationale',
        'Status',
        'Guid',
      ]);
    });

    it('Shows hyperlinked risk name in Assessed item column for a risk assessment result', async () => {
      const { container } = render(
        <TestHarness records={[riskAssessmentResult]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Assessed item', 1)).toEqual(
        'Risk Title 1'
      );
      expect(
        getCellContent(container, 'Assessed item', 1)?.findLink()?.getElement()
          .href
      ).toEqual(
        'http://localhost:3000/risks/b2781d16-4827-4d81-a9ba-9402e0c56f7f'
      );
    });

    it('Shows "-" without hyperlink in Assessed item column for a risk assessment result when user does not have access to risk', async () => {
      const { container } = render(
        <TestHarness records={[{ ...riskAssessmentResult, risks: [] }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Assessed item', 1)).toEqual('-');
      expect(
        getCellContent(container, 'Assessed item', 1)?.findLink()
      ).toBeNull();
    });

    it('Shows hyperlinked obligation name in Assessed item column for a obligation assessment result', async () => {
      const { container } = render(
        <TestHarness records={[obligationAssessmentResult]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Assessed item', 1)).toEqual(
        'Obligation 1'
      );
      expect(
        getCellContent(container, 'Assessed item', 1)?.findLink()?.getElement()
          .href
      ).toEqual(
        'http://localhost:3000/compliance/obligation/68873565-c665-4e4d-b086-763c59da1e68'
      );
    });

    it('Shows "-" without hyperlink in Assessed item column for a obligation assessment result when user does not have access to obligation', async () => {
      const { container } = render(
        <TestHarness
          records={[{ ...obligationAssessmentResult, obligations: [] }]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Assessed item', 1)).toEqual('-');
      expect(
        getCellContent(container, 'Assessed item', 1)?.findLink()
      ).toBeNull();
    });

    it('Shows hyperlinked document name in Assessed item column for a document assessment result', async () => {
      const { container } = render(
        <TestHarness records={[documentAssessmentResult]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Assessed item', 1)).toEqual('Document 1');
      expect(
        getCellContent(container, 'Assessed item', 1)?.findLink()?.getElement()
          .href
      ).toEqual(
        'http://localhost:3000/policy/0d3a9abc-dd17-4036-ab52-47d13db75128'
      );
    });

    it('Shows "-" without hyperlink in Assessed item column for a document assessment result when user does not have access to document', async () => {
      const { container } = render(
        <TestHarness
          records={[{ ...documentAssessmentResult, documents: [] }]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Assessed item', 1)).toEqual('-');
      expect(
        getCellContent(container, 'Assessed item', 1)?.findLink()
      ).toBeNull();
    });

    it('should display the "Guid" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness
          records={[{ ...documentAssessmentResult, documents: [] }]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, 'Guid');

      expect(getCellText(container, 'Guid', 1)).toEqual(
        documentAssessmentResult.Id
      );
    });
  });
});
