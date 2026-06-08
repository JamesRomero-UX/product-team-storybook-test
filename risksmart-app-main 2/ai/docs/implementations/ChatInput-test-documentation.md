# ChatInput Component Test Documentation

This document provides an overview of the tests implemented for the ChatInput component.

## Overview

The ChatInput component is responsible for handling user input in the chat interface. It includes:

1. A text input field for entering messages
2. A send button to submit messages
3. Support for keyboard shortcuts (Enter to send, Shift+Enter for new line)
4. Loading state handling

## Test Implementation

The test file is structured to verify both the rendering and behavior of the ChatInput component:

### Mocks

```tsx
// Mock the StyledInput component
vi.mock('./StyledInput', () => ({
  default: ({
    value,
    onChange,
    onKeyDown,
    onSend,
    placeholder,
    disabled,
    isLoading,
  }) => (
    <div data-testid={'styled-input-container'}>
      <input
        data-testid={'styled-input'}
        type={'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        data-testid={'send-button'}
        onClick={onSend}
        disabled={disabled}
        type={'button'}
      >
        {'Send'}
      </button>
    </div>
  ),
}));
```

### Tests

1. **Rendering Tests**

   - Tests that the component renders with the correct props
   - Tests that the input is disabled when in loading state

2. **Interaction Tests**
   - Tests that the onChange callback is called when the input value changes
   - Tests that the onSend callback is called when the send button is clicked
   - Tests that the onSend callback is called when the Enter key is pressed
   - Tests that the onSend callback is NOT called when Shift+Enter is pressed
   - Tests the behavior when the input is empty

## Example Test Code

```tsx
// Example of testing Enter key behavior
it('calls onSend when Enter key is pressed', async () => {
  const mockOnChange = vi.fn();
  const mockOnSend = vi.fn();
  const user = userEvent.setup();

  render(
    <ChatInput
      value={'Hello'}
      onChange={mockOnChange}
      onSend={mockOnSend}
      isLoading={false}
    />
  );

  const inputElement = screen.getByTestId('styled-input');
  await user.click(inputElement);
  await user.keyboard('{Enter}');

  expect(mockOnSend).toHaveBeenCalledTimes(1);
});
```

## Notes

1. **StyledInput Mocking**

   - We mock the StyledInput component to simplify testing and focus on the ChatInput's behavior
   - The mock includes all the necessary props and functionality to test the parent component

2. **Keyboard Interaction**
   - Special attention is given to testing keyboard shortcuts, which are important for usability
   - We test both Enter (should send) and Shift+Enter (should not send) behaviors

## Running the Tests

Tests can be run using:

```bash
pnpm test:unit src/components/Chat/ChatInput.test.tsx
```

## Future Enhancements

Potential improvements to the test suite could include:

1. Testing focus management (ensuring focus is maintained after sending a message)
2. Testing additional keyboard shortcuts
3. Visual snapshot testing for style regression prevention
4. Testing integration with parent components
