import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EntityOption } from './EntityOption';

// Mock the Check icon
vi.mock('@untitled-ui/icons-react', () => ({
  Check: ({ className }: { className?: string }) => (
    <span data-testid={'check-icon'} className={className}>
      {'✓'}
    </span>
  ),
}));

describe('EntityOption', () => {
  const mockOnSelect = vi.fn();

  const defaultProps = {
    option: { value: 'entity-1', label: 'Entity 1' },
    isSelected: false,
    onSelect: mockOnSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the option button with correct label', () => {
    render(<EntityOption {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Entity 1');
  });

  it('calls onSelect with correct value when clicked', () => {
    render(<EntityOption {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSelect).toHaveBeenCalledWith('entity-1');
  });

  it('shows check icon when selected', () => {
    const selectedProps = {
      ...defaultProps,
      isSelected: true,
    };

    render(<EntityOption {...selectedProps} />);

    const checkIcon = screen.getByTestId('check-icon');
    expect(checkIcon).toBeInTheDocument();
  });

  it('does not show check icon when not selected', () => {
    render(<EntityOption {...defaultProps} />);

    const checkIcon = screen.queryByTestId('check-icon');
    expect(checkIcon).toBeInTheDocument();
    expect(checkIcon).toHaveClass('text-transparent');
  });

  it('handles option with undefined value (All Entities)', () => {
    const allEntitiesProps = {
      ...defaultProps,
      option: { value: undefined, label: 'All Entities' },
    };

    render(<EntityOption {...allEntitiesProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('All Entities');

    fireEvent.click(button);
    expect(mockOnSelect).toHaveBeenCalledWith(undefined);
  });

  it('handles long entity labels', () => {
    const longLabelProps = {
      ...defaultProps,
      option: {
        value: 'long-entity',
        label:
          'This is a very long entity name that might wrap or be truncated depending on the UI constraints and styling applied to the component',
      },
    };

    render(<EntityOption {...longLabelProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(longLabelProps.option.label);
  });

  it('handles special characters in labels', () => {
    const specialCharProps = {
      ...defaultProps,
      option: {
        value: 'special-entity',
        label: 'Entity & Co. (Test) • Company™',
      },
    };

    render(<EntityOption {...specialCharProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Entity & Co. (Test) • Company™');
  });

  it('handles multiple rapid clicks', () => {
    render(<EntityOption {...defaultProps} />);

    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnSelect).toHaveBeenCalledTimes(3);
    expect(mockOnSelect).toHaveBeenCalledWith('entity-1');
  });

  it('maintains accessibility with proper button role', () => {
    render(<EntityOption {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });
});
