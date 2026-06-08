import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { render } from '@testing-library/react';
import { act } from 'react';
import { AttestButton } from 'src/components/attest-button/AttestButton';
import { vi } from 'vitest';

import { defaultMocks } from '../../testing/mock-data';
import { mockedGetAttestationStatusResponse } from '../../testing/mock-data/mockedGetAttestationStatusResponse';
import { stub } from '../../testing/stub';
import { getWrapper } from '../../testing/wrapper';

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
const userMock = vi.mocked(useRisksmartUser);

describe('AttestButton', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    userMock.mockReturnValue(
      stub<Auth0ContextInterface<RisksmartUser>>({
        user: { userId: '1' } as RisksmartUser,
        isLoading: false,
      })
    );
  });

  it('Should render correctly when attestation is still pending', async () => {
    const screen = render(<AttestButton parentId={'1'} />, {
      wrapper: getWrapper(
        [
          ...defaultMocks,
          mockedGetAttestationStatusResponse(
            { ParentId: '1', UserId: '1' },
            {
              attestation_record: [
                {
                  Id: `record-1`,
                  AttestationStatus: 'pending',
                  config: { PromptText: 'Test' },
                },
              ],
            }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'features'
      ),
    });

    const button = await screen.findByText('Attest');
    expect(button).toBeInTheDocument();
  });

  it('Should render disabled when already attested', async () => {
    const screen = render(<AttestButton parentId={'1'} />, {
      wrapper: getWrapper(
        [
          ...defaultMocks,
          mockedGetAttestationStatusResponse(
            { ParentId: '1', UserId: '1' },
            {
              attestation_record: [
                {
                  Id: `record-1`,
                  AttestationStatus: 'attested',
                  config: { PromptText: 'Test' },
                },
              ],
            }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'features'
      ),
    });

    const text = await screen.findByText('Attested');
    expect(text).toBeInTheDocument();
    const button = await screen.findByRole('button');
    expect(button).toBeDisabled();
  });

  it('Should render disabled when no attestation record is found', async () => {
    const screen = render(<AttestButton parentId={'1'} />, {
      wrapper: getWrapper(
        [
          ...defaultMocks,
          mockedGetAttestationStatusResponse(
            { ParentId: '1', UserId: '1' },
            { attestation_record: [] }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'features'
      ),
    });

    const button = await screen.findByRole('button');
    expect(button).toBeDisabled();
  });

  it('Should show the modal when the button is clicked', async () => {
    const screen = render(<AttestButton parentId={'1'} />, {
      wrapper: getWrapper(
        [
          ...defaultMocks,
          mockedGetAttestationStatusResponse(
            { ParentId: '1', UserId: '1' },
            {
              attestation_record: [
                {
                  Id: `record-1`,
                  AttestationStatus: 'pending',
                  config: {
                    PromptText: 'Some Prompt Text for the Attestation',
                  },
                },
              ],
            }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'features'
      ),
    });

    const button = await screen.findByText('Attest');
    act(() => button.click());

    const modalText = await screen.findByText(
      'Some Prompt Text for the Attestation'
    );
    expect(modalText).toBeInTheDocument();
  });
});
