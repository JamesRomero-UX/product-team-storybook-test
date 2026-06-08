// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as ChannelsAPI from './channels';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';

export class ChannelGroups extends APIResource {
  /**
   * Returns a paginated list of channel groups. Note: the list of channel groups is
   * across the entire account, not scoped to an environment.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const channelGroup of client.channelGroups.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: ChannelGroupListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ChannelGroupsEntriesCursor, ChannelGroup> {
    return this._client.getAPIList('/v1/channel_groups', EntriesCursor<ChannelGroup>, { query, ...options });
  }
}

export type ChannelGroupsEntriesCursor = EntriesCursor<ChannelGroup>;

/**
 * A group of channels with rules for when they are applicable.
 */
export interface ChannelGroup {
  /**
   * Rules for determining which channels should be used.
   */
  channel_rules: Array<ChannelGroupRule>;

  /**
   * The type of channels contained in this group.
   */
  channel_type: 'email' | 'in_app' | 'in_app_feed' | 'in_app_guide' | 'sms' | 'push' | 'chat' | 'http';

  /**
   * The timestamp of when the channel group was created.
   */
  created_at: string;

  /**
   * Unique identifier for the channel group within a project.
   */
  key: string;

  /**
   * The human-readable name of the channel group.
   */
  name: string;

  /**
   * Determines how the channel rules are applied ('any' means any rule can match,
   * 'all' means all rules must match).
   */
  operator: 'any' | 'all';

  /**
   * Whether this channel group was created by the system or a user. Only user
   * created channel groups can be modified.
   */
  source: 'system' | 'user';

  /**
   * The timestamp of when the channel group was last updated.
   */
  updated_at: string;
}

/**
 * A rule that determines if a channel should be executed as part of a channel
 * group.
 */
export interface ChannelGroupRule {
  /**
   * A configured channel, which is a way to route messages to a provider.
   */
  channel: ChannelsAPI.Channel;

  /**
   * The timestamp of when the rule was created.
   */
  created_at: string;

  /**
   * The order index of this rule within the channel group.
   */
  index: number;

  /**
   * The type of rule (if = conditional, unless = negative conditional, always =
   * always apply).
   */
  rule_type: 'if' | 'unless' | 'always';

  /**
   * The timestamp of when the rule was last updated.
   */
  updated_at: string;

  /**
   * For conditional rules, the value to compare against.
   */
  argument?: string | null;

  /**
   * For conditional rules, the operator to apply.
   */
  operator?:
    | 'equal_to'
    | 'not_equal_to'
    | 'greater_than'
    | 'less_than'
    | 'greater_than_or_equal_to'
    | 'less_than_or_equal_to'
    | 'contains'
    | 'not_contains'
    | 'contains_all'
    | 'empty'
    | 'not_empty'
    | 'is_audience_member'
    | 'is_not_audience_member'
    | null;

  /**
   * For conditional rules, the variable to evaluate.
   */
  variable?: string | null;
}

export interface ChannelGroupListParams extends EntriesCursorParams {}

export declare namespace ChannelGroups {
  export {
    type ChannelGroup as ChannelGroup,
    type ChannelGroupRule as ChannelGroupRule,
    type ChannelGroupsEntriesCursor as ChannelGroupsEntriesCursor,
    type ChannelGroupListParams as ChannelGroupListParams,
  };
}
