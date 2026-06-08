import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import type { HelpContent } from 'src/components/help-panel/useHelpStore';
import { useHelpStore } from 'src/components/help-panel/useHelpStore';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import HelpLink from './HelpLink';
import HelpPanel from './HelpPanel';
type SummaryHelpContentProps = {
  summaryHelpContent: HelpContent;
  translationKey: string;
};

const initialHelpStoreState = useHelpStore.getState();

const resetStores = () => {
  useHelpStore.setState(initialHelpStoreState, true);
};

describe('HelpPanel', () => {
  beforeEach(() => {
    resetStores();
  });

  const translationKeyInput = () =>
    screen.queryByLabelText<HTMLInputElement>('Translation key');

  const defaultSummaryHelpProps: SummaryHelpContentProps = {
    summaryHelpContent: [],
    translationKey: 'risks.help',
  };

  const providers: Providers[] = [
    'router',
    'graphql',
    'features',
    'notification',
    'trpc',
    'permission',
  ];

  const mocks = [
    mockedRoleAccessResponse(),
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
  ];

  const getAllFieldHelpButton = () =>
    screen.getAllByTestId('field-help-button');

  const title1 = 'Title 1';
  const content1 = 'Content 1';
  const title2 = 'Title 2';
  const content2 = 'Content 2';
  const title3 = 'Title 3';
  const content3 = 'Content 3';

  it('should display help summary', async () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey(defaultSummaryHelpProps.translationKey);
      result.current.setSummaryHelpContent([
        { title: title1, content: content1 },
      ]);
    });

    render(<HelpPanel />, { wrapper: getWrapper(mocks, ...providers) });

    expect(await screen.findByText(title1)).toBeInTheDocument();
  });

  it('should display multiple help sections', async () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey(defaultSummaryHelpProps.translationKey);
      result.current.setSummaryHelpContent([
        { title: title1, content: content1 },
        { title: title2, content: content2 },
      ]);
    });

    render(<HelpPanel />, { wrapper: getWrapper(mocks, ...providers) });

    await waitUntilLoaded();
    expect(screen.getByText(title1)).toBeInTheDocument();
    expect(screen.getByText(title2)).toBeInTheDocument();
  });

  it('should display help field', async () => {
    render(
      <>
        <HelpLink title={title1} id={title1} content={content1} />
        <HelpPanel />
      </>,
      { wrapper: getWrapper(mocks, ...providers) }
    );
    await waitUntilLoaded();
    await waitFor(() => screen.queryByText(title1));
    expect(screen.getByText(title1)).toBeInTheDocument();
  });

  it('should display multiple help fields', async () => {
    render(
      <>
        <HelpLink title={title1} id={title1} content={content1} />
        <HelpLink title={title2} id={title2} content={content2} />
        <HelpPanel />
      </>,
      { wrapper: getWrapper(mocks, ...providers) }
    );

    await waitUntilLoaded();
    await waitFor(() => screen.queryByText(title1));
    expect(screen.getByText(title1)).toBeInTheDocument();
    expect(screen.getByText(title2)).toBeInTheDocument();
  });

  it('should only show help content from clicked HelpLink', async () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey(defaultSummaryHelpProps.translationKey);
      result.current.setSummaryHelpContent([
        { title: title3, content: content3 },
      ]);
    });

    render(
      <>
        <HelpLink title={title1} id={title1} content={content1} />
        <HelpLink title={title2} id={title2} content={content2} />
        <HelpPanel />
      </>,
      { wrapper: getWrapper(mocks, ...providers) }
    );

    await waitUntilLoaded();
    const infoLinks = getAllFieldHelpButton();
    fireEvent.click(infoLinks[0]);

    expect(screen.getByText(title1)).toBeInTheDocument();
    expect(screen.queryByText(title2)).not.toBeInTheDocument();
    expect(screen.queryByText(title3)).not.toBeInTheDocument();
  });

  it('should show all help content when "Show all" clicked', async () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey(defaultSummaryHelpProps.translationKey);
      result.current.setSummaryHelpContent([
        { title: title3, content: content3 },
      ]);
    });

    render(
      <>
        <HelpLink title={title1} id={title1} content={content1} />
        <HelpLink title={title2} id={title2} content={content2} />
        <HelpPanel />
      </>,
      { wrapper: getWrapper(mocks, ...providers) }
    );

    await waitUntilLoaded();

    const infoLinks = getAllFieldHelpButton();
    fireEvent.click(infoLinks[0]);

    const showAllButton = screen.getByText('Show all');
    fireEvent.click(showAllButton);

    expect(screen.getByText(title1)).toBeInTheDocument();
    expect(screen.getByText(title2)).toBeInTheDocument();
    expect(screen.getByText(title3)).toBeInTheDocument();
  });

  it('should show a translation key input field if the user has the update:taxonomy permission', async () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey(defaultSummaryHelpProps.translationKey);
      result.current.setSummaryHelpContent([
        { title: title1, content: content1 },
      ]);
    });

    render(<HelpPanel />, {
      wrapper: getWrapper(
        [
          mockedGetOrganisation(),
          mockedGetOrganisationModuleResponse(),
          mockedRoleAccessResponse({
            role_access: [
              {
                AccessType: 'update',
                ObjectType: 'taxonomy',
                ContributorType: 'any',
              },
            ],
          }),
        ],
        ...providers
      ),
    });

    await waitUntilLoaded();
    expect(translationKeyInput()).toBeInTheDocument();
    await waitFor(() => translationKeyInput()?.value);
    expect(translationKeyInput()?.value).toEqual('risks.help');
  });

  it('should NOT show a translation key input field if the user does NOT have the update:taxonomy permission', async () => {
    const { result } = renderHook(() => useHelpStore());

    act(() => {
      result.current.setTranslationKey(defaultSummaryHelpProps.translationKey);
      result.current.setSummaryHelpContent([
        { title: title1, content: content1 },
      ]);
    });

    render(<HelpPanel />, { wrapper: getWrapper(mocks, ...providers) });

    expect(translationKeyInput()).not.toBeInTheDocument();
  });
});
