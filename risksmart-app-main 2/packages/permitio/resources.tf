resource "permitio_resource" "internal_audit_report" {
  name        = "internal_audit_report"
  description = ""
  key         = "internal_audit_report"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "document_file" {
  name        = "document_file"
  description = ""
  key         = "document_file"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings" {
  name        = "settings"
  description = ""
  key         = "settings"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "action" {
  name        = "action"
  description = ""
  key         = "action"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "risk_assessment_result" {
  name        = "risk_assessment_result"
  description = ""
  key         = "risk_assessment_result"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "contributor_group" {
  name        = "contributor_group"
  description = ""
  key         = "contributor_group"

  actions = {
    "insert" = {
      name = "insert"
    },
    "delete" = {
      name = "delete"
    },
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "custom_datasource" {
  name        = "custom_datasource"
  description = ""
  key         = "custom_datasource"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "questionnaire_template" {
  name        = "questionnaire_template"
  description = ""
  key         = "questionnaire_template"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "data_import" {
  name        = "data_import"
  description = ""
  key         = "data_import"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "indicator_result" {
  name        = "indicator_result"
  description = ""
  key         = "indicator_result"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "audit" {
  name        = "audit"
  description = ""
  key         = "audit"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "department_type" {
  name        = "department_type"
  description = ""
  key         = "department_type"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "taxonomy" {
  name        = "taxonomy"
  description = ""
  key         = "taxonomy"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "rs_node" {
  name        = "rs_node"
  description = ""
  key         = "rs_node"

  actions = {
    "insert" = {
      name = "insert"
    },
    "delete" = {
      name = "delete"
    },
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    }
  }
  attributes = {
    "ObjectType" = {
      name = "Object Type"
      type = "string"
    }
  }
}
resource "permitio_resource" "public_issue_form" {
  name        = "public_issue_form"
  description = ""
  key         = "public_issue_form"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "questionnaire_template_version" {
  name        = "questionnaire_template_version"
  description = ""
  key         = "questionnaire_template_version"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "attestation_record" {
  name        = "attestation_record"
  description = ""
  key         = "attestation_record"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "tag_type" {
  name        = "tag_type"
  description = ""
  key         = "tag_type"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "owner_group" {
  name        = "owner_group"
  description = ""
  key         = "owner_group"

  actions = {
    "insert" = {
      name = "insert"
    },
    "delete" = {
      name = "delete"
    },
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "assessment_activity" {
  name        = "assessment_activity"
  description = ""
  key         = "assessment_activity"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "risk_tier_1" {
  name        = "risk_tier_1"
  description = ""
  key         = "risk_tier_1"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "issue_assessment" {
  name        = "issue_assessment"
  description = ""
  key         = "issue_assessment"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "obligation" {
  name        = "obligation"
  description = ""
  key         = "obligation"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "impact" {
  name        = "impact"
  description = ""
  key         = "impact"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "custom_attribute_schema" {
  name        = "custom_attribute_schema"
  description = ""
  key         = "custom_attribute_schema"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "compliance_monitoring_assessment" {
  name        = "compliance_monitoring_assessment"
  description = ""
  key         = "compliance_monitoring_assessment"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "obligation_assessment_result" {
  name        = "obligation_assessment_result"
  description = ""
  key         = "obligation_assessment_result"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "appetite" {
  name        = "appetite"
  description = ""
  key         = "appetite"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "public_policies" {
  name        = "public_policies"
  description = ""
  key         = "public_policies"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "control_group" {
  name        = "control_group"
  description = ""
  key         = "control_group"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "third_party_response" {
  name        = "third_party_response"
  description = ""
  key         = "third_party_response"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "third_party" {
  name        = "third_party"
  description = ""
  key         = "third_party"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_tags" {
  name        = "settings_tags"
  description = ""
  key         = "settings_tags"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "acceptance" {
  name        = "acceptance"
  description = ""
  key         = "acceptance"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "risk" {
  name        = "risk"
  description = ""
  key         = "risk"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "enterprise_risk" {
  name        = "enterprise_risk"
  description = ""
  key         = "enterprise_risk"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "assessment" {
  name        = "assessment"
  description = ""
  key         = "assessment"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "organisation_module" {
  name        = "organisation_module"
  description = ""
  key         = "organisation_module"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "my_items" {
  name        = "my_items"
  description = ""
  key         = "my_items"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "action_update" {
  name        = "action_update"
  description = ""
  key         = "action_update"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "conversation" {
  name        = "conversation"
  description = ""
  key         = "conversation"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "report" {
  name        = "report"
  description = ""
  key         = "report"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "user_group" {
  name        = "user group"
  description = ""
  key         = "user_group"

  actions = {
    "insert" = {
      name = "insert"
    },
    "delete" = {
      name = "delete"
    },
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_users" {
  name        = "settings_users"
  description = ""
  key         = "settings_users"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "entity" {
  name        = "entity"
  description = ""
  key         = "entity"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "dashboard" {
  name        = "dashboard"
  description = ""
  key         = "dashboard"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "obligation_impact" {
  name        = "obligation_impact"
  description = ""
  key         = "obligation_impact"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "issue" {
  name        = "issue"
  description = ""
  key         = "issue"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "notification" {
  name        = "notification"
  description = ""
  key         = "notification"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "organisation_dashboard" {
  name        = "organisation_dashboard"
  description = ""
  key         = "organisation_dashboard"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "test_result" {
  name        = "test_result"
  description = ""
  key         = "test_result"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "document" {
  name        = "document"
  description = ""
  key         = "document"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_audit" {
  name        = "settings_audit"
  description = ""
  key         = "settings_audit"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_approvals" {
  name        = "settings_approvals"
  description = ""
  key         = "settings_approvals"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "custom_ribbon" {
  name        = "custom_ribbon"
  description = ""
  key         = "custom_ribbon"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "internal_audit_entity" {
  name        = "internal_audit_entity"
  description = ""
  key         = "internal_audit_entity"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "document_assessment_result" {
  name        = "document_assessment_result"
  description = ""
  key         = "document_assessment_result"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "change_request" {
  name        = "change_request"
  description = ""
  key         = "change_request"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_module" {
  name        = "settings_module"
  description = ""
  key         = "settings_module"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_user_groups" {
  name        = "settings_user_groups"
  description = ""
  key         = "settings_user_groups"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "business_area" {
  name        = "business_area"
  description = ""
  key         = "business_area"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "control" {
  name        = "control"
  description = ""
  key         = "control"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "user_tab_preference" {
  name        = "user_tab_preference"
  description = ""
  key         = "user_tab_preference"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "settings_departments" {
  name        = "settings_departments"
  description = ""
  key         = "settings_departments"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "approval_result" {
  name        = "approval_result"
  description = ""
  key         = "approval_result"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "organisation_tab_preference" {
  name        = "organisation_tab_preference"
  description = ""
  key         = "organisation_tab_preference"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "multi_reporting" {
  name        = "multi_reporting"
  description = ""
  key         = "multi_reporting"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "impact_rating" {
  name        = "impact_rating"
  description = ""
  key         = "impact_rating"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "issue_assessment_audit" {
  name        = "issue_assessment_audit"
  description = ""
  key         = "issue_assessment_audit"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "aggregation_org" {
  name        = "aggregation_org"
  description = ""
  key         = "aggregation_org"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "indicator" {
  name        = "indicator"
  description = ""
  key         = "indicator"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "cause" {
  name        = "cause"
  description = ""
  key         = "cause"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "linked_item" {
  name        = "linked_item"
  description = ""
  key         = "linked_item"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "consequence" {
  name        = "consequence"
  description = ""
  key         = "consequence"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "issue_update" {
  name        = "issue_update"
  description = ""
  key         = "issue_update"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "data_export" {
  name        = "data_export"
  description = ""
  key         = "data_export"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "scim_configuration" {
  name        = "scim_configuration"
  description = ""
  key         = "scim_configuration"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}
resource "permitio_resource" "colour_palette" {
  name        = "colour_palette"
  description = ""
  key         = "colour_palette"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "custom_role" {
  name        = "custom_role"
  description = ""
  key         = "custom_role"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "permit_sync" {
  name        = "permit_sync"
  description = ""
  key         = "permit_sync"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "attestation_cycle" {
  name        = "attestation_cycle"
  description = ""
  key         = "attestation_cycle"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "external_api" {
  name        = "external_api"
  description = ""
  key         = "external_api"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "obligation_change" {
  name        = "obligation_change"
  description = ""
  key         = "obligation_change"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "obligation_change_attestation" {
  name        = "obligation_change_attestation"
  description = ""
  key         = "obligation_change_attestation"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}

# Form Configuration Resources (RBAC-based form config management)
resource "permitio_resource" "risk_form_configuration" {
  name        = "risk_form_configuration"
  description = "Form configuration for risk domain entities"
  key         = "risk_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "control_form_configuration" {
  name        = "control_form_configuration"
  description = "Form configuration for control domain entities"
  key         = "control_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "control_group_form_configuration" {
  name        = "control_group_form_configuration"
  description = "Form configuration for control group entities"
  key         = "control_group_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "issue_form_configuration" {
  name        = "issue_form_configuration"
  description = "Form configuration for issue domain entities"
  key         = "issue_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "action_form_configuration" {
  name        = "action_form_configuration"
  description = "Form configuration for action domain entities"
  key         = "action_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "policy_form_configuration" {
  name        = "policy_form_configuration"
  description = "Form configuration for policy/document domain entities"
  key         = "policy_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "compliance_form_configuration" {
  name        = "compliance_form_configuration"
  description = "Form configuration for compliance domain entities"
  key         = "compliance_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "indicator_form_configuration" {
  name        = "indicator_form_configuration"
  description = "Form configuration for indicator domain entities"
  key         = "indicator_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "assessment_form_configuration" {
  name        = "assessment_form_configuration"
  description = "Form configuration for assessment domain entities"
  key         = "assessment_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "compliance_monitoring_assessment_form_configuration" {
  name        = "compliance_monitoring_assessment_form_configuration"
  description = "Form configuration for compliance monitoring assessment entities"
  key         = "compliance_monitoring_assessment_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "internal_audit_entity_form_configuration" {
  name        = "internal_audit_entity_form_configuration"
  description = "Form configuration for internal audit entity domain"
  key         = "internal_audit_entity_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "internal_audit_report_form_configuration" {
  name        = "internal_audit_report_form_configuration"
  description = "Form configuration for internal audit report domain"
  key         = "internal_audit_report_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "third_party_form_configuration" {
  name        = "third_party_form_configuration"
  description = "Form configuration for third party domain entities"
  key         = "third_party_form_configuration"

  actions = {
    "update" = {
      name = "update"
    }
  }
  attributes = {
  }
}

resource "permitio_resource" "sso_configuration" {
  name        = "sso_configuration"
  description = "Used by self serve SSO to save congiguration details"
  key         = "sso_configuration"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}


resource "permitio_resource" "ingestion_config" {
  name        = "ingestion_config"
  description = ""
  key         = "ingestion_config"

  actions = {
    "read" = {
      name = "read"
    },
    "update" = {
      name = "update"
    },
    "delete" = {
      name = "delete"
    },
    "insert" = {
      name = "insert"
    }
  }
  attributes = {
  }
}