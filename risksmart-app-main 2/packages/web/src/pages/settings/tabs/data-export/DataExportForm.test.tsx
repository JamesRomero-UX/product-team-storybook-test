import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { getFormField, getFormFieldTestId } from 'src/testing/formHelpers';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import DataExportForm from './DataExportForm';
import { TestIds } from './types';

describe('DataExportForm', () => {
  const providers: Providers[] = [
    'i18n',
    'router',
    'graphql',
    'permission',
    'features',
    'trpc',
  ];
  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Settings]),
  ];

  it('renders initial fields', async () => {
    const { container } = render(<DataExportForm onSave={vi.fn()} />, {
      wrapper: getWrapper(mocks, ...providers),
    });

    await waitFor(
      () => screen.findByTestId(getFormFieldTestId(TestIds.Frequency)),
      {
        timeout: 5000,
      }
    );

    const frequency = getFormField(container, TestIds.Frequency);
    const startDate = getFormField(container, TestIds.StartDate);
    const endDate = getFormField(container, TestIds.EndDate);
    const storageType = getFormField(container, TestIds.StorageType);

    expect(frequency).not.toBeNull();
    expect(startDate).not.toBeNull();
    expect(endDate).not.toBeNull();
    expect(storageType).not.toBeNull();
  });

  it('renders SharePoint conditional fields', async () => {
    const { container } = render(<DataExportForm onSave={vi.fn()} />, {
      wrapper: getWrapper(mocks, ...providers),
    });

    await waitFor(
      () => screen.findByTestId(getFormFieldTestId(TestIds.Frequency)),
      {
        timeout: 5000,
      }
    );
    const entraSecretValue = getFormField(container, TestIds.EntraSecretValue);
    const entraTenantId = getFormField(container, TestIds.EntraTenantId);
    const entraClientId = getFormField(container, TestIds.EntraClientId);
    const sharePointSiteId = getFormField(container, TestIds.SharePointSiteId);
    const sharePointDriveId = getFormField(
      container,
      TestIds.SharePointDriveId
    );
    const sPFolder = getFormField(container, TestIds.SPFolder);

    expect(entraSecretValue).not.toBeNull();
    expect(entraTenantId).not.toBeNull();
    expect(entraClientId).not.toBeNull();
    expect(sharePointSiteId).not.toBeNull();
    expect(sharePointDriveId).not.toBeNull();
    expect(sPFolder).not.toBeNull();
  });
});
