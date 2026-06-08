import { MockedProvider } from '@apollo/client/testing';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { useState } from 'react';
import { vi, vitest } from 'vitest';

import type { TextInputWithFormFieldProps } from './TextInputWithFormField';
import { TextInputWithFormField } from './TextInputWithFormField';

describe('ControlledInput', () => {
  const defaultProps: TextInputWithFormFieldProps = {
    value: '',
    label: 'Test Input',
    onChange: vi.fn(),
  };

  const TextInputWithState: FC<TextInputWithFormFieldProps> = (
    defaultProps: TextInputWithFormFieldProps
  ) => {
    const [value, setValue] = useState<null | number | string | undefined>(
      defaultProps.value
    );

    return (
      <MockedProvider>
        <TextInputWithFormField
          {...defaultProps}
          value={value}
          onChange={(value) => setValue(value)}
        />
      </MockedProvider>
    );
  };

  describe('TextInput', () => {
    it('should render the value', () => {
      const value = 'Hello world';
      render(
        <MockedProvider>
          <TextInputWithFormField {...defaultProps} value={value} />
        </MockedProvider>
      );

      const input = screen.getByRole<HTMLInputElement>('textbox');
      expect(input.value).toEqual(value);
    });

    it('should render null as an empty string', () => {
      render(
        <MockedProvider>
          <TextInputWithFormField {...defaultProps} value={null} />
        </MockedProvider>
      );

      const input = screen.getByRole<HTMLInputElement>('textbox');
      expect(input.value).toEqual('');
    });

    it('should render undefined as an empty string', () => {
      render(
        <MockedProvider>
          <TextInputWithFormField {...defaultProps} value={undefined} />
        </MockedProvider>
      );

      const input = screen.getByRole<HTMLInputElement>('textbox');
      expect(input.value).toEqual('');
    });

    it('should render an updated value', () => {
      let value = 'Hello world';
      const { rerender } = render(
        <MockedProvider>
          <TextInputWithFormField {...defaultProps} value={value} />
        </MockedProvider>
      );

      value = 'Updated';

      rerender(
        <MockedProvider>
          <TextInputWithFormField {...defaultProps} value={value} />
        </MockedProvider>
      );

      const input = screen.getByRole<HTMLInputElement>('textbox');
      expect(input.value).toEqual(value);
    });

    describe('when type is number', () => {
      const defaultProps: TextInputWithFormFieldProps = {
        value: '',
        label: 'Test Input',
        type: 'number',
        onChange: vi.fn(),
      };

      it('should render the value', () => {
        const value = 1.23;
        render(
          <MockedProvider>
            <TextInputWithFormField
              {...defaultProps}
              value={value}
              type={'number'}
            />
          </MockedProvider>
        );

        const input = screen.getByRole<HTMLInputElement>('spinbutton');
        expect(input.value).toEqual('1.23');
      });

      it('should not call onChange if value has not changed', () => {
        const value = 1.23;
        const onChange = vitest.fn();
        render(
          <MockedProvider>
            <TextInputWithFormField
              {...defaultProps}
              value={value}
              type={'number'}
              onChange={onChange}
            />
          </MockedProvider>
        );

        expect(onChange).not.toHaveBeenCalled();
      });

      it('should call onChange if value has has changed', () => {
        const value = 1.23;
        const onChange = vitest.fn();
        const { container } = render(
          <MockedProvider>
            <TextInputWithFormField
              {...defaultProps}
              value={value}
              type={'number'}
              onChange={onChange}
            />
          </MockedProvider>
        );

        const input = createWrapper(container).findInput();
        input?.setInputValue('4.56');
        expect(onChange).toHaveBeenCalledWith(4.56);
      });

      it('should allow user to type decimal numbers', async () => {
        const value = 0;
        render(<TextInputWithState {...defaultProps} value={value} />);
        const user = userEvent.setup();

        let input = screen.getByRole<HTMLInputElement>('spinbutton');

        await user.type(input, '.1');

        input = screen.getByRole<HTMLInputElement>('spinbutton');

        expect(input.value).toEqual('0.1');
      });

      it('should render an updated value', () => {
        let value = 1.23;
        const onChange = vitest.fn();
        const { rerender } = render(
          <MockedProvider>
            <TextInputWithFormField
              {...defaultProps}
              value={value}
              onChange={onChange}
            />
          </MockedProvider>
        );

        value = 4.56;

        rerender(
          <MockedProvider>
            <TextInputWithFormField
              {...defaultProps}
              value={value}
              onChange={onChange}
            />
          </MockedProvider>
        );

        const input = screen.getByRole<HTMLInputElement>('spinbutton');
        expect(input.value).toEqual('4.56');
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});
