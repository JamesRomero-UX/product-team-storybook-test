// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';

export class Templates extends APIResource {}

/**
 * A chat template.
 */
export interface ChatTemplate {
  /**
   * The markdown body of the chat template.
   */
  markdown_body: string;

  /**
   * A JSON template for the chat notification message payload. Only present if not
   * using the markdown body.
   */
  json_body?: string | null;

  /**
   * The summary of the chat template. Used by some chat apps in their push
   * notifications.
   */
  summary?: string;
}

/**
 * An email message template.
 */
export interface EmailTemplate {
  /**
   * The subject of the email.
   */
  subject: string;

  /**
   * An HTML template for the email body. Either `html_body` or `visual_blocks` must
   * be provided.
   */
  html_body?: string;

  /**
   * The [settings](https://docs.knock.app/integrations/email/settings) for the email
   * template.
   */
  settings?: EmailTemplate.Settings | null;

  /**
   * A text template for the email body. Only present if opted out from
   * autogenerating it from the HTML template.
   */
  text_body?: string | null;

  /**
   * The visual blocks of the email. Either `html_body` or `visual_blocks` must be
   * provided.
   */
  visual_blocks?: Array<
    | EmailTemplate.EmailButtonSetBlock
    | EmailTemplate.EmailDividerBlock
    | EmailTemplate.EmailHTMLBlock
    | EmailTemplate.EmailImageBlock
    | EmailTemplate.EmailMarkdownBlock
    | EmailTemplate.EmailPartialBlock
  >;
}

export namespace EmailTemplate {
  /**
   * The [settings](https://docs.knock.app/integrations/email/settings) for the email
   * template.
   */
  export interface Settings {
    /**
     * The object path in the data payload (of the workflow trigger call) to resolve
     * attachments.
     */
    attachment_key?: string | null;

    /**
     * The key of the email layout which the step is using.
     */
    layout_key?: string | null;

    /**
     * A liquid template that will be injected into the layout above the message
     * template content.
     */
    pre_content?: string | null;
  }

  /**
   * A button set block in an email template.
   */
  export interface EmailButtonSetBlock {
    /**
     * The ID of the block.
     */
    id: string;

    /**
     * A list of buttons in the button set.
     */
    buttons: Array<EmailButtonSetBlock.Button>;

    /**
     * The type of the block.
     */
    type: string;

    /**
     * The version of the block.
     */
    version: number;

    /**
     * The layout attributes of the block.
     */
    layout_attrs?: EmailButtonSetBlock.LayoutAttrs;
  }

  export namespace EmailButtonSetBlock {
    /**
     * A button in a button set block.
     */
    export interface Button {
      /**
       * The action of the button.
       */
      action: string;

      /**
       * The label of the button.
       */
      label: string;

      /**
       * The variant of the button.
       */
      variant: string;

      /**
       * The size attributes of the button.
       */
      size_attrs?: Button.SizeAttrs;

      /**
       * The style attributes of the button.
       */
      style_attrs?: Button.StyleAttrs;
    }

    export namespace Button {
      /**
       * The size attributes of the button.
       */
      export interface SizeAttrs {
        /**
         * Whether the button is full width.
         */
        is_fullwidth?: boolean;

        /**
         * The size of the button.
         */
        size?: 'sm' | 'md' | 'lg';
      }

      /**
       * The style attributes of the button.
       */
      export interface StyleAttrs {
        /**
         * The background color of the button.
         */
        background_color?: string;

        /**
         * The border color of the button.
         */
        border_color?: string;

        /**
         * The border radius of the button.
         */
        border_radius?: number;

        /**
         * The border width of the button.
         */
        border_width?: number;

        /**
         * The text color of the button.
         */
        text_color?: string;
      }
    }

    /**
     * The layout attributes of the block.
     */
    export interface LayoutAttrs {
      /**
       * The column_gap layout attribute of the block.
       */
      column_gap: number;

      /**
       * The horizontal alignment of the block.
       */
      horizontal_align: 'left' | 'center' | 'right';

      /**
       * The padding_bottom layout attribute of the block.
       */
      padding_bottom: number;

      /**
       * The padding_left layout attribute of the block.
       */
      padding_left: number;

      /**
       * The padding_right layout attribute of the block.
       */
      padding_right: number;

      /**
       * The padding_top layout attribute of the block.
       */
      padding_top: number;
    }
  }

  /**
   * A divider block in an email template.
   */
  export interface EmailDividerBlock {
    /**
     * The ID of the block.
     */
    id: string;

    /**
     * The type of the block.
     */
    type: string;

    /**
     * The version of the block.
     */
    version: number;

    /**
     * The layout attributes of the block.
     */
    layout_attrs?: EmailDividerBlock.LayoutAttrs;
  }

  export namespace EmailDividerBlock {
    /**
     * The layout attributes of the block.
     */
    export interface LayoutAttrs {
      /**
       * The padding_bottom layout attribute of the block.
       */
      padding_bottom: number;

      /**
       * The padding_left layout attribute of the block.
       */
      padding_left: number;

      /**
       * The padding_right layout attribute of the block.
       */
      padding_right: number;

      /**
       * The padding_top layout attribute of the block.
       */
      padding_top: number;
    }
  }

  /**
   * An HTML block in an email template.
   */
  export interface EmailHTMLBlock {
    /**
     * The ID of the block.
     */
    id: string;

    /**
     * The HTML content of the block.
     */
    content: string;

    /**
     * The type of the block.
     */
    type: string;

    /**
     * The version of the block.
     */
    version: number;
  }

  /**
   * An image block in an email template.
   */
  export interface EmailImageBlock {
    /**
     * The ID of the block.
     */
    id: string;

    /**
     * The type of the block.
     */
    type: string;

    /**
     * The URL of the image to display.
     */
    url: string;

    /**
     * The version of the block.
     */
    version: number;

    /**
     * Optional action URL for the image.
     */
    action?: string | null;

    /**
     * Alt text for the image.
     */
    alt?: string | null;

    /**
     * The layout attributes of the block.
     */
    layout_attrs?: EmailImageBlock.LayoutAttrs;

    /**
     * The style attributes of the image.
     */
    style_attrs?: EmailImageBlock.StyleAttrs;
  }

  export namespace EmailImageBlock {
    /**
     * The layout attributes of the block.
     */
    export interface LayoutAttrs {
      /**
       * The horizontal alignment of the block.
       */
      horizontal_align: 'left' | 'center' | 'right';

      /**
       * The padding_bottom layout attribute of the block.
       */
      padding_bottom: number;

      /**
       * The padding_left layout attribute of the block.
       */
      padding_left: number;

      /**
       * The padding_right layout attribute of the block.
       */
      padding_right: number;

      /**
       * The padding_top layout attribute of the block.
       */
      padding_top: number;
    }

    /**
     * The style attributes of the image.
     */
    export interface StyleAttrs {
      /**
       * The width of the image.
       */
      width?: string;
    }
  }

  /**
   * A markdown block in an email template.
   */
  export interface EmailMarkdownBlock {
    /**
     * The ID of the block.
     */
    id: string;

    /**
     * The markdown content of the block.
     */
    content: string;

    /**
     * The type of the block.
     */
    type: string;

    /**
     * The flavor of markdown to use for the block.
     */
    variant: string;

    /**
     * The version of the block.
     */
    version: number;

    /**
     * The layout attributes of the block.
     */
    layout_attrs?: EmailMarkdownBlock.LayoutAttrs;
  }

  export namespace EmailMarkdownBlock {
    /**
     * The layout attributes of the block.
     */
    export interface LayoutAttrs {
      /**
       * The padding_bottom layout attribute of the block.
       */
      padding_bottom: number;

      /**
       * The padding_left layout attribute of the block.
       */
      padding_left: number;

      /**
       * The padding_right layout attribute of the block.
       */
      padding_right: number;

      /**
       * The padding_top layout attribute of the block.
       */
      padding_top: number;
    }
  }

  /**
   * A partial block in an email template, used to render a reusable partial
   * component.
   */
  export interface EmailPartialBlock {
    /**
     * The ID of the block.
     */
    id: string;

    /**
     * The attributes to pass to the partial block.
     */
    attrs: { [key: string]: unknown };

    /**
     * The key of the partial block to invoke.
     */
    key: string;

    /**
     * The name of the partial block.
     */
    name: string;

    /**
     * The type of the block.
     */
    type: string;

    /**
     * The version of the block.
     */
    version: number;

    /**
     * The layout attributes of the block.
     */
    layout_attrs?: EmailPartialBlock.LayoutAttrs;
  }

  export namespace EmailPartialBlock {
    /**
     * The layout attributes of the block.
     */
    export interface LayoutAttrs {
      /**
       * The padding_bottom layout attribute of the block.
       */
      padding_bottom: number;

      /**
       * The padding_left layout attribute of the block.
       */
      padding_left: number;

      /**
       * The padding_right layout attribute of the block.
       */
      padding_right: number;

      /**
       * The padding_top layout attribute of the block.
       */
      padding_top: number;
    }
  }
}

/**
 * An in-app feed template.
 */
export interface InAppFeedTemplate {
  /**
   * The markdown body of the in-app feed.
   */
  markdown_body: string;

  /**
   * The action buttons of the in-app feed message.
   */
  action_buttons?: Array<InAppFeedTemplate.ActionButton>;

  /**
   * The URL to navigate to when the in-app feed is tapped. Can be omitted for
   * multi-action templates, where the action buttons will be used instead.
   */
  action_url?: string | null;
}

export namespace InAppFeedTemplate {
  /**
   * A single-action button to be rendered in an in-app feed cell.
   */
  export interface ActionButton {
    /**
     * The URI for this action.
     */
    action: string;

    /**
     * The label of the action button.
     */
    label: string;
  }
}

/**
 * A push notification template.
 */
export interface PushTemplate {
  /**
   * The body of the push notification.
   */
  text_body: string;

  /**
   * The title of the push notification.
   */
  title: string;

  /**
   * The [settings](https://docs.knock.app/integrations/sms/settings-and-overrides)
   * for the push template. Can be omitted.
   */
  settings?: PushTemplate.Settings | null;
}

export namespace PushTemplate {
  /**
   * The [settings](https://docs.knock.app/integrations/sms/settings-and-overrides)
   * for the push template. Can be omitted.
   */
  export interface Settings {
    /**
     * The delivery type of the push notification. Defaults to `content`. Set as silent
     * to send a data-only notification. When set to `data`, no body will be sent.
     */
    delivery_type?: 'silent' | 'content';

    /**
     * A JSON object that overrides the payload sent to the push provider.
     */
    payload_overrides?: string;
  }
}

/**
 * A request template for a fetch function step.
 */
export interface RequestTemplate {
  /**
   * The HTTP method of the request.
   */
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';

  /**
   * The URL of the request.
   */
  url: string;

  /**
   * The body of the request. Only used for POST or PUT requests.
   */
  body?: string | null;

  /**
   * The headers of the request. Can be a template string or a list of key-value
   * pairs.
   */
  headers?: string | Array<RequestTemplate.UnionMember1>;

  /**
   * The query params of the request. Can be a template string or a list of key-value
   * pairs.
   */
  query_params?: string | Array<RequestTemplate.UnionMember1>;
}

export namespace RequestTemplate {
  export interface UnionMember1 {
    /**
     * The key of the header.
     */
    key: string;

    /**
     * The value of the header.
     */
    value: string;
  }

  export interface UnionMember1 {
    /**
     * The key of the query param.
     */
    key: string;

    /**
     * The value of the query param.
     */
    value: string;
  }
}

/**
 * An SMS template.
 */
export interface SMSTemplate {
  /**
   * The message of the SMS.
   */
  text_body: string;

  /**
   * The [settings](https://docs.knock.app/integrations/sms/settings-and-overrides)
   * for the SMS template.
   */
  settings?: SMSTemplate.Settings | null;
}

export namespace SMSTemplate {
  /**
   * The [settings](https://docs.knock.app/integrations/sms/settings-and-overrides)
   * for the SMS template.
   */
  export interface Settings {
    /**
     * A JSON object that overrides the payload sent to the SMS provider.
     */
    payload_overrides?: string | null;

    /**
     * An override for the phone number to send the SMS to. When not set, defaults to
     * `recipient.phone_number`.
     */
    to_number?: string | null;
  }
}

/**
 * A webhook template. By default, a webhook step will use the request settings you
 * configured in your webhook channel. You can override this as you see fit on a
 * per-step basis.
 */
export interface WebhookTemplate {
  /**
   * The HTTP method of the webhook.
   */
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';

  /**
   * The URL of the webhook.
   */
  url: string;

  /**
   * The body of the request. Only used for POST or PUT requests.
   */
  body?: string | null;

  /**
   * A list of key-value pairs for the request headers. Each object should contain
   * key and value fields with string values.
   */
  headers?: Array<WebhookTemplate.Header>;

  /**
   * A list of key-value pairs for the request query params. Each object should
   * contain key and value fields with string values.
   */
  query_params?: Array<WebhookTemplate.QueryParam>;
}

export namespace WebhookTemplate {
  export interface Header {
    /**
     * The key of the header.
     */
    key: string;

    /**
     * The value of the header.
     */
    value: string;
  }

  export interface QueryParam {
    /**
     * The key of the query param.
     */
    key: string;

    /**
     * The value of the query param.
     */
    value: string;
  }
}

export declare namespace Templates {
  export {
    type ChatTemplate as ChatTemplate,
    type EmailTemplate as EmailTemplate,
    type InAppFeedTemplate as InAppFeedTemplate,
    type PushTemplate as PushTemplate,
    type RequestTemplate as RequestTemplate,
    type SMSTemplate as SMSTemplate,
    type WebhookTemplate as WebhookTemplate,
  };
}
