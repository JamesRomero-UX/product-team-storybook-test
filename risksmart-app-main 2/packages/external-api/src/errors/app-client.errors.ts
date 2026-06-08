import { BaseApplicationError } from './base.errors';

/**
 * Error thrown when organization client limit is reached.
 */
export class ClientLimitError extends BaseApplicationError {
  constructor(message = 'Max auth client credentials limit hit for org') {
    super(message, false); // Not a transient failure - don't retry
    this.name = 'ClientLimitError';
  }
}

export class AppClientAlreadyExistsError extends BaseApplicationError {
  constructor(
    message = 'Organization already has credentials registered with the same name'
  ) {
    super(message, false);
    this.name = 'AppClientAlreadyExists';
  }
}

export class AppClientNotFoundError extends BaseApplicationError {
  constructor(message = 'Client not active in Organization') {
    super(message, false);
    this.name = 'AppClientNotFound';
  }
}

export class AppClientFailedToRollbackError extends BaseApplicationError {
  constructor(
    message = 'Client operation failed and rollback was unsuccessful'
  ) {
    super(message, false);
    this.name = 'AppClientFailedToRollbackError';
  }
}

export class InvalidAppClientCredentialsError extends BaseApplicationError {
  constructor(message = 'Invalid credentials') {
    super(message, false);
    this.name = 'InvalidAppClientCredentials';
  }
}

export class InvalidAppClientScopesError extends BaseApplicationError {
  constructor(message = 'Invalid scopes requested for app client') {
    super(message, false);
    this.name = 'InvalidAppClientScopes';
  }
}
