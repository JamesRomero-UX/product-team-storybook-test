export class ChangeRequestConfirmationRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChangeRequestConfirmationRequiredError';
    this.message = message;
    Object.setPrototypeOf(
      this,
      ChangeRequestConfirmationRequiredError.prototype
    );
  }
}
