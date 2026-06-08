import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RiskOptionWithEntityComponent } from './RiskOptionWithEntity';
import type { RiskOptionWithEntity as RiskOptionWithEntityType } from './selectUtilsWithEntities';

// Mock useEntityPath hook to control returned paths
const getEntityPathMock = vi.fn((id: string) => `Path for ${id}`);
vi.mock('@/hooks/useEntityPath', () => ({
  useEntityPath: () => ({ getEntityPath: getEntityPathMock }),
}));

// Mock CSS module
vi.mock('./RiskOptionWithEntity.module.css', () => ({
  default: {
    optionContainer: 'option-container',
    riskTitle: 'risk-title',
    entityInfo: 'entity-info',
  },
}));

const createMockOption = (
  overrides: Partial<RiskOptionWithEntityType> = {}
): RiskOptionWithEntityType => ({
  value: 'risk-1',
  label: 'Test Risk',
  entityInfo: { entityId: 'entity-1' },
  ...overrides,
});

describe('RiskOptionWithEntityComponent', () => {
  it('renders risk title correctly', () => {
    const option = createMockOption({ label: 'Custom Risk Title' });
    render(<RiskOptionWithEntityComponent option={option} />);
    expect(screen.getByText('Custom Risk Title')).toBeInTheDocument();
  });

  it('renders entity path when entityId is present', () => {
    const option = createMockOption({ entityInfo: { entityId: 'entity-123' } });
    render(<RiskOptionWithEntityComponent option={option} />);
    expect(getEntityPathMock).toHaveBeenCalledWith('entity-123');
    expect(screen.getByText('Entity: Path for entity-123')).toBeInTheDocument();
  });

  it('does not render entity info when entityId is missing', () => {
    const option = createMockOption({ entityInfo: undefined });
    render(<RiskOptionWithEntityComponent option={option} />);
    expect(screen.queryByText(/Entity:/)).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const option = createMockOption();
    const { container } = render(
      <RiskOptionWithEntityComponent option={option} />
    );

    const optionContainer = container.querySelector('.option-container');
    const riskTitle = container.querySelector('.risk-title');
    const entityInfo = container.querySelector('.entity-info');

    expect(optionContainer).toBeInTheDocument();
    expect(riskTitle).toBeInTheDocument();
    expect(entityInfo).toBeInTheDocument();
  });
});
