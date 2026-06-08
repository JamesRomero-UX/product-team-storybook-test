# ChatHeader Component Test Documentation

This document provides an overview of the tests implemented for the ChatHeader component.

## Overview

The ChatHeader component is responsible for displaying the header of the chat panel. It includes:

1. The AI Chat logo (rendered via AIChatHeaderSVG)
2. Two action buttons:
   - New Chat button (Plus icon)
   - Close button (X icon)

## Test Implementation

The test file is structured to verify the rendering and behavior of the ChatHeader component:

### Mocks

```tsx
// Mock the AIChatHeaderSVG component
vi.mock('./AIChatHeaderSVG', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="chat-header-logo" className={className}>
      Header Logo
    </div>
  ),
}));

// Mock the Button component from cloudscape
vi.mock('@cloudscape-design/components/button', () => ({
  default: ({ children, onClick, iconSvg }: any) => (
    <button
      onClick={onClick}
      data-testid={
        iconSvg?.type?.name ? `button-${iconSvg.type.name}` : 'button'
      }
    >
      {children || 'Button'}
    </button>
  ),
}));

// Mock the icons
vi.mock('@untitled-ui/icons-react', () => ({
  Plus: function Plus() {
    return 'PlusIcon';
  },
  X: function X() {
    return 'XIcon';
  },
}));
```

### Tests

1. **Rendering Tests**

   - Tests that the component renders with the correct logo
   - Tests that both buttons (new chat and close) are rendered

2. **Interaction Tests**
   - Tests that clicking the new chat button calls the `onNewChat` function
   - Tests that clicking the close button calls the `onClose` function

## Example Test Code

```tsx
// Example of testing button click behavior
it('calls onNewChat when the new chat button is clicked', async () => {
  const mockOnNewChat = vi.fn();
  const mockOnClose = vi.fn();
  const user = userEvent.setup();

  render(<ChatHeader onNewChat={mockOnNewChat} onClose={mockOnClose} />);

  // Find the new chat button by testId
  const newChatButton = screen.getByTestId('button-Plus');
  await user.click(newChatButton);

  expect(mockOnNewChat).toHaveBeenCalledTimes(1);
  expect(mockOnClose).not.toHaveBeenCalled();
});
```

## Notes

1. **CSS Module Handling**

   - CSS modules generate hashed class names, so tests check for partial class name matches using `.toContain('headerLogo')` instead of `.toHaveClass('headerLogo')`

2. **Button Identification**
   - Buttons are identified using `data-testid` attributes in the mocks, which makes the tests more reliable than relying on text content or order

## Running the Tests

Tests can be run using:

```bash
pnpm test:unit src/components/Chat/ChatHeader.test.tsx
```

## Future Enhancements

Potential improvements to the test suite could include:

1. Testing keyboard accessibility for the buttons
2. Visual snapshot testing for style regression prevention
3. Integration tests with the ChatPanel component
