variable "tenants" {
  type = list(string)
  default = ["MultiTenant",
    "OctoEnergy",
    "CanaryRisk",
    "DLA",
    "MSL",
    "JenstenGroup",
    "Education",
    "sandbox",
    "rightmove",
    "pxc",
    "autotrader",
    "krakentechnologies",
    "elementisglobal",
    "skyscanner",
    "betfred",
    "petervardy",
    "admiral",
    "hodgebank",
    "dojo",
    "amberriver",
    "gfhfinancial",
    "clearstreet",
    "rslite",
    "soprasteria",
    "mkspamp",
    "argentis",
    "mortgageadvicebureau",
    "maven",
    "gousto"
  ]
}

variable "kms_key_arn" {
  description = "The ARN of the KMS key to use for encryption"
  type        = string
  default     = "arn:aws:kms:eu-west-1:179598330974:key/mrk-4ef09e5038c944bbb4589dc50be8d0b4"
}

variable "prod_backup_arn_identifiers" {
  description = "The ARN or roles of accounts to allow backups from"
  type        = string
  default     = "arn:aws:iam::826351825809:root"
}
