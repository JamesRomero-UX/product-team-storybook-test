import { ContributorType } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';

export const getFormConfigurationForType = {
  columns: {
    OrgKey: false,
  },
  with: {
    customAttributeSchema: {
      columns: {
        OrgKey: false,
      },
    } as const satisfies QueryConfig<'custom_attribute_schema'>,

    fields_config: {
      columns: {
        OrgKey: false,
      },
    } as const satisfies QueryConfig<'form_field_configuration'>,
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    } as const satisfies QueryConfig<'user_view_active'>,

    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    } as const satisfies QueryConfig<'user_view_active'>,
  },
} as const satisfies QueryConfig<'form_configuration'>;

export const owners = {
  owners: {
    columns: {
      OrgKey: false,
    },
    with: {
      user: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'user_view_active'>,
    },
  } as const satisfies QueryConfig<'owner'>,
  ownerGroups: {
    columns: {
      OrgKey: false,
    },
    with: {
      group: {
        columns: {
          OrgKey: false,
        },
        with: {
          users: {
            columns: {
              OrgKey: false,
            },
          } as const satisfies QueryConfig<'user_group_user'>,
        },
      } as const satisfies QueryConfig<'user_group'>,
    },
  } as const satisfies QueryConfig<'owner_group'>,
};

export const contributors = {
  contributors: {
    columns: {
      OrgKey: false,
    },
    with: {
      user: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'user_view_active'>,
    },
  } as const satisfies QueryConfig<'contributor'>,
  contributorGroups: {
    columns: {
      OrgKey: false,
    },
    with: {
      group: {
        columns: {
          OrgKey: false,
        },
        with: {
          users: {
            columns: {
              OrgKey: false,
            },
          } as const satisfies QueryConfig<'user_group_user'>,
        },
      } as const satisfies QueryConfig<'user_group'>,
    },
  } as const satisfies QueryConfig<'contributor_group'>,
};

export const ownersAndContributors = {
  ...owners,
  ...contributors,
};

export const tagsAndDepartments = {
  tags: {
    columns: {
      OrgKey: false,
    },
    with: {
      type: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'tag_type'>,
    },
  } as const satisfies QueryConfig<'tag'>,
  departments: {
    columns: {
      OrgKey: false,
    },
    with: {
      type: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'department_type'>,
    },
  } as const satisfies QueryConfig<'department'>,
};

export const scheduleAndState = {
  schedule: {
    columns: {
      OrgKey: false,
    },
  } as const satisfies QueryConfig<'schedule'>,
  scheduleState: {
    columns: {
      OrgKey: false,
    },
  } as const satisfies QueryConfig<'schedule_state'>,
};

export const relationFiles = {
  files: {
    columns: {
      OrgKey: false,
    },
    with: {
      file: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'file'>,
    },
  } as const satisfies QueryConfig<'relation_file'>,
};

export const modifiedByAndCreatedByUser = {
  modifiedByUser: {
    columns: {
      OrgKey: false,
    },
  } as const satisfies QueryConfig<'user_view_active'>,
  createdByUser: {
    columns: {
      OrgKey: false,
    },
  } as const satisfies QueryConfig<'user_view_active'>,
};

export const ancestorContributors = {
  ancestorContributors: {
    columns: {
      OrgKey: false,
    },
    with: {
      user: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'user_view_active'>,
      user_group: {
        columns: {
          OrgKey: false,
        },
      } as const satisfies QueryConfig<'user_group'>,
    },
  } as const satisfies QueryConfig<'ancestor_contributor_view'>,
};

export const schedule = {
  schedule: {
    columns: {
      Id: true,
      Frequency: true,
      ManualDueDate: true,
      StartDate: true,
      TimeToCompleteValue: true,
      TimeToCompleteUnit: true,
    },
  } as const satisfies QueryConfig<'schedule'>,
};

export const changeRequest = {
  createdBy: {
    columns: {
      FriendlyName: true,
      Id: true,
      Email: true,
    },
  } as const satisfies QueryConfig<'user_view_active'>,
  parent: {
    columns: {
      Id: true,
      SequentialId: true,
      ObjectType: true,
    },
    with: {
      ancestorContributors: {
        where: { ContributorType: ContributorType.Owner },
        columns: {
          UserId: true,
          ContributorType: true,
        },
        with: {
          user: {
            columns: {
              FriendlyName: true,
            },
          },
          user_group: {
            columns: {},
            with: {
              users: {
                columns: {
                  UserId: true,
                },
              },
            },
          },
        },
      },
      risk: {
        columns: {
          Title: true,
        },
      },
      documentFile: {
        columns: {
          Version: true,
        },
        with: {
          parent: {
            columns: {
              Id: true,
              SequentialId: true,
              Title: true,
            },
            with: {
              ancestorContributors: {
                where: { ContributorType: ContributorType.Owner },
                columns: {
                  UserId: true,
                  ContributorType: true,
                },
                with: {
                  user: {
                    columns: {
                      FriendlyName: true,
                    },
                  },
                  user_group: {
                    columns: {},
                    with: {
                      users: {
                        columns: {
                          UserId: true,
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
      acceptance: {
        columns: {
          Title: true,
        },
        with: {
          parents: {
            columns: {},
            with: {
              risk: {
                columns: {
                  Id: true,
                },
                with: {
                  ancestorContributors: {
                    where: { ContributorType: ContributorType.Owner },
                    columns: {
                      UserId: true,
                      ContributorType: true,
                    },
                    with: {
                      user: {
                        columns: {
                          FriendlyName: true,
                        },
                      },
                      user_group: {
                        columns: {},
                        with: {
                          users: {
                            columns: {
                              UserId: true,
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
        },
      },
      control: {
        columns: {
          Title: true,
        },
      },
      action: {
        columns: {
          Title: true,
        },
      },
      issue_assessment: {
        columns: {},
        with: {
          parent: {
            columns: {
              Id: true,
              SequentialId: true,
              Title: true,
            },
            with: {
              ancestorContributors: {
                where: { ContributorType: ContributorType.Owner },
                columns: {
                  UserId: true,
                  ContributorType: true,
                },
                with: {
                  user: {
                    columns: {
                      FriendlyName: true,
                    },
                  },
                  user_group: {
                    columns: {},
                    with: {
                      users: {
                        columns: {
                          UserId: true,
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
    },
  } as const satisfies QueryConfig<'node'>,
  requestedFileChanges: {
    columns: {
      ParentId: true,
      ChangeRequestFileOperation: true,
    },
    with: {
      file: {
        columns: {
          ContentType: true,
          FileName: true,
          FileSize: true,
          Id: true,
          CreatedAtTimestamp: true,
          CreatedByUser: true,
          ModifiedAtTimestamp: true,
          ModifiedByUser: true,
        },
      },
    },
  } as const satisfies QueryConfig<'relation_file'>,
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
  } as const satisfies QueryConfig<'change_request_contributor'>,
  responses: {
    columns: {
      Id: true,
      Approved: true,
      ModifiedAtTimestamp: true,
      CreatedAtTimestamp: true,
      ApprovedByUser: true,
      ApprovedAtTimestamp: true,
      Comment: true,
    },
    with: {
      approver: {
        columns: {
          Id: true,
          OwnerApprover: true,
        },
        with: {
          level: {
            columns: {
              Id: true,
              ApprovalRuleType: true,
              SequenceOrder: true,
            },
            with: {
              approval: {
                columns: {
                  Id: true,
                  ParentId: true,
                  Workflow: true,
                  InFlightEditRule: true,
                },
              },
            },
          },
          user: {
            columns: {
              FriendlyName: true,
              Email: true,
              Id: true,
            },
          },
          group: {
            columns: {
              Id: true,
              Name: true,
            },
            with: {
              users: {
                columns: {
                  UserId: true,
                },
                with: {
                  user: {
                    columns: {
                      FriendlyName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  } as const satisfies QueryConfig<'approver_response'>,
};

export const department = {
  columns: {
    ParentId: true,
    DepartmentTypeId: true,
  },
  with: {
    type: {
      columns: {
        Description: true,
        Name: true,
      },
    },
  },
} as const satisfies QueryConfig<'department'>;

export const attestationParts = {
  AttestationStatus: true,
  ExpiresAt: true,
  Active: true,
} as const;
