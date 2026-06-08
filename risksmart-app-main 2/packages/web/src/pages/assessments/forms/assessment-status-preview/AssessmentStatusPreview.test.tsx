import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render, screen } from '@testing-library/react';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { defaultFormProviders, getWrapper } from 'src/testing/wrapper';

import { mockedRoleAccessResponse } from '../../../../testing/mock-data/mockedGetRoleAccessResponse';
import AssessmentStatusPreview from './AssessmentStatusPreview';

describe('AssessmentFindingPreview', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it('does not display status when status not set"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={undefined}
        targetCompletionDate={undefined}
        status={undefined}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('Displays not started without date if no date provided"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={undefined}
        targetCompletionDate={undefined}
        status={'notstarted'}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Not started')).toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('Displays in progress without date if no date provided"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={undefined}
        targetCompletionDate={undefined}
        status={'inprogress'}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('In-progress')).toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('Displays Complete without date if no date provided"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={undefined}
        targetCompletionDate={undefined}
        status={'complete'}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
  });

  it('Displays not started with date if target completion date provided"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={'2024-07-14T00:00:00+00:00'}
        targetCompletionDate={'2024-07-10T00:00:00+00:00'}
        status={'notstarted'}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Not started')).toBeInTheDocument();
    expect(screen.queryByText('10 Jul 2024')).toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('Displays in progress with date if target completion date provided"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={'2024-07-14T00:00:00+00:00'}
        targetCompletionDate={'2024-07-10T00:00:00+00:00'}
        status={'inprogress'}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('In-progress')).toBeInTheDocument();
    expect(screen.queryByText('10 Jul 2024')).toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('Displays complete with date if target completion date provided"', async () => {
    const { container } = render(
      <AssessmentStatusPreview
        actualCompletionDate={'2024-07-14T00:00:00+00:00'}
        targetCompletionDate={'2024-07-10T00:00:00+00:00'}
        status={'complete'}
      />,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await waitUntilLoaded();
    const element = createWrapper(container).getElement();
    expect(element).toBeInTheDocument();
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).toBeInTheDocument();
    expect(screen.queryByText('14 Jul 2024')).toBeInTheDocument();
    expect(screen.queryByText('Due')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed:')).toBeInTheDocument();
  });
});
