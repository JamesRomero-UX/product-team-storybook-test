import { IssueAssessmentStatusEnum, ParentTypeEnum } from 'generated/graphql';
import { describe, expect, it } from 'vitest';

import { AllicaJiraIssueSchemaWithTransform } from './schema';

describe('AllicaJiraIssueSchemaWithTransform', () => {
  const baseInput = {
    jiraLinkCustomAttribute: '123_link',
    setRefInJira: true,
    fallbackUserId: 'fallback-user-id',
    jiraIssueBody: {
      key: 'TEST-123',
      fields: {
        created: 1735430400000, // 2024-12-29T00:00:00.000Z in milliseconds
        reporter: {
          accountId: 'reporter-account-id',
        },
        assignee: {
          accountId: 'assignee-account-id',
          displayName: 'Assignee User',
        },
        summary: 'Test Issue Summary',
        description: 'Risk event description',
        customfield_12577: 'Test issue description', // Impact & identification
        customfield_12181: { value: 'Product A' }, // Product
        customfield_10884: 'INC-001', // Incident management ref
        customfield_12656: [
          { value: 'Business Unit 1' },
          { value: 'Business Unit 2' },
        ], // Affected Business Units
        customfield_12578: '2025-12-24T00:00:00.000Z', // Date occurred - incidents
        customfield_12579: '2025-12-25T00:00:00.000Z', // Date identified
        customfield_16130: [
          {
            // Product or function owners
            accountId: 'reporter-account-id',
          },
        ],
        customfield_10050: [
          { accountId: 'participant-account-id-1' },
          { accountId: 'participant-account-id-2' },
        ], // Request participants
        customfield_11191: {
          // Primary risk taxonomy
          value: 'Operational Risk',
          child: { value: 'Process Risk' },
        },
        customfield_12658: { value: 'Internal Fraud' }, // Basel event category
        customfield_12584: 'Root cause analysis text', // Root cause and resolution
        customfield_12586: { value: 'Low' }, // Financial Loss Impact Rating
        customfield_12587: { value: 'Medium' }, // Regulatory Impact Rating
        customfield_12589: { value: 'High' }, // Reputational Impact Rating
        customfield_12590: { value: 'Low' }, // Colleague Impact Rating
        customfield_12588: { value: 'Medium' }, // Customer Resilience Impact Rating
        customfield_12244: {
          // Incident Failure Categorisation
          value: 'People',
          child: { value: 'Training' },
        },
      },
    },
  };

  it('should transform a complete Jira issue with all fields', () => {
    const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

    expect(result).toEqual({
      Issue: {
        Key: 'TEST-123',
        Title: 'Test Issue Summary',
        Description: 'Test issue description', // Uses customfield_12577 for incidents
        ImpactsCustomer: false,
        IsExternalIssue: false,
        AssessmentStatus: IssueAssessmentStatusEnum.Closed,
        DateOccurred: '2025-12-24T00:00:00.000Z',
        DateIdentified: '2025-12-25T00:00:00.000Z',
        OwnerAccountIds: ['reporter-account-id'],
        ContributorAccountIds: [
          'participant-account-id-1',
          'participant-account-id-2',
        ],
        RSUrl: undefined,
        CustomAttributeData: {
          '1717577326708_select': 'Product A',
          '1719574400477_text': 'INC-001',
          '1717577717300_select': 'Internal Fraud',
          '1717670549930_select': 'Operational Risk',
          '1717670568472_select': 'Operational Risk - Process Risk',
          '1717577438882_select': undefined, // Risk business partner not set for incidents
        },
        IssueAssessmentCustomAttributeData: {
          '1756991891738_textarea': 'Root cause analysis text',
          '1717671009400_select': 'Low',
          '1717671039637_select': 'Medium',
          '1717671113073_select': 'High',
          '1717671147751_select': 'Low',
          '1717671072969_select': 'Medium',
          '1757601406913_select': 'No',
          '1756997076801_select': 'People',
          '1756997372431_select': 'People-Training',
        },
      },
      IssueTypeOverride: ParentTypeEnum.IssueRiskEvent,
      IssueAssessmentTypeOverride: 'material-impact',
      FallbackUserId: 'fallback-user-id',
    });
  });

  it('should handle null description for incidents (use customfield_12577)', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_12577: null,
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.Description).toBe('');
  });

  it('should use description field for non-incidents', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident
          description: 'Risk event description text',
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.Description).toBe('Risk event description text');
  });

  it('should handle undefined description for incidents', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_12577: undefined,
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.Description).toBe('');
  });

  it('should handle null description for non-incidents', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident
          description: null,
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.Description).toBe('');
  });

  it('should handle null assignee', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident to test risk business partner
          assignee: null,
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    // Risk business partner should be undefined when assignee is null
    expect(
      result.Issue.CustomAttributeData['1717577438882_select']
    ).toBeUndefined();
  });

  it('should handle undefined assignee', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident to test risk business partner
          assignee: undefined,
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    // Risk business partner should be undefined when assignee is undefined
    expect(
      result.Issue.CustomAttributeData['1717577438882_select']
    ).toBeUndefined();
  });

  it('should handle multiple owners', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_16130: [
            { accountId: 'owner-1' },
            { accountId: 'owner-2' },
            { accountId: 'owner-3' },
          ],
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.OwnerAccountIds).toEqual([
      'owner-1',
      'owner-2',
      'owner-3',
    ]);
  });

  it('should combine primary and secondary owners in OwnerAccountIds', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_16130: [{ accountId: 'primary-owner-1' }],
          customfield_16421: [
            { accountId: 'secondary-owner-1' },
            { accountId: 'secondary-owner-2' },
          ],
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.OwnerAccountIds).toEqual([
      'primary-owner-1',
      'secondary-owner-1',
      'secondary-owner-2',
    ]);
  });

  it('should handle null secondary owners (customfield_16421)', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_16130: [{ accountId: 'primary-owner-1' }],
          customfield_16421: null,
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.OwnerAccountIds).toEqual(['primary-owner-1']);
  });

  it('should handle undefined secondary owners (customfield_16421)', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_16130: [{ accountId: 'primary-owner-1' }],
          customfield_16421: undefined,
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.OwnerAccountIds).toEqual(['primary-owner-1']);
  });

  it('should reject empty owners array', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_16130: [],
        },
      },
    };

    expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow();
  });

  it('should handle optional fallbackUserId', () => {
    const input = {
      ...baseInput,
      fallbackUserId: undefined,
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.FallbackUserId).toBeUndefined();
  });

  it('should handle contributors (customfield_10050) correctly', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10050: [
            { accountId: 'contributor-1' },
            { accountId: 'contributor-2' },
            { accountId: 'contributor-3' },
          ],
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.ContributorAccountIds).toEqual([
      'contributor-1',
      'contributor-2',
      'contributor-3',
    ]);
  });

  it('should handle empty contributors (customfield_10050)', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10050: null,
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.ContributorAccountIds).toEqual([]);
  });

  it('should set risk business partner from assignee displayName for non-incidents', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident
          assignee: {
            accountId: 'assignee-account-id',
            displayName: 'John Smith',
          },
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.CustomAttributeData['1717577438882_select']).toBe(
      'John Smith'
    );
  });

  it('should not set risk business partner for incidents', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: 'INC-001', // Is an incident
          assignee: {
            accountId: 'assignee-account-id',
            displayName: 'John Smith',
          },
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(
      result.Issue.CustomAttributeData['1717577438882_select']
    ).toBeUndefined();
  });

  it('should use created timestamp as DateIdentified fallback when customfield_12579 is null', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident
          customfield_12579: null, // No date identified
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
          created: 1735084800000, // 2024-12-25T00:00:00.000Z
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(result.Issue.DateIdentified).toBe('2024-12-25T00:00:00.000Z');
  });

  it('should handle missing product when not an incident', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident
          customfield_12181: null, // No product
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred - risk events (required for non-incidents)
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(
      result.Issue.CustomAttributeData['1717577326708_select']
    ).toBeUndefined();
  });

  it('should handle root cause and resolution when not an incident', () => {
    const input = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // Not an incident
          customfield_12584: null, // No root cause
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred - risk events (required for non-incidents)
        },
      },
    };

    const result = AllicaJiraIssueSchemaWithTransform.parse(input);

    expect(
      result.Issue.IssueAssessmentCustomAttributeData['1756991891738_textarea']
    ).toBeUndefined();
  });

  describe('AssessmentStatus', () => {
    it('should set AssessmentStatus to Closed when incident management ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: 'INC-001', // Incident management ref is set
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(result.Issue.AssessmentStatus).toBe(
        IssueAssessmentStatusEnum.Closed
      );
    });

    it('should set AssessmentStatus to Pending when incident management ref is not set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Incident management ref is not set
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred - risk events (required for non-incidents)
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(result.Issue.AssessmentStatus).toBe(
        IssueAssessmentStatusEnum.Pending
      );
    });
  });

  describe('validation errors', () => {
    it('should reject empty summary', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            summary: '',
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow();
    });

    it('should reject empty key', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          key: '',
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow();
    });

    it('should reject invalid date format in date occurred', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12578: 'invalid-date',
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow();
    });

    it('should reject invalid date format in date identified', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12579: 'invalid-date',
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow();
    });

    it('should reject empty affected business units array', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12656: [],
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow();
    });
  });

  describe('superRefine - incident required fields', () => {
    const nonIncidentInput = {
      ...baseInput,
      jiraIssueBody: {
        ...baseInput.jiraIssueBody,
        fields: {
          ...baseInput.jiraIssueBody.fields,
          customfield_10884: null, // No incident management ref
          customfield_12656: null, // Affected Business Units
          customfield_11191: null, // Risk taxonomies
          customfield_12658: null, // Basel event category
          customfield_12584: null, // Root cause
          customfield_12586: null, // Financial loss
          customfield_12587: null, // Regulatory
          customfield_12589: null, // Reputational
          customfield_12590: null, // Colleague
          customfield_12588: null, // Customer resilience
          customfield_12181: null, // Product
          customfield_12244: null, // Incident Failure Categorisation
          customfield_12578: null, // Date occurred - incidents
          customfield_12579: null, // Date identified
          customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred - risk events (required for non-incidents)
        },
      },
    };

    it('should allow missing incident fields when not an incident', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(nonIncidentInput);

      expect(
        result.Issue.CustomAttributeData['1719574400477_text']
      ).toBeUndefined();
      expect(
        result.Issue.CustomAttributeData['1717577717300_select']
      ).toBeUndefined();
      expect(
        result.Issue.CustomAttributeData['1717670549930_select']
      ).toBeUndefined();
      expect(
        result.Issue.CustomAttributeData['1717670568472_select']
      ).toBeUndefined();
    });

    it('should require Affected Business Units when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12656: null, // Missing Affected Business Units
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Affected Business Units required when Incident management ref is set/
      );
    });

    it('should require Risk taxonomies when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_11191: null, // Missing Risk taxonomies
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Risk taxonomies required when Incident management ref is set/
      );
    });

    it('should require Basel event category when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12658: null, // Missing Basel event category
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Basel event category required when Incident management ref is set/
      );
    });

    it('should require Root cause and resolution when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12584: null, // Missing Root cause
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Root cause and resolution required when Incident management ref is set/
      );
    });

    it('should require Financial loss impact rating when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12586: null, // Missing Financial loss
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Financial loss impact rating required when Incident management ref is set/
      );
    });

    it('should require Regulatory impact rating when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12587: null, // Missing Regulatory impact
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Regulatory impact rating required when Incident management ref is set/
      );
    });

    it('should require Reputational impact rating when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12589: null, // Missing Reputational impact
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Reputational impact rating required when Incident management ref is set/
      );
    });

    it('should require Colleague impact rating when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12590: null, // Missing Colleague impact
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Colleague impact rating required when Incident management ref is set/
      );
    });

    it('should require Customer resilience impact rating when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12588: null, // Missing Customer resilience impact
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Customer resilience impact rating required when Incident management ref is set/
      );
    });

    it('should require Product or function when incident ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12181: null, // Missing Product or function
          },
        },
      };

      expect(() => AllicaJiraIssueSchemaWithTransform.parse(input)).toThrow(
        /Product or function required when Incident management ref is set/
      );
    });

    it('should report all missing required fields when multiple are missing', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12656: null,
            customfield_11191: null,
            customfield_12658: null,
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((issue) => issue.message);
        expect(messages).toContain(
          'Affected Business Units required when Incident management ref is set'
        );
        expect(messages).toContain(
          'Risk taxonomies required when Incident management ref is set'
        );
        expect(messages).toContain(
          'Basel event category required when Incident management ref is set'
        );
      }
    });
  });

  describe('risk taxonomy transformation', () => {
    it('should transform risk taxonomy L1 and L2 correctly', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

      expect(result.Issue.CustomAttributeData['1717670549930_select']).toBe(
        'Operational Risk'
      );
      expect(result.Issue.CustomAttributeData['1717670568472_select']).toBe(
        'Operational Risk - Process Risk'
      );
    });

    it('should handle missing risk taxonomy when not an incident', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_11191: null, // No risk taxonomy
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred - risk events (required for non-incidents)
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(
        result.Issue.CustomAttributeData['1717670549930_select']
      ).toBeUndefined();
      expect(
        result.Issue.CustomAttributeData['1717670568472_select']
      ).toBeUndefined();
    });
  });

  describe('impact rating transformations', () => {
    it('should transform all impact ratings correctly', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671009400_select']
      ).toBe('Low');
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671039637_select']
      ).toBe('Medium');
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671113073_select']
      ).toBe('High');
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671147751_select']
      ).toBe('Low');
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671072969_select']
      ).toBe('Medium');
    });

    it('should handle missing impact ratings when not an incident', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_12586: null,
            customfield_12587: null,
            customfield_12589: null,
            customfield_12590: null,
            customfield_12588: null,
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred - risk events (required for non-incidents)
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671009400_select']
      ).toBeUndefined();
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671039637_select']
      ).toBeUndefined();
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671113073_select']
      ).toBeUndefined();
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671147751_select']
      ).toBeUndefined();
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1717671072969_select']
      ).toBeUndefined();
    });

    it('should set "Is an Issue needed" to No for incidents', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1757601406913_select']
      ).toBe('No');
    });

    it('should not set "Is an Issue needed" for non-incidents', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1757601406913_select']
      ).toBeUndefined();
    });
  });

  describe('primary root cause transformation', () => {
    it('should transform primary root cause L1 and L2 for incidents', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

      // L1: Just the first value
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1756997076801_select']
      ).toBe('People');

      // L2: Combined as "L1-L2"
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1756997372431_select']
      ).toBe('People-Training');
    });

    it('should not include primary root cause when risk taxonomy is not set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
            customfield_11191: null, // No risk taxonomy
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1756997076801_select']
      ).toBeUndefined();
      expect(
        result.Issue.IssueAssessmentCustomAttributeData['1756997372431_select']
      ).toBeUndefined();
    });

    it('should handle missing incident failure categorisation gracefully', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_12244: null, // Missing incident failure categorisation
          },
        },
      };

      // Should fail validation because customfield_12244 is required for incidents
      expect(() =>
        AllicaJiraIssueSchemaWithTransform.parse(input)
      ).toThrowError();
    });
  });

  describe('date field validation', () => {
    it('should require customfield_10632 (date occurred) for non-incidents', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_10632: null, // Missing date occurred for risk events
          },
        },
      };

      expect(() =>
        AllicaJiraIssueSchemaWithTransform.parse(input)
      ).toThrowError(/Date occurred required/);
    });

    it('should accept plain string date format for date occurred (incidents)', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

      expect(result.Issue.DateOccurred).toBe('2025-12-24T00:00:00.000Z');
    });

    it('should accept plain string date format for date identified', () => {
      const result = AllicaJiraIssueSchemaWithTransform.parse(baseInput);

      expect(result.Issue.DateIdentified).toBe('2025-12-25T00:00:00.000Z');
    });

    it('should use customfield_10632 for date occurred in risk events', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_10632: '2025-12-26T00:00:00.000Z', // Date occurred for risk events
            customfield_12578: null, // No incident date occurred
          },
        },
      };

      const result = AllicaJiraIssueSchemaWithTransform.parse(input);

      expect(result.Issue.DateOccurred).toBe('2025-12-26T00:00:00.000Z');
    });
  });

  describe('incident vs risk event validation differences', () => {
    it('should require incident-specific fields when incident management ref is set', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: 'INC-001', // Is an incident
            customfield_12656: null, // Missing affected business units
          },
        },
      };

      expect(() =>
        AllicaJiraIssueSchemaWithTransform.parse(input)
      ).toThrowError(/Affected Business Units required/);
    });

    it('should not require incident-specific fields when not an incident', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events (required)
            // These incident-specific fields are null but should pass validation
            customfield_12656: null, // Affected business units
            customfield_12584: null, // Root cause and resolution
            customfield_12586: null, // Financial loss impact rating
            customfield_12587: null, // Regulatory impact rating
            customfield_12588: null, // Customer resilience impact rating
            customfield_12589: null, // Reputational impact rating
            customfield_12590: null, // Colleague impact rating
            customfield_12244: null, // Incident failure categorisation
          },
        },
      };

      // Should pass validation for non-incidents
      const result = AllicaJiraIssueSchemaWithTransform.parse(input);
      expect(result.Issue.Key).toBe('TEST-123');
    });

    it('should require date occurred (customfield_12578) for incidents', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: 'INC-001', // Is an incident
            customfield_12578: null, // Missing date occurred for incidents
          },
        },
      };

      expect(() =>
        AllicaJiraIssueSchemaWithTransform.parse(input)
      ).toThrowError(/Date occurred required/);
    });

    it('should require date identified (customfield_12579) for incidents', () => {
      const input = {
        ...baseInput,
        jiraIssueBody: {
          ...baseInput.jiraIssueBody,
          fields: {
            ...baseInput.jiraIssueBody.fields,
            customfield_10884: 'INC-001', // Is an incident
            customfield_12579: null, // Missing date identified for incidents
          },
        },
      };

      expect(() =>
        AllicaJiraIssueSchemaWithTransform.parse(input)
      ).toThrowError(/Date identified required/);
    });
  });
});
