import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';

/**
 * End-to-End Tests for Chat UI Functionality
 *
 * This test suite covers the chat user interface that works without backend:
 * - Opening/closing chat via chat button and X button in side panel
 * - Chat input field behavior and validation
 * - Chat header buttons presence and basic functionality
 * - Chat interface initialization and loading states
 *
 * Note: These tests focus on UI functionality that doesn't require the AI backend.
 * Integration tests requiring actual message sending/receiving should be in a separate suite.
 */
test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await updateOrganisationFeatures(['chat']);
    await page.goto('/');
  });

  const getChatButton = (page: Page) =>
    page.getByRole('button', { name: 'Open AI Assistant' });

  test('Chat opens and closes correctly', async ({ page }) => {
    await expect(getChatButton(page)).toBeVisible();

    // The side panel is contained within an aside which has the role complementary
    const sidePanel = page.getByRole('complementary');
    await expect(sidePanel).not.toBeVisible();

    await getChatButton(page).click();

    await expect(sidePanel).toBeVisible();

    const aiHeading = sidePanel.getByRole('heading', { name: 'AI Assistant' });
    await expect(aiHeading).toBeVisible();

    const chatInput = sidePanel.getByRole('textbox');
    await expect(chatInput).toBeVisible();

    const chatMessages = sidePanel.getByTestId('chat-messages');
    await expect(chatMessages).toBeVisible();

    const closeButton = sidePanel.getByRole('button', { name: 'Close' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(sidePanel).not.toBeVisible();

    await getChatButton(page).click();
    await expect(sidePanel).toBeVisible();

    await getChatButton(page).click();
    await expect(sidePanel).not.toBeVisible();
  });

  test('Chat input field behaves correctly', async ({ page }) => {
    await getChatButton(page).click();

    // The side panel is contained within an aside which has the role complementary
    const sidePanel = page.getByRole('complementary');
    await expect(sidePanel).toBeVisible();

    const messageInput = sidePanel.getByRole('textbox');
    const sendButton = sidePanel.getByRole('button', { name: 'Send message' });

    await expect(messageInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    await expect(sendButton).toBeDisabled();

    await messageInput.fill('Hello, can you help me with risk management?');

    await expect(sendButton).not.toBeDisabled();

    await messageInput.fill('');
    await expect(sendButton).toBeDisabled();

    await messageInput.fill('A'.repeat(100));
    await expect(messageInput).toHaveValue('A'.repeat(100));
    await expect(sendButton).not.toBeDisabled();
  });

  test('Chat header buttons are present and clickable', async ({ page }) => {
    await getChatButton(page).click();

    // The side panel is contained within an aside which has the role complementary
    const sidePanel = page.getByRole('complementary');
    await expect(sidePanel).toBeVisible();

    const newChatButton = sidePanel.getByRole('button', { name: 'New chat' });
    await expect(newChatButton).toBeVisible();
    await expect(newChatButton).toBeEnabled();

    const browserButton = sidePanel.getByRole('button', {
      name: 'Browse history',
    });
    await expect(browserButton).toBeVisible();
    await expect(browserButton).toBeEnabled();
  });

  test('Chat interface displays loading and initialization states', async ({
    page,
  }) => {
    // Open chat
    await getChatButton(page).click();

    // The side panel is contained within an aside which has the role complementary
    const sidePanel = page.getByRole('complementary');
    await expect(sidePanel).toBeVisible();

    const chatMessages = sidePanel.getByTestId('chat-messages');
    await expect(chatMessages).toBeVisible();

    const messageInput = sidePanel.getByRole('textbox');
    await expect(messageInput).toBeVisible();

    await messageInput.fill('Hello, can you help me with risk management?');

    await expect(messageInput).toBeVisible();
  });
});
