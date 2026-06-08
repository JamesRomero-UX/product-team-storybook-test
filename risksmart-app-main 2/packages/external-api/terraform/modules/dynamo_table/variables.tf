variable "table_name" {
  description = "The dynamoDB table name"
  type        = string
}

variable "point_in_time_recovery" {
  description = "Enable point-in-time recovery for table"
  type        = bool
  default     = true
}

variable "enable_table_backup" {
  description = "Add table backup vault and plan"
  type        = bool
  default     = true
}

variable "prevent_destroy" {
  description = "Protect the table from destroy"
  type        = bool
  default     = true
}

variable "partition_key" {
  description = "Partition key for table"
  type = object({
    name       = string
    value_type = string
  })
  # Ensure value_type is one of S, N, B
  validation {
    condition     = contains(["S", "N", "B"], var.partition_key.value_type)
    error_message = "partition_key.value_type must be one of: S, N, or B."
  }

  # Ensure name isn't empty/whitespace
  validation {
    condition     = length(var.partition_key.name) > 0
    error_message = "partition_key.name cannot be empty."
  }
}

variable "sort_key" {
  description = "Sort key for table (optional)"
  type = object({
    name       = string
    value_type = string
  })
  default = null

  # Ensure value_type is one of S, N, B (only if sort_key is provided)
  validation {
    condition     = var.sort_key == null || contains(["S", "N", "B"], var.sort_key.value_type)
    error_message = "sort_key.value_type must be one of: S, N, or B."
  }

  # Ensure name isn't empty/whitespace (only if sort_key is provided)
  validation {
    condition     = var.sort_key == null || length(var.sort_key.name) > 0
    error_message = "sort_key.name cannot be empty."
  }
}

# New: list of GSIs to create (one block per item)
variable "gsi" {
  description = "List of Global Secondary Indexes to create."
  type = list(object({
    name               = string
    hash_key_name      = string
    hash_key_type      = string
    range_key_name     = optional(string)
    range_key_type     = optional(string)
    projection_type    = optional(string)       # ALL | KEYS_ONLY | INCLUDE
    non_key_attributes = optional(list(string)) # required if projection_type = INCLUDE
  }))
  default = []
}

variable "ttl_attribute_name" {
  description = "The name of the table attribute to store the TTL timestamp (optional). If provided, TTL will be enabled."
  type        = string
  default     = null
}

variable "tags" {
  description = "Additional tags to apply to resources (merged with provider default_tags)"
  type        = map(string)
  default     = {}
}