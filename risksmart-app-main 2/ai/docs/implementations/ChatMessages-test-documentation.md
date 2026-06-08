# ChatMessages Component Test Documentation

This document provides an overview of the tests implemented for the ChatMessages component.

## Overview

The ChatMessages component is responsible for displaying messages in the chat interface. It includes:

1. An empty state when no messages are present
2. A list of messages with proper formatting for user and bot messages
3. Timestamps for each message
4. A loading indicator when messages are being processed

## Test Implementation

The test file is structured to verify both the rendering and behavior of the ChatMessages component:

### Mocks

```tsx
// Mock the Cloudscape components
vi.mock('@cloudscape-design/components/space-between', () => ({
  default: ({
    children,
    size,
  }: {
    children: React.ReactNode;
    size: string;
  }) => (
    <div data-testid={'space-between'} data-size={size}>
      {children}
    </div>
  ),
}));

vi.mock('@cloudscape-design/components/spinner', () => ({
  default: () => <div data-testid={'spinner'}>{'Loading spinner'}</div>,
}));

vi.mock('@cloudscape-design/components/text-content', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={'text-content'}>{children}</div>
  ),
}));

// Mock the MarkdownMessage component
vi.mock('./MarkdownMessage', () => ({
  default: ({ content, isUser }: { content: string; isUser: boolean }) => (
    <div data-testid={'markdown-message'} data-is-user={isUser.toString()}>
      {content}
    </div>
  ),
}));
```

### Tests

1. **Empty State Test**

   - Tests that the component renders the empty state message when no messages are provided

2. **Loading State Test**

   - Tests that a loading indicator is displayed when isLoading is true

3. **Message Rendering Tests**

   - Tests that messages are properly rendered with the correct content
   - Tests that timestamps are displayed
   - Tests that user and bot messages are properly differentiated

4. **Combination Test**

   - Tests that both messages and loading indicator can be displayed simultaneously

5. **Styling Test**
   - Tests that the correct data attributes are applied to user and bot messages

## Example Test Code

```tsx
it('renders messages when provided', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Hello',
      timestamp: new Date('2023-01-01T12:00:00'),
      isUser: true,
    },
    {
      id: '2',
      content: 'Hi there!',
      timestamp: new Date('2023-01-01T12:01:00'),
      isUser: false,
    },
  ];

  render(<ChatMessages messages={mockMessages} isLoading={false} />);

  // Check that we have the right number of messages
  const markdownMessages = screen.getAllByTestId('markdown-message');
  expect(markdownMessages).toHaveLength(2);

  // Check user message
  expect(markdownMessages[0]).toHaveTextContent('Hello');
  expect(markdownMessages[0]).toHaveAttribute('data-is-user', 'true');

  // Check bot message
  expect(markdownMessages[1]).toHaveTextContent('Hi there!');
  expect(markdownMessages[1]).toHaveAttribute('data-is-user', 'false');

  // Check timestamps are rendered
  const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
  expect(timestamps).toHaveLength(2);
});
```

## Notes

1. **Component Mocking**

   - We mock all external components to focus testing on the ChatMessages component's logic
   - This includes Cloudscape components and the MarkdownMessage component

2. **Data Attribute Testing**
   - We use data attributes in our mocks to test the isUser property being passed correctly
   - This helps us verify that the component differentiates between user and bot messages

## Running the Tests

Tests can be run using:

```bash
pnpm test:unit src/components/Chat/ChatMessages.test.tsx
```

## Future Enhancements

Potential improvements to the test suite could include:

1. Testing for proper scroll behavior when messages overflow
2. Testing keyboard navigation through messages
3. Visual snapshot testing for style regression prevention
4. Testing integration with the complete Chat component
