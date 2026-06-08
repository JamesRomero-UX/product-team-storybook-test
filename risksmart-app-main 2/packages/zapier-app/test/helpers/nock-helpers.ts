import nock from 'nock';
import { TEST_BASE_URL } from './bundle.js';

export function nockGet(path: string, status: number, body: unknown) {
  return nock(TEST_BASE_URL).get(`/api/v1${path}`).reply(status, body);
}

export function nockPost(path: string, status: number, body: unknown) {
  return nock(TEST_BASE_URL).post(`/api/v1${path}`).reply(status, body);
}

export function nockPut(path: string, status: number, body: unknown) {
  return nock(TEST_BASE_URL).put(`/api/v1${path}`).reply(status, body);
}

export function nockDelete(path: string, status: number, body: unknown) {
  return nock(TEST_BASE_URL).delete(`/api/v1${path}`).reply(status, body);
}
