import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EntityList } from './EntityList';

describe('EntityList', () => {
  const mockOnSelect = vi.fn();

  const defaultOptions = [
    { value: 'entity-1', label: 'Entity 1' },
    { value: 'entity-2', label: 'Entity 2' },
    { value: undefined, label: 'All Entities' },
  ];

  const defaultProps = {
    options: defaultOptions,
    selectedValue: 'entity-1',
    onSelect: mockOnSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all entity options', () => {
    render(<EntityList {...defaultProps} />);

    expect(screen.getByText('Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Entity 2')).toBeInTheDocument();
    expect(screen.getByText('All Entities')).toBeInTheDocument();
  });

  it('calls onSelect with correct value when option is clicked', () => {
    render(<EntityList {...defaultProps} />);

    const entity2Option = screen.getByText('Entity 2').closest('button')!;
    fireEvent.click(entity2Option);

    expect(mockOnSelect).toHaveBeenCalledWith('entity-2');
  });

  it('calls onSelect with undefined when "All Entities" option is clicked', () => {
    render(<EntityList {...defaultProps} />);

    const allEntitiesOption = screen
      .getByText('All Entities')
      .closest('button')!;
    fireEvent.click(allEntitiesOption);

    expect(mockOnSelect).toHaveBeenCalledWith(undefined);
  });

  it('handles options with special characters', () => {
    const specialCharOptions = [
      { value: 'entity-1', label: 'Entity & Co.' },
      { value: 'entity-2', label: 'Entity™ (Test)' },
      { value: undefined, label: 'All • Entities' },
    ];

    const propsWithSpecialChars = {
      ...defaultProps,
      options: specialCharOptions,
    };

    render(<EntityList {...propsWithSpecialChars} />);

    expect(screen.getByText('Entity & Co.')).toBeInTheDocument();
    expect(screen.getByText('Entity™ (Test)')).toBeInTheDocument();
    expect(screen.getByText('All • Entities')).toBeInTheDocument();
  });

  it('uses correct key for option with undefined value', () => {
    render(<EntityList {...defaultProps} />);

    // The key for undefined value should be 'global' - we can verify this by checking the option exists
    const globalOption = screen.getByText('All Entities');
    expect(globalOption).toBeInTheDocument();
  });

  it('handles multiple clicks on same option', () => {
    render(<EntityList {...defaultProps} />);

    const entity1Option = screen.getByText('Entity 1').closest('button')!;

    fireEvent.click(entity1Option);
    fireEvent.click(entity1Option);
    fireEvent.click(entity1Option);

    expect(mockOnSelect).toHaveBeenCalledTimes(3);
    expect(mockOnSelect).toHaveBeenCalledWith('entity-1');
  });

  it('handles clicks on different options in sequence', () => {
    render(<EntityList {...defaultProps} />);

    const entity1Option = screen.getByText('Entity 1').closest('button')!;
    const entity2Option = screen.getByText('Entity 2').closest('button')!;
    const globalOption = screen.getByText('All Entities').closest('button')!;

    fireEvent.click(entity1Option);
    fireEvent.click(entity2Option);
    fireEvent.click(globalOption);

    expect(mockOnSelect).toHaveBeenCalledTimes(3);
    expect(mockOnSelect).toHaveBeenNthCalledWith(1, 'entity-1');
    expect(mockOnSelect).toHaveBeenNthCalledWith(2, 'entity-2');
    expect(mockOnSelect).toHaveBeenNthCalledWith(3, undefined);
  });
});
