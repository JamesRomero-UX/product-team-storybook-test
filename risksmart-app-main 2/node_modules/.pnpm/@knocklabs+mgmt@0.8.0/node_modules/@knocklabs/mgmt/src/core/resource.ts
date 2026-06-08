// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { KnockMgmt } from '../client';

export abstract class APIResource {
  protected _client: KnockMgmt;

  constructor(client: KnockMgmt) {
    this._client = client;
  }
}
