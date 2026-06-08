import type { QueryConfig } from '../db';
import { changeRequest } from './fragments/index';
import { changeRequest as c } from './utils';

export const getMyDueItemsChangeRequestsQueryConfig = {
  columns: {
    Id: true,
    ChangeRequestStatus: true,
    CreatedAtTimestamp: true,
    ParentId: true,
  },
  with: {
    responses: {
      columns: { Approved: true },
      with: {
        approver: {
          columns: { OwnerApprover: true },
          with: {
            level: {
              columns: {
                Id: true,
                ApprovalRuleType: true,
              },
            },
            group: {
              columns: {},
              with: {
                users: {
                  columns: {
                    UserId: true,
                  },
                },
              },
            },
            user: {
              columns: {
                Id: true,
              },
            },
          },
        },
      },
    },
    parent: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
      with: {
        risk: {
          columns: { Title: true, Id: true },
        },
        documentFile: {
          columns: { Version: true },
          with: {
            parent: {
              columns: {
                Id: true,
                Title: true,
              },
            },
          },
        },
        issue_assessment: {
          with: {
            parent: {
              columns: {
                Id: true,
                Title: true,
              },
            },
          },
        },
        acceptance: {
          columns: {
            Id: true,
            Title: true,
          },
        },

        control: {
          columns: {
            Id: true,
            Title: true,
          },
        },

        issue: {
          columns: {
            Id: true,
            Title: true,
          },
        },
        action: {
          columns: {
            Id: true,
            Title: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'change_request'>;

export const getChangeRequestsRegisterQueryConfig = {
  ...changeRequest,
  with: {
    // Parent entity relationships (from GraphQL query: parent)
    parent: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
    // Direct parent entity relationships (from GraphQL: acceptance, risk, control, action, etc.)
    acceptance: {
      columns: {
        Id: true,
        Title: true,
        SequentialId: true,
      },
      with: {
        parents: {
          columns: {},
          with: {
            risk: {
              columns: {},
              with: {
                owners: {
                  columns: {},
                  with: {
                    user: {
                      columns: {
                        Id: true,
                        FriendlyName: true,
                        Email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    document_file: {
      columns: {
        Id: true,
        Version: true,
      },
      with: {
        parent: {
          columns: {
            Id: true,
            Title: true,
            SequentialId: true,
          },
          with: {
            owners: {
              columns: {},
              with: {
                user: {
                  columns: {
                    Id: true,
                    FriendlyName: true,
                    Email: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    risk: {
      columns: {
        Id: true,
        Title: true,
        SequentialId: true,
      },
      with: {
        owners: {
          columns: {},
          with: {
            user: {
              columns: {
                Id: true,
                FriendlyName: true,
                Email: true,
              },
            },
          },
        },
      },
    },
    control: {
      columns: {
        Id: true,
        Title: true,
        SequentialId: true,
      },
      with: {
        owners: {
          columns: {},
          with: {
            user: {
              columns: {
                Id: true,
                FriendlyName: true,
                Email: true,
              },
            },
          },
        },
      },
    },
    action: {
      columns: {
        Id: true,
        Title: true,
        SequentialId: true,
      },
      with: {
        owners: {
          columns: {},
          with: {
            user: {
              columns: {
                Id: true,
                FriendlyName: true,
                Email: true,
              },
            },
          },
        },
      },
    },
    issue_assessment: {
      columns: {
        Id: true,
      },
      with: {
        parent: {
          columns: {
            Id: true,
            Title: true,
            SequentialId: true,
          },
          with: {
            owners: {
              columns: {},
              with: {
                user: {
                  columns: {
                    Id: true,
                    FriendlyName: true,
                    Email: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    // Created by user (from GraphQL: createdBy)
    createdBy: {
      columns: {
        Id: true,
        FriendlyName: true,
        Email: true,
      },
    },
    // Contributors (from GraphQL: contributors)
    contributors: {
      columns: {},
      with: {
        user: {
          columns: {
            Id: true,
            FriendlyName: true,
            Email: true,
          },
        },
      },
    },
    // Approver responses (from GraphQL: responses)
    responses: {
      columns: {
        Id: true,
        Approved: true,
        CreatedAtTimestamp: true,
        ModifiedAtTimestamp: true,
        ApprovedByUser: true,
        ApprovedAtTimestamp: true,
        Comment: true,
      },
      with: {
        // Approver details (from GraphQL: responses.approver)
        approver: {
          columns: {
            Id: true,
            OwnerApprover: true,
            UserId: true,
            UserGroupId: true,
          },
          with: {
            // Approval level (from GraphQL: responses.approver.level)
            level: {
              columns: {
                Id: true,
                ApprovalRuleType: true,
                SequenceOrder: true,
              },
              with: {
                // Approval (from GraphQL: responses.approver.level.approval)
                approval: {
                  columns: {
                    Id: true,
                    InFlightEditRule: true,
                    Workflow: true,
                  },
                },
              },
            },
            // User group (from GraphQL: responses.approver.group)
            group: {
              columns: {
                Id: true,
                Name: true,
              },
              with: {
                // Users in group (from GraphQL: responses.approver.group.users)
                users: {
                  columns: {
                    UserId: true,
                  },
                },
              },
            },
            // Direct user (from GraphQL: responses.approver.user)
            user: {
              columns: {
                Id: true,
                FriendlyName: true,
                Email: true,
              },
            },
          },
        },
      },
    },
    // Parent owners and contributors for permission checking
    // (from GraphQL: currentUserOwnerList, parentOwners)
    parentOwnerAndContributors: {
      columns: {
        UserId: true,
        ContributorType: true,
      },
      with: {
        user: {
          columns: {
            Id: true,
            FriendlyName: true,
            Email: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'change_request'>;

// Config that is extended by interface and can't have fragment spread into it
export const getPendingChangeRequestsQueryConfig = {
  columns: {
    Id: true,
    SequentialId: true,
    ParentId: true,
    Type: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
    RequestedChanges: true,
    ChangeRequestStatus: true,
    Comment: true,
    OverriddenByUser: true,
    OverriddenAtTimestamp: true,
  },
  with: {
    ...c,
  },
} as const satisfies QueryConfig<'change_request'>;
