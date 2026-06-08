import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { useEntityFilter } from '../../../contexts/entityFilterContext';
import type { EntityNode } from './EntityNode';
import { GlobalEntityPicker } from './GlobalEntityPicker';

vi.mock('../../../contexts/entityFilterContext', () => ({
  useEntityFilter: vi.fn(),
}));

vi.mock('../../../hooks/useClickOutside', () => ({
  useClickOutside: vi.fn().mockReturnValue({ current: null }),
}));

const mockSetEntityIds = vi.fn();

const FLAT_NODES: EntityNode[] = [
  { id: 'entity-1', name: 'Entity 1' },
  { id: 'entity-2', name: 'Entity 2' },
];

const TREE_NODES: EntityNode[] = [
  {
    id: 'usa',
    name: 'USA',
    children: [
      { id: 'ny', name: 'New York' },
      { id: 'tx', name: 'Texas' },
    ],
  },
  { id: 'uk', name: 'UK' },
];

describe('GlobalEntityPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useEntityFilter as unknown as Mock).mockReturnValue({
      entityIds: [],
      setEntityIds: mockSetEntityIds,
    });
  });

  it('renders the trigger button', () => {
    render(<GlobalEntityPicker entityNodes={FLAT_NODES} />);
    expect(screen.getByRole('button', { name: 'Select entity' })).toBeInTheDocument();
  });

  it('shows "Global" in the trigger when no entity is selected', () => {
    render(<GlobalEntityPicker entityNodes={FLAT_NODES} />);
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('opens the popup when the trigger is clicked', () => {
    render(<GlobalEntityPicker entityNodes={FLAT_NODES} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select entity' }));
    expect(screen.getByText('Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Entity 2')).toBeInTheDocument();
  });

  it('closes the popup when the trigger is clicked a second time', () => {
    render(<GlobalEntityPicker entityNodes={FLAT_NODES} />);
    const trigger = screen.getByRole('button', { name: 'Select entity' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByText('Entity 1')).not.toBeInTheDocument();
  });

  it('renders entity tree nodes inside the popup', () => {
    render(<GlobalEntityPicker entityNodes={TREE_NODES} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select entity' }));
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('UK')).toBeInTheDocument();
  });

  it('shows the selected entity label in the trigger when an entity is active', () => {
    (useEntityFilter as unknown as Mock).mockReturnValue({
      entityIds: ['uk'],
      setEntityIds: mockSetEntityIds,
    });
    render(<GlobalEntityPicker entityNodes={TREE_NODES} />);
    // The trigger should display the label of the currently selected entity
    expect(screen.getByText('UK')).toBeInTheDocument();
  });
});
