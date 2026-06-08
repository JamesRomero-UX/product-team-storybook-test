import { Conflict } from 'http-errors';

export class ModifiedSinceLastViewError extends Conflict {
  constructor() {
    super(
      'Item has been modified since last viewed. Please refresh page and try again'
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
  public code = 'modified-since-last-view';
}
