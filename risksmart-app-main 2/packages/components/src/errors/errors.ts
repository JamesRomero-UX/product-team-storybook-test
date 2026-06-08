export class PageNotFound extends Error {
  constructor(message = 'Page not found') {
    super(message);
  }
}

export class Forbidden extends Error {
  constructor(message = 'Access denied') {
    super(message);
  }
}
