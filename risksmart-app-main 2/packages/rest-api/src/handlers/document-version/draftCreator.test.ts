import type { Context, EventBridgeEvent } from 'aws-lambda';
import { expect, vi } from 'vitest';

import { DocumentVersionService } from '../../services/document-version/document-version.service';
import { getOrgFeatures } from '../../services/orgUtilities';
import { stub } from '../../testing/stub';
import type { RisksmartDetailType } from '../notifications/eventBridgeUtils';
import type { PolicyDocumentVersionReviewDueEventDetail } from '../notifications/policyDocumentVersionReviewDuePoller';
import { handler } from './draftCreator';

vi.mock('../../services/orgUtilities');
vi.mock('../../services/document-version/document-version.service');

const mockedFindById = vi.fn();
const mockedCreate = vi.fn();

type Event = EventBridgeEvent<
  RisksmartDetailType.PolicyDocumentVersionReviewDue,
  PolicyDocumentVersionReviewDueEventDetail
>;

const event = stub<Event>({
  detail: {
    data: {
      OrgKey: 'test',
      Id: 'test',
    },
    meta: {
      tenant: 'test',
    },
  },
});
const context = {} as Context;

describe('draftCreator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should not create draft if feature flag is missing', async () => {
    vi.mocked(getOrgFeatures).mockResolvedValue(['attestations']);
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findById: mockedFindById.mockResolvedValue(null),
        create: mockedCreate.mockResolvedValue(null),
      })
    );

    await handler(event, context, () => null);

    expect(getOrgFeatures).toHaveBeenCalledTimes(1);
    expect(mockedFindById).toHaveBeenCalledTimes(0);
    expect(mockedCreate).toHaveBeenCalledTimes(0);
  });

  it('should not create draft if the document version is not the most recent', async () => {
    vi.mocked(getOrgFeatures).mockResolvedValue(['policy_auto_draft']);
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findById: mockedFindById.mockResolvedValue({
          Id: '0',
          parent: {
            documentFiles: [
              {
                Id: '1',
              },
            ],
          },
        }),
        create: mockedCreate.mockResolvedValue(null),
      })
    );

    await handler(event, context, () => null);

    expect(getOrgFeatures).toHaveBeenCalledTimes(1);
    expect(mockedFindById).toHaveBeenCalledTimes(1);
    expect(mockedCreate).toHaveBeenCalledTimes(0);
  });

  it('should create draft', async () => {
    vi.mocked(getOrgFeatures).mockResolvedValue(['policy_auto_draft']);
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findById: mockedFindById.mockResolvedValue({
          Id: '1',
          parent: {
            documentFiles: [
              {
                Id: '1',
              },
            ],
          },
        }),
        create: mockedCreate.mockResolvedValue(null),
      })
    );

    await handler(event, context, () => null);

    expect(getOrgFeatures).toHaveBeenCalledTimes(1);
    expect(mockedFindById).toHaveBeenCalledTimes(1);
    expect(mockedCreate).toHaveBeenCalledTimes(1);
  });
});
