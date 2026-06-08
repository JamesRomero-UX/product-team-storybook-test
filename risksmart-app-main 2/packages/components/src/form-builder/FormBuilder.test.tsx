import { act, render, renderHook, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { vi } from 'vitest';

import { getWrapper } from '../testing/wrapper';
import { FormBuilder } from './FormBuilder';
import { useFormBuilderSectionStore } from './store/useFormBuilderSectionStore';
import { useFormBuilderStore } from './store/useFormBuilderStore';

const MockedFormBuilder = ({
  mockOptions,
}: {
  mockOptions?: { isFormCustomisable?: boolean; hasEditPermission?: boolean };
}) => {
  const { isFormCustomisable, setIsFormCustomisable } = useFormBuilderStore();

  useEffect(() => {
    setIsFormCustomisable(
      mockOptions?.isFormCustomisable ?? isFormCustomisable
    );
    //   eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockOptions?.isFormCustomisable]);

  return <FormBuilder hasEditPermission={mockOptions?.hasEditPermission} />;
};

describe('FormBuilder', () => {
  const findAddSectionButton = () => screen.queryByText('Add Section');
  const findSectionTitleInputLabel = () => screen.queryByText('Section Title');

  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should not render the add section button by default', () => {
    act(() => {
      render(<MockedFormBuilder />, {
        wrapper: getWrapper('router'),
      });
    });

    expect(findAddSectionButton()).toBeNull();
  });

  it('should not render the add section button if edit permissions are false', () => {
    act(() => {
      render(<MockedFormBuilder mockOptions={{ hasEditPermission: false }} />, {
        wrapper: getWrapper('router'),
      });
    });

    expect(findAddSectionButton()).toBeNull();
  });

  it('should render the add section button when form is customisable', () => {
    act(() => {
      render(
        <MockedFormBuilder
          mockOptions={{ isFormCustomisable: true, hasEditPermission: true }}
        />,
        {
          wrapper: getWrapper('router'),
        }
      );
    });

    expect(findAddSectionButton()).toBeInTheDocument();
  });

  it(`should render a modal with an 'Add Section' form when the add section button is clicked`, async () => {
    act(() => {
      render(
        <MockedFormBuilder
          mockOptions={{ isFormCustomisable: true, hasEditPermission: true }}
        />,
        {
          wrapper: getWrapper('router'),
        }
      );
    });

    act(() => {
      findAddSectionButton()?.click();
    });

    const { result } = renderHook(() => useFormBuilderSectionStore());

    expect(result.current.isEditingSection).toBe(true);
    expect(findSectionTitleInputLabel()).toBeInTheDocument();
  });
});
