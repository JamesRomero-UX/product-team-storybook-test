import i18n from '@risksmart-app/i18n/src/i18n';
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import getMyItemsWidgets from '../my-items/privateWidgets';
import { setWidgets as setMyItemsWidgets } from '../my-items/widgets';
import { privateWidgets } from '../widgetPrivate';
import { setWidgets } from '../widgets';
import DashboardViewToggle from './DashboardViewToggle';

vi.mock('@/utils/featureFlags');
vi.mock('@/hooks/useIsFeatureFlagEnabled', () => ({
  useIsFeatureFlagEnabled: () => false,
}));
vi.mock('@/hooks/useIsModuleEnabled', () => ({
  useIsModuleEnabledLazy: () => () => true,
}));

const dashboardText = i18n.t('dashboard.overall_toggle');
const myItemsText = i18n.t('dashboard.my_items_toggle');

setWidgets(privateWidgets);
setMyItemsWidgets(getMyItemsWidgets());

describe('DashboardViewToggle', () => {
  const renderToggle = () => {
    return render(<DashboardViewToggle />);
  };

  it('should render in my-items view initially', async () => {
    const screen = renderToggle();
    expect(
      screen.getByRole('button', { name: dashboardText, pressed: false })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: myItemsText, pressed: true })
    ).toBeInTheDocument();
  });

  it('should toggle between views when clicked', () => {
    const screen = renderToggle();

    // Initial state - my-items view
    expect(
      screen.getByRole('button', { name: dashboardText, pressed: false })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: myItemsText, pressed: true })
    ).toBeInTheDocument();

    // Click dashboard toggle
    const dashboardToggle = screen.getByRole('button', { name: dashboardText });
    fireEvent.click(dashboardToggle);
    expect(
      screen.getByRole('button', { name: dashboardText, pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: myItemsText, pressed: false })
    ).toBeInTheDocument();

    // Click my-items toggle
    const myItemsToggle = screen.getByRole('button', { name: myItemsText });
    fireEvent.click(myItemsToggle);
    expect(
      screen.getByRole('button', { name: dashboardText, pressed: false })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: myItemsText, pressed: true })
    ).toBeInTheDocument();
  });
});
