// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TemplatesAPI from '../templates';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Steps extends APIResource {
  /**
   * Generates a rendered template for a given channel step in a workflow.
   *
   * @example
   * ```ts
   * const response =
   *   await client.workflows.steps.previewTemplate('step_ref', {
   *     workflow_key: 'workflow_key',
   *     environment: 'development',
   *     recipient: 'dnedry',
   *   });
   * ```
   */
  previewTemplate(
    stepRef: string,
    params: StepPreviewTemplateParams,
    options?: RequestOptions,
  ): APIPromise<StepPreviewTemplateResponse> {
    const { workflow_key, environment, ...body } = params;
    return this._client.post(path`/v1/workflows/${workflow_key}/steps/${stepRef}/preview_template`, {
      query: { environment },
      body,
      ...options,
    });
  }
}

/**
 * A response to a preview workflow template request.
 */
export interface StepPreviewTemplateResponse {
  /**
   * The content type of the preview.
   */
  content_type: 'email' | 'in_app_feed' | 'push' | 'chat' | 'sms' | 'http';

  /**
   * The result of the preview.
   */
  result: 'success' | 'error';

  /**
   * The rendered template, ready to be previewed.
   */
  template:
    | TemplatesAPI.EmailTemplate
    | TemplatesAPI.InAppFeedTemplate
    | TemplatesAPI.PushTemplate
    | TemplatesAPI.ChatTemplate
    | TemplatesAPI.SMSTemplate
    | TemplatesAPI.RequestTemplate;
}

export interface StepPreviewTemplateParams {
  /**
   * Path param: The key of the workflow.
   */
  workflow_key: string;

  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A recipient reference, used when referencing a recipient by either
   * their ID (for a user), or by a reference for an object.
   */
  recipient: string | StepPreviewTemplateParams.ObjectRecipientReference;

  /**
   * Body param: A recipient reference, used when referencing a recipient by either
   * their ID (for a user), or by a reference for an object.
   */
  actor?: string | StepPreviewTemplateParams.ObjectRecipientReference | null;

  /**
   * Body param: The data to pass to the workflow template for rendering.
   */
  data?: { [key: string]: unknown };

  /**
   * Body param: The tenant to associate the workflow with. Must not contain
   * whitespace.
   */
  tenant?: string | null;
}

export namespace StepPreviewTemplateParams {
  /**
   * An object reference.
   */
  export interface ObjectRecipientReference {
    /**
     * The ID of the object.
     */
    id: string;

    /**
     * The collection of the object.
     */
    collection: string;
  }

  /**
   * An object reference.
   */
  export interface ObjectRecipientReference {
    /**
     * The ID of the object.
     */
    id: string;

    /**
     * The collection of the object.
     */
    collection: string;
  }
}

export declare namespace Steps {
  export {
    type StepPreviewTemplateResponse as StepPreviewTemplateResponse,
    type StepPreviewTemplateParams as StepPreviewTemplateParams,
  };
}
