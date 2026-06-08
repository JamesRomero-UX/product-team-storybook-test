// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as MessageTypesAPI from './message-types';
import { APIPromise } from '../core/api-promise';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class MessageTypes extends APIResource {
  /**
   * Retrieve a message type by its key, in a given environment.
   *
   * @example
   * ```ts
   * const messageType = await client.messageTypes.retrieve(
   *   'email',
   *   { environment: 'development' },
   * );
   * ```
   */
  retrieve(
    messageTypeKey: string,
    query: MessageTypeRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<MessageType> {
    return this._client.get(path`/v1/message_types/${messageTypeKey}`, { query, ...options });
  }

  /**
   * Returns a paginated list of message types available in a given environment.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const messageType of client.messageTypes.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(
    query: MessageTypeListParams,
    options?: RequestOptions,
  ): PagePromise<MessageTypesEntriesCursor, MessageType> {
    return this._client.getAPIList('/v1/message_types', EntriesCursor<MessageType>, { query, ...options });
  }

  /**
   * Updates a message type, or creates a new one if it does not yet exist.
   *
   * Note: this endpoint only operates in the `development` environment.
   *
   * @example
   * ```ts
   * const response = await client.messageTypes.upsert('email', {
   *   environment: 'development',
   *   message_type: {
   *     description: 'This is a message type',
   *     name: 'My Message Type',
   *     preview: '<div>Hello, world!</div>',
   *   },
   * });
   * ```
   */
  upsert(
    messageTypeKey: string,
    params: MessageTypeUpsertParams,
    options?: RequestOptions,
  ): APIPromise<MessageTypeUpsertResponse> {
    const { environment, annotate, commit, commit_message, ...body } = params;
    return this._client.put(path`/v1/message_types/${messageTypeKey}`, {
      query: { environment, annotate, commit, commit_message },
      body,
      ...options,
    });
  }

  /**
   * Validates a message type payload without persisting it.
   *
   * Note: this endpoint only operates on message types in the `development`
   * environment.
   *
   * @example
   * ```ts
   * const response = await client.messageTypes.validate(
   *   'email',
   *   {
   *     environment: 'development',
   *     message_type: {
   *       description: 'This is a message type',
   *       name: 'My Message Type',
   *       preview: '<div>Hello, world!</div>',
   *     },
   *   },
   * );
   * ```
   */
  validate(
    messageTypeKey: string,
    params: MessageTypeValidateParams,
    options?: RequestOptions,
  ): APIPromise<MessageTypeValidateResponse> {
    const { environment, ...body } = params;
    return this._client.put(path`/v1/message_types/${messageTypeKey}/validate`, {
      query: { environment },
      body,
      ...options,
    });
  }
}

export type MessageTypesEntriesCursor = EntriesCursor<MessageType>;

/**
 * A message type is a schema for a message that maps to a UI component or element
 * within your application.
 */
export interface MessageType {
  /**
   * The timestamp of when the message type was created.
   */
  created_at: string;

  /**
   * The environment of the message type.
   */
  environment: string;

  /**
   * The unique key string for the message type object. Must be at minimum 3
   * characters and at maximum 255 characters in length. Must be in the format of
   * ^[a-z0-9_-]+$.
   */
  key: string;

  /**
   * A name for the message type. Must be at maximum 255 characters in length.
   */
  name: string;

  /**
   * The owner of the message type.
   */
  owner: 'system' | 'user';

  /**
   * An HTML/liquid template for the message type preview.
   */
  preview: string;

  /**
   * The semantic version of the message type.
   */
  semver: string;

  /**
   * The SHA hash of the message type.
   */
  sha: string;

  /**
   * The timestamp of when the message type was last updated.
   */
  updated_at: string;

  /**
   * Whether the message type is valid.
   */
  valid: boolean;

  /**
   * The variants of the message type.
   */
  variants: Array<MessageTypeVariant>;

  /**
   * The timestamp of when the message type was deleted.
   */
  archived_at?: string | null;

  /**
   * The timestamp of when the message type was deleted.
   */
  deleted_at?: string | null;

  /**
   * An arbitrary string attached to a message type object. Useful for adding notes
   * about the message type for internal purposes. Maximum of 280 characters allowed.
   */
  description?: string | null;

  /**
   * The icon name of the message type.
   */
  icon_name?: string;
}

/**
 * A text field used in a message type.
 */
export interface MessageTypeTextField {
  /**
   * The unique key of the field.
   */
  key: string;

  /**
   * The label of the field.
   */
  label: string | null;

  /**
   * The type of the field.
   */
  type: 'text';

  /**
   * Settings for the text field.
   */
  settings?: MessageTypeTextField.Settings;
}

export namespace MessageTypeTextField {
  /**
   * Settings for the text field.
   */
  export interface Settings {
    /**
     * The default value of the text field.
     */
    default?: string | null;

    description?: string;

    max_length?: number;

    min_length?: number;

    /**
     * Whether the field is required.
     */
    required?: boolean;
  }
}

/**
 * A variant of a message type.
 */
export interface MessageTypeVariant {
  /**
   * The field types available for the variant.
   */
  fields: Array<
    | MessageTypeVariant.MessageTypeBooleanField
    | MessageTypeVariant.MessageTypeButtonField
    | MessageTypeVariant.MessageTypeImageField
    | MessageTypeVariant.MessageTypeMarkdownField
    | MessageTypeVariant.MessageTypeMultiSelectField
    | MessageTypeVariant.MessageTypeSelectField
    | MessageTypeTextField
    | MessageTypeVariant.MessageTypeTextareaField
    | MessageTypeVariant.MessageTypeURLField
  >;

  /**
   * The unique key string for the variant. Must be at minimum 3 characters and at
   * maximum 255 characters in length. Must be in the format of ^[a-z0-9_-]+$.
   */
  key: string;

  /**
   * A name for the variant. Must be at maximum 255 characters in length.
   */
  name: string;
}

export namespace MessageTypeVariant {
  /**
   * A boolean field used in a message type.
   */
  export interface MessageTypeBooleanField {
    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * The type of the field.
     */
    type: 'boolean';

    /**
     * Settings for the boolean field.
     */
    settings?: MessageTypeBooleanField.Settings;
  }

  export namespace MessageTypeBooleanField {
    /**
     * Settings for the boolean field.
     */
    export interface Settings {
      /**
       * The default value of the boolean field.
       */
      default?: boolean;

      description?: string;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }
  }

  /**
   * A button field used in a message type.
   */
  export interface MessageTypeButtonField {
    /**
     * A text field used in a message type.
     */
    action: MessageTypesAPI.MessageTypeTextField;

    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * A text field used in a message type.
     */
    text: MessageTypesAPI.MessageTypeTextField;

    /**
     * The type of the field.
     */
    type: 'button';

    /**
     * Settings for the button field.
     */
    settings?: MessageTypeButtonField.Settings;
  }

  export namespace MessageTypeButtonField {
    /**
     * Settings for the button field.
     */
    export interface Settings {
      description?: string;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }
  }

  /**
   * An image field used in a message type.
   */
  export interface MessageTypeImageField {
    /**
     * A text field used in a message type.
     */
    action: MessageTypesAPI.MessageTypeTextField;

    /**
     * A text field used in a message type.
     */
    alt: MessageTypesAPI.MessageTypeTextField;

    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * The type of the field.
     */
    type: 'image';

    /**
     * A URL field used in a message type.
     */
    url: MessageTypeImageField.URL;

    /**
     * Settings for the image field.
     */
    settings?: MessageTypeImageField.Settings;
  }

  export namespace MessageTypeImageField {
    /**
     * A URL field used in a message type.
     */
    export interface URL {
      /**
       * The unique key of the field.
       */
      key: string;

      /**
       * The label of the field.
       */
      label: string | null;

      /**
       * The type of the field.
       */
      type: 'url';

      /**
       * Settings for the url field.
       */
      settings?: URL.Settings;
    }

    export namespace URL {
      /**
       * Settings for the url field.
       */
      export interface Settings {
        /**
         * The default value of the URL field.
         */
        default?: string | null;

        description?: string;

        /**
         * Whether the field is required.
         */
        required?: boolean;
      }
    }

    /**
     * Settings for the image field.
     */
    export interface Settings {
      description?: string;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }
  }

  /**
   * A markdown field used in a message type.
   */
  export interface MessageTypeMarkdownField {
    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * The type of the field.
     */
    type: 'markdown';

    /**
     * Settings for the markdown field.
     */
    settings?: MessageTypeMarkdownField.Settings;
  }

  export namespace MessageTypeMarkdownField {
    /**
     * Settings for the markdown field.
     */
    export interface Settings {
      /**
       * The default value of the markdown field.
       */
      default?: string;

      description?: string;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }
  }

  /**
   * A multi-select field used in a message type.
   */
  export interface MessageTypeMultiSelectField {
    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * Settings for the multi_select field.
     */
    settings: MessageTypeMultiSelectField.Settings;

    /**
     * The type of the field.
     */
    type: 'multi_select';
  }

  export namespace MessageTypeMultiSelectField {
    /**
     * Settings for the multi_select field.
     */
    export interface Settings {
      /**
       * The default values for the multi-select field.
       */
      default?: Array<string> | null;

      description?: string;

      /**
       * The available options for the multi-select field.
       */
      options?: Array<Settings.Option>;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }

    export namespace Settings {
      export interface Option {
        /**
         * The value for the option.
         */
        value: string;

        /**
         * The display label for the option.
         */
        label?: string;
      }
    }
  }

  /**
   * A select field used in a message type.
   */
  export interface MessageTypeSelectField {
    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * Settings for the select field.
     */
    settings: MessageTypeSelectField.Settings;

    /**
     * The type of the field.
     */
    type: 'select';
  }

  export namespace MessageTypeSelectField {
    /**
     * Settings for the select field.
     */
    export interface Settings {
      /**
       * The default value for the select field.
       */
      default?: string | null;

      description?: string;

      /**
       * The available options for the select field.
       */
      options?: Array<Settings.Option>;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }

    export namespace Settings {
      export interface Option {
        /**
         * The value for the option.
         */
        value: string;

        /**
         * The display label for the option.
         */
        label?: string;
      }
    }
  }

  /**
   * A textarea field used in a message type.
   */
  export interface MessageTypeTextareaField {
    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * The type of the field.
     */
    type: 'textarea';

    /**
     * Settings for the textarea field.
     */
    settings?: MessageTypeTextareaField.Settings;
  }

  export namespace MessageTypeTextareaField {
    /**
     * Settings for the textarea field.
     */
    export interface Settings {
      /**
       * The default value of the textarea field.
       */
      default?: string | null;

      description?: string;

      max_length?: number;

      min_length?: number;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }
  }

  /**
   * A URL field used in a message type.
   */
  export interface MessageTypeURLField {
    /**
     * The unique key of the field.
     */
    key: string;

    /**
     * The label of the field.
     */
    label: string | null;

    /**
     * The type of the field.
     */
    type: 'url';

    /**
     * Settings for the url field.
     */
    settings?: MessageTypeURLField.Settings;
  }

  export namespace MessageTypeURLField {
    /**
     * Settings for the url field.
     */
    export interface Settings {
      /**
       * The default value of the URL field.
       */
      default?: string | null;

      description?: string;

      /**
       * Whether the field is required.
       */
      required?: boolean;
    }
  }
}

/**
 * Wraps the MessageType response under the `message_type` key.
 */
export interface MessageTypeUpsertResponse {
  /**
   * A message type is a schema for a message that maps to a UI component or element
   * within your application.
   */
  message_type: MessageType;
}

/**
 * Wraps the MessageType response under the `message_type` key.
 */
export interface MessageTypeValidateResponse {
  /**
   * A message type is a schema for a message that maps to a UI component or element
   * within your application.
   */
  message_type: MessageType;
}

export interface MessageTypeRetrieveParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Whether to hide uncommitted changes. When true, only committed changes will be
   * returned. When false, both committed and uncommitted changes will be returned.
   */
  hide_uncommitted_changes?: boolean;
}

export interface MessageTypeListParams extends EntriesCursorParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Whether to hide uncommitted changes. When true, only committed changes will be
   * returned. When false, both committed and uncommitted changes will be returned.
   */
  hide_uncommitted_changes?: boolean;
}

export interface MessageTypeUpsertParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A request to create a message type.
   */
  message_type: MessageTypeUpsertParams.MessageType;

  /**
   * Query param: Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Query param: Whether to commit the resource at the same time as modifying it.
   */
  commit?: boolean;

  /**
   * Query param: The message to commit the resource with, only used if `commit` is
   * `true`.
   */
  commit_message?: string;
}

export namespace MessageTypeUpsertParams {
  /**
   * A request to create a message type.
   */
  export interface MessageType {
    /**
     * An arbitrary string attached to a message type object. Useful for adding notes
     * about the message type for internal purposes. Maximum of 280 characters allowed.
     */
    description: string | null;

    /**
     * A name for the message type. Must be at maximum 255 characters in length.
     */
    name: string;

    /**
     * An HTML/liquid template for the message type preview.
     */
    preview: string;

    /**
     * The icon name of the message type.
     */
    icon_name?: string;

    /**
     * The semantic version of the message type.
     */
    semver?: string;

    /**
     * The variants of the message type.
     */
    variants?: Array<MessageTypesAPI.MessageTypeVariant>;
  }
}

export interface MessageTypeValidateParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A request to create a message type.
   */
  message_type: MessageTypeValidateParams.MessageType;
}

export namespace MessageTypeValidateParams {
  /**
   * A request to create a message type.
   */
  export interface MessageType {
    /**
     * An arbitrary string attached to a message type object. Useful for adding notes
     * about the message type for internal purposes. Maximum of 280 characters allowed.
     */
    description: string | null;

    /**
     * A name for the message type. Must be at maximum 255 characters in length.
     */
    name: string;

    /**
     * An HTML/liquid template for the message type preview.
     */
    preview: string;

    /**
     * The icon name of the message type.
     */
    icon_name?: string;

    /**
     * The semantic version of the message type.
     */
    semver?: string;

    /**
     * The variants of the message type.
     */
    variants?: Array<MessageTypesAPI.MessageTypeVariant>;
  }
}

export declare namespace MessageTypes {
  export {
    type MessageType as MessageType,
    type MessageTypeTextField as MessageTypeTextField,
    type MessageTypeVariant as MessageTypeVariant,
    type MessageTypeUpsertResponse as MessageTypeUpsertResponse,
    type MessageTypeValidateResponse as MessageTypeValidateResponse,
    type MessageTypesEntriesCursor as MessageTypesEntriesCursor,
    type MessageTypeRetrieveParams as MessageTypeRetrieveParams,
    type MessageTypeListParams as MessageTypeListParams,
    type MessageTypeUpsertParams as MessageTypeUpsertParams,
    type MessageTypeValidateParams as MessageTypeValidateParams,
  };
}
