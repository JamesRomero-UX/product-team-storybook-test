import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import ViewSelector from './ViewSelector';

describe('ViewSelector', () => {
  it('renders buttons for each view option', () => {
    type View = 'table' | 'card' | 'list';

    const viewOptions: { text: string; id: View }[] = [
      { text: 'Table', id: 'table' },
      { text: 'Card', id: 'card' },
      { text: 'List', id: 'list' },
    ];

    const { container } = render(
      <ViewSelector<View>
        selectedView={'table'}
        onSelectedViewChanged={vi.fn()}
        options={viewOptions}
      />
    );
    const segmentControl = createWrapper(container).findSegmentedControl();
    const segments = segmentControl?.findSegments();
    expect(segmentControl?.findSegments().length).toEqual(3);
    expect(segments?.at(0)?.getElement().textContent).toEqual('Table');
    expect(segments?.at(1)?.getElement().textContent).toEqual('Card');
    expect(segments?.at(2)?.getElement().textContent).toEqual('List');
  });
});
