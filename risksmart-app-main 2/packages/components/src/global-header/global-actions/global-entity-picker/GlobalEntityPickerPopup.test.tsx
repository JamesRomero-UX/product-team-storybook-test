import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { useEntityFilter } from '../../../contexts/entityFilterContext';
import type { EntityNode } from './EntityNode';
import { GlobalEntityPickerPopup } from './GlobalEntityPickerPopup';

vi.mock('../../../contexts/entityFilterContext', () => ({
  useEntityFilter: vi.fn(),
}));

const mockSetEntityIds = vi.fn();

// 3-level hierarchy matching the RSP-5685 use case
const TREE: EntityNode[] = [
  {
    id: 'usa',
    name: 'USA',
    children: [
      {
        id: 'northeast',
        name: 'Northeast',
        children: [
          { id: 'ny', name: 'New York' },
          { id: 'nj', name: 'New Jersey' },
        ],
      },
      { id: 'tx', name: 'Texas' },
    ],
  },
  { id: 'uk', name: 'UK' },
];

const defaultProps = {
  onClose: vi.fn(),
  setSelectedEntityLabel: vi.fn(),
};

describe('GlobalEntityPickerPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useEntityFilter as unknown as Mock).mockReturnValue({
      entityIds: [],
      setEntityIds: mockSetEntityIds,
    });
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  it('always renders the Global option', () => {
    render(<GlobalEntityPickerPopup {...defaultProps} />);
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('renders only the Global button when no entity nodes provided', () => {
    render(<GlobalEntityPickerPopup {...defaultProps} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('renders top-level entity nodes from the tree', () => {
    render(
      <GlobalEntityPickerPopup {...defaultProps} entityNodes={TREE} />,
    );
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('UK')).toBeInTheDocument();
  });

  it('does not render child nodes until expanded', () => {
    render(
      <GlobalEntityPickerPopup {...defaultProps} entityNodes={TREE} />,
    );
    expect(screen.queryByText('Northeast')).not.toBeInTheDocument();
    expect(screen.queryByText('New York')).not.toBeInTheDocument();
  });

  it('reveals children when expand toggle is clicked', () => {
    render(
      <GlobalEntityPickerPopup {...defaultProps} entityNodes={TREE} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Expand USA' }));
    expect(screen.getByText('Northeast')).toBeInTheDocument();
    expect(screen.getByText('Texas')).toBeInTheDocument();
  });

  // ── Selection: Global ───────────────────────────────────────────────────────

  it('selecting Global clears entityIds and closes the popup', () => {
    const onClose = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={onClose}
        entityNodes={TREE}
        setSelectedEntityLabel={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Global'));
    expect(mockSetEntityIds).toHaveBeenCalledWith([]);
    expect(onClose).toHaveBeenCalled();
  });

  // ── Selection: leaf entity ──────────────────────────────────────────────────

  it('selecting a leaf entity sets only that entity id', () => {
    const onClose = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={onClose}
        entityNodes={TREE}
        setSelectedEntityLabel={vi.fn()}
      />,
    );
    // UK has no children — it is a leaf at the top level
    fireEvent.click(screen.getByText('UK'));
    expect(mockSetEntityIds).toHaveBeenCalledWith(['uk']);
    expect(onClose).toHaveBeenCalled();
  });

  it('selecting a deeply nested leaf sets only that entity id', () => {
    const onClose = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={onClose}
        entityNodes={TREE}
        setSelectedEntityLabel={vi.fn()}
      />,
    );
    // Expand USA → Northeast to reveal New York
    fireEvent.click(screen.getByRole('button', { name: 'Expand USA' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand Northeast' }));
    fireEvent.click(screen.getByText('New York'));
    expect(mockSetEntityIds).toHaveBeenCalledWith(['ny']);
    expect(onClose).toHaveBeenCalled();
  });

  // ── Selection: parent entity — core RSP-5685 requirement ───────────────────

  it('selecting a top-level parent entity sets it plus all descendant ids', () => {
    const onClose = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={onClose}
        entityNodes={TREE}
        setSelectedEntityLabel={vi.fn()}
      />,
    );
    // USA has: northeast (→ ny, nj) and tx — total descendants: 4
    fireEvent.click(screen.getByText('USA'));
    expect(mockSetEntityIds).toHaveBeenCalledWith([
      'usa',
      'northeast',
      'ny',
      'nj',
      'tx',
    ]);
    expect(onClose).toHaveBeenCalled();
  });

  it('selecting a mid-level parent entity sets it plus all descendant ids', () => {
    const onClose = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={onClose}
        entityNodes={TREE}
        setSelectedEntityLabel={vi.fn()}
      />,
    );
    // Expand USA to make Northeast clickable
    fireEvent.click(screen.getByRole('button', { name: 'Expand USA' }));
    // Northeast has: ny, nj
    fireEvent.click(screen.getByText('Northeast'));
    expect(mockSetEntityIds).toHaveBeenCalledWith(['northeast', 'ny', 'nj']);
    expect(onClose).toHaveBeenCalled();
  });

  // ── setSelectedEntityLabel callback ─────────────────────────────────────────

  it('calls setSelectedEntityLabel with the selected entity name', () => {
    const setLabel = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={vi.fn()}
        entityNodes={TREE}
        setSelectedEntityLabel={setLabel}
      />,
    );
    fireEvent.click(screen.getByText('UK'));
    expect(setLabel).toHaveBeenCalledWith('UK');
  });

  it('calls setSelectedEntityLabel with undefined when Global is selected', () => {
    const setLabel = vi.fn();
    render(
      <GlobalEntityPickerPopup
        onClose={vi.fn()}
        entityNodes={TREE}
        setSelectedEntityLabel={setLabel}
      />,
    );
    fireEvent.click(screen.getByText('Global'));
    expect(setLabel).toHaveBeenCalledWith(undefined);
  });

  // ── Auto-expand-to-selected ─────────────────────────────────────────────────

  it('auto-expands ancestors of the currently selected entity on open', () => {
    // ny is selected — its ancestors (usa, northeast) should be auto-expanded
    (useEntityFilter as unknown as Mock).mockReturnValue({
      entityIds: ['ny', 'nj'], // parent selection stores multiple ids; first is the "selected" node
      setEntityIds: mockSetEntityIds,
    });
    render(
      <GlobalEntityPickerPopup {...defaultProps} entityNodes={TREE} />,
    );
    // ny's ancestor path is usa → northeast → ny
    // Both usa and northeast should be expanded on initial render
    // so their children are visible without user interaction
    expect(screen.getByText('Northeast')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });
});
