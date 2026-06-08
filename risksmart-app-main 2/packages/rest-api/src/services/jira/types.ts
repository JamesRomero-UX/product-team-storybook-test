export interface AtlassianDocumentContent {
  type: string;
  attrs?: Record<string, unknown>;
  content?: AtlassianDocumentContent[];
  text?: string;
}

export interface AtlassianDocument {
  type: string;
  version: number;
  content: AtlassianDocumentContent[];
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary?: string;
    description?: AtlassianDocument;
    status?: {
      id: string;
      name: string;
      statusCategory?: {
        id: number;
        key: string;
        name: string;
      };
    };
    assignee?: {
      accountId: string;
      displayName?: string;
      emailAddress?: string;
    } | null;
    priority?: {
      id: string;
      name: string;
    };
    issuetype?: {
      id: string;
      name: string;
    };
    project?: {
      id: string;
      key: string;
      name: string;
    };
    created?: string;
    updated?: string;
    [key: string]: unknown;
  };
}

export interface JiraIssueUpdate {
  /**
   * Issue update fields
   */
  fields?: {
    /**
     * Custom fields
     */
    [key: string]: unknown;
  };

  /**
   * Update operations in Jira format
   */
  update?: {
    [fieldKey: string]: Array<{
      set?: unknown;
      add?: unknown;
      remove?: unknown;
    }>;
  };
}

export interface JiraUser {
  self: string;
  accountId: string;
  accountType: 'atlassian' | 'app' | 'customer' | 'unknown';
  active: boolean;
  displayName: string;
  emailAddress?: string | null;
}
