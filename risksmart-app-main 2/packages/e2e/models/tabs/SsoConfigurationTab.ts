import { expect, type Locator, type Page } from '@playwright/test';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { Tab } from './Tab';

export class SsoConfigurationTab extends Tab {
  readonly oktaProviderCard: Locator;
  readonly azureProviderCard: Locator;
  readonly googleProviderCard: Locator;
  readonly adProviderCard: Locator;

  readonly connectionNameInput: Locator;
  readonly clientIdInput: Locator;
  readonly clientSecretInput: Locator;
  readonly ldapDomainInput: Locator;
  readonly identityProviderDomainsInput: Locator;

  readonly saveButton: Locator;
  readonly enableSsoToggle: Locator;

  constructor(page: Page) {
    super(page, 'sso');

    const wrapper = createWrapper();

    // Provider buttons
    this.oktaProviderCard = page.getByRole('button', { name: /Okta/ });
    this.azureProviderCard = page.getByRole('button', { name: /Azure AD/ });
    this.googleProviderCard = page.getByRole('button', {
      name: /Google Workspace/,
    });
    this.adProviderCard = page.getByRole('button', {
      name: /LDAP/,
    });

    // Form fields
    this.connectionNameInput = page.getByLabel('Connection Name');
    this.clientIdInput = page.getByLabel('Client ID');
    this.clientSecretInput = page.getByLabel('Client Secret');
    this.ldapDomainInput = page.getByLabel('LDAP Domain');
    this.identityProviderDomainsInput = page.getByLabel(
      'Identity Provider Domains'
    );

    // Action buttons
    this.saveButton = page.getByRole('button', { name: 'Save' });

    // Enable SSO toggle - find the Cloudscape toggle's native input
    this.enableSsoToggle = page.locator(
      wrapper.findToggle().findNativeInput().toSelector()
    );
  }

  async navigateTo() {
    await this.page.goto('/settings/sso');
    await expect(this.title).toHaveText('SSO Configuration');
  }

  async fillLdapForm(opts: {
    name?: string;
    domain?: string;
    clientId?: string;
    clientSecret?: string;
  }) {
    if (opts.name) {
      await this.connectionNameInput.fill(opts.name);
    }
    if (opts.domain) {
      await this.ldapDomainInput.fill(opts.domain);
    }
    if (opts.clientId) {
      await this.clientIdInput.fill(opts.clientId);
    }
    if (opts.clientSecret) {
      await this.clientSecretInput.fill(opts.clientSecret);
    }
  }
}
