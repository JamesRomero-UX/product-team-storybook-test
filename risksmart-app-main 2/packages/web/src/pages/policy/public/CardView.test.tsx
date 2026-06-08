import { render, screen } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';

import CardView from './CardView';

describe('CardView', () => {
  it('displays title of card', () => {
    render(
      <CardView
        items={[
          {
            Id: '',
            Title: 'Card 1',
            Version: '',
            TypeLabel: '',
            Type: 'file',
            Status: '',
            Summary: '',
            ReviewDate: '',
            ReviewDue: '',
            allOwners: [],
            ParentDocumentId: '',
            AttestationStatusLabel: '',
            AttestationStatus: 'attested',
            ModifiedAtTimestamp: '',
            departments: [],
            LastPublishedDate: '',
          },
        ]}
      />,
      { wrapper: getWrapper([], 'router') }
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });
});
