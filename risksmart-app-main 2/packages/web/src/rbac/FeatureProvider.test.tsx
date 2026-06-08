import { MockedProvider } from '@apollo/client/testing';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import {
  mockedGetOrganisation,
  mockedGetOrganisationErrorResponse,
} from 'src/testing/mock-data/mockedGetOrganisation';
import { testAuth0User } from 'src/testing/testUser';
import { vitest } from 'vitest';

import { FeaturesProvider } from './FeatureProvider';
vitest.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

const useRisksmartUserMock = vitest.mocked(useRisksmartUser);

describe('FeatureProvider', () => {
  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(testAuth0User);
  });

  it('should displaying loader when requesting organisation', () => {
    render(
      <MockedProvider
        mocks={[mockedGetOrganisation({ auth_organisation: [] })]}
      >
        <FeaturesProvider>
          <div>{'Content'}</div>
        </FeaturesProvider>
      </MockedProvider>
    );
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should displaying error when request for permissions has failed', async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={[mockedGetOrganisationErrorResponse]}>
          <FeaturesProvider>
            <div>{'Content'}</div>
          </FeaturesProvider>
        </MockedProvider>
      </MemoryRouter>
    );
    await waitUntilLoaded();
    expect(screen.getByText('Please try again later')).toBeDefined();
  });

  it('should display children after successfully getting organisation', async () => {
    render(
      <MockedProvider
        mocks={[mockedGetOrganisation({ auth_organisation: [] })]}
      >
        <FeaturesProvider>
          <div>{'Content'}</div>
        </FeaturesProvider>
      </MockedProvider>
    );
    await waitUntilLoaded();
    expect(screen.getByText('Content')).toBeDefined();
  });
});
