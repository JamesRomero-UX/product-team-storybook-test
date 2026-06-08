export class ObjectCreationFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ObjectCreationFailedError';
  }
}
