# DR IAM Role Setup Guide

## Overview

This guide walks you through setting up the IAM roles and policies needed for disaster recovery restore operations.

## Files

| File | Purpose |
|------|---------|
| `dr-restore-role-policy.json` | IAM policy with all permissions needed for DR restores |
| `dr-restore-role.tf` | Terraform module to create roles and policies |
| `DR-IAM-SETUP.md` | This guide |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DR Account (134258997950)              │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         BackupRestoreRole                         │  │
│  │  (Used by AWS Backup Service)                     │  │
│  │                                                    │  │
│  │  Permissions:                                      │  │
│  │  ✓ Read backup vaults & recovery points          │  │
│  │  ✓ Start restore jobs                            │  │
│  │  ✓ Create/manage RDS instances                   │  │
│  │  ✓ Access KMS keys for encrypted backups         │  │
│  │  ✓ Manage VPC/security groups                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         DROperatorRole                            │  │
│  │  (Used by DevOps/SRE team)                        │  │
│  │                                                    │  │
│  │  Permissions:                                      │  │
│  │  ✓ View backup resources                         │  │
│  │  ✓ Trigger restore jobs                          │  │
│  │  ✓ PassRole to BackupRestoreRole                 │  │
│  │  ✓ View/manage RDS instances                     │  │
│  │  ✓ CloudWatch monitoring                         │  │
│  │  ✓ SNS notifications                             │  │
│  │                                                    │  │
│  │  Security:                                         │  │
│  │  ✓ Requires MFA to assume                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Option 1: Terraform (Recommended)

#### Step 1: Prepare Terraform Module

1. **Copy files to your infrastructure directory:**
   ```bash
   cp dr-restore-role.tf /path/to/infrastructure/aws/accounts/dr/eu-west-1/
   cp dr-restore-role-policy.json /path/to/infrastructure/aws/accounts/dr/eu-west-1/
   ```

2. **Update variables in `dr-restore-role.tf`:**
   ```terraform
   # Line 18: Replace with your production account ID
   identifiers = ["arn:aws:iam::YOUR_PROD_ACCOUNT_ID:root"]

   # Line 26: Change to a secure random value (generate with: openssl rand -base64 32)
   values   = ["your-secure-external-id-here"]
   ```

#### Step 2: Deploy with Terraform

```bash
cd /path/to/infrastructure/aws/accounts/dr/eu-west-1/

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the changes
terraform apply
```

#### Step 3: Verify Deployment

```bash
# Check the role was created
aws iam get-role --role-name BackupRestoreRole --profile dr

# Check the policy
aws iam get-policy --policy-arn $(aws iam list-policies --profile dr --query 'Policies[?PolicyName==`BackupRestorePolicy`].Arn' --output text) --profile dr

# List attached policies
aws iam list-attached-role-policies --role-name BackupRestoreRole --profile dr
```

### Option 2: AWS CLI (Manual)

If you can't use Terraform, here's how to set up manually:

#### Step 1: Create Trust Policy

Create `trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "backup.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Step 2: Create the Role

```bash
aws iam create-role \
  --role-name BackupRestoreRole \
  --assume-role-policy-document file://trust-policy.json \
  --description "Role for AWS Backup to restore RDS databases" \
  --profile dr
```

#### Step 3: Create and Attach Custom Policy

```bash
# Create the policy
aws iam create-policy \
  --policy-name BackupRestorePolicy \
  --policy-document file://dr-restore-role-policy.json \
  --description "Custom policy for DR restore operations" \
  --profile dr

# Get the policy ARN (save this)
POLICY_ARN=$(aws iam list-policies --profile dr \
  --query 'Policies[?PolicyName==`BackupRestorePolicy`].Arn' \
  --output text)

# Attach to role
aws iam attach-role-policy \
  --role-name BackupRestoreRole \
  --policy-arn $POLICY_ARN \
  --profile dr
```

#### Step 4: Attach AWS Managed Policies

```bash
# Attach AWS Backup service role policies
aws iam attach-role-policy \
  --role-name BackupRestoreRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup \
  --profile dr

aws iam attach-role-policy \
  --role-name BackupRestoreRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores \
  --profile dr
```

## Permissions Breakdown

### BackupRestoreRole Permissions

#### AWS Backup Operations
- ✅ List and describe backup vaults
- ✅ List recovery points
- ✅ Start and monitor restore jobs
- ✅ Manage backup vault policies

#### RDS Operations
- ✅ Restore from snapshots
- ✅ Create new DB instances/clusters
- ✅ Modify DB instances/clusters
- ✅ Delete DB instances/clusters (for cleanup)
- ✅ Manage DB snapshots
- ✅ Tag RDS resources

#### Networking (EC2)
- ✅ Describe VPCs, subnets, security groups
- ✅ Create/modify security groups
- ✅ Manage network ACLs

#### KMS (Encryption)
- ✅ Decrypt backup data
- ✅ Create KMS grants for RDS
- ✅ Describe KMS keys

#### Monitoring & Logging
- ✅ CloudWatch Logs (RDS logs)
- ✅ CloudWatch Metrics (monitoring)
- ✅ SNS notifications

#### Other
- ✅ IAM PassRole (for RDS service roles)
- ✅ Secrets Manager (for credentials)

### DROperatorRole Permissions

#### Operator Access
- ✅ View all backup resources
- ✅ Trigger restore jobs
- ✅ Pass BackupRestoreRole to AWS Backup
- ✅ View and manage RDS instances
- ✅ CloudWatch monitoring
- ✅ Send SNS notifications

#### Security Controls
- 🔒 Requires MFA to assume role
- 🔒 Can only pass specific roles
- 🔒 Limited to DR-related SNS topics

## Testing the Setup

### Test 1: Verify Role Can Be Assumed

```bash
# Assume the BackupRestoreRole
aws sts assume-role \
  --role-arn arn:aws:iam::134258997950:role/BackupRestoreRole \
  --role-session-name test-session \
  --profile dr
```

### Test 2: List Recovery Points

```bash
# Using the role
aws backup list-recovery-points-by-backup-vault \
  --backup-vault-name tenant-a-dr-backup-vault \
  --region eu-west-1 \
  --profile dr
```

### Test 3: Describe RDS Instances

```bash
aws rds describe-db-instances \
  --region eu-west-1 \
  --profile dr
```

### Test 4: Run Dry-Run Restore

```bash
# This should show what permissions would be needed
./dr-restore-full.sh tenant-a test-db --dry-run
```

## Updating the DR Scripts

Update the scripts to use the correct role ARN:

### Update dr-restore-full.sh

Find this line:
```bash
IAM_ROLE_ARN="arn:aws:iam::${DR_ACCOUNT_ID}:role/BackupRestoreRole"
```

If you used a different role name, update it accordingly.

### Update dr-test.sh

Same change - verify the role ARN matches.

## Security Best Practices

### 1. MFA Requirement

For production, require MFA when assuming DROperatorRole:

```json
{
  "Condition": {
    "Bool": {
      "aws:MultiFactorAuthPresent": "true"
    }
  }
}
```

### 2. Least Privilege

The policy grants only what's needed for DR operations. Review and adjust based on your specific requirements.

### 3. External ID for Cross-Account

If allowing cross-account access, use a secure external ID:

```bash
# Generate a secure external ID
openssl rand -base64 32
```

Store this securely (e.g., in AWS Secrets Manager) and use it when assuming the role.

### 4. Audit Logging

Enable CloudTrail logging for all IAM and Backup API calls:

```bash
aws cloudtrail create-trail \
  --name dr-audit-trail \
  --s3-bucket-name your-cloudtrail-bucket \
  --profile dr

aws cloudtrail start-logging \
  --name dr-audit-trail \
  --profile dr
```

### 5. Resource Tagging

Tag all restored resources:

```bash
# The scripts automatically tag with:
# - Purpose: DisasterRecovery
# - RestoredBy: BackupRestoreRole
# - RestoredAt: <timestamp>
```

## Troubleshooting

### Issue: "Access Denied" when starting restore

**Cause**: Missing permissions in IAM policy

**Solution**:
```bash
# Check which permission is missing from CloudTrail
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=StartRestoreJob \
  --profile dr \
  --query 'Events[0].CloudTrailEvent' \
  --output text | jq
```

### Issue: "Cannot pass role to service"

**Cause**: Missing `iam:PassRole` permission

**Solution**: Verify the PassRole statement in the policy:
```json
{
  "Sid": "IAMPassRoleForRDS",
  "Effect": "Allow",
  "Action": ["iam:PassRole"],
  "Resource": ["arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/*"],
  "Condition": {
    "StringEquals": {
      "iam:PassedToService": ["rds.amazonaws.com"]
    }
  }
}
```

### Issue: "KMS key not accessible"

**Cause**: Missing KMS permissions or key policy

**Solution**: Update KMS key policy to allow the role:
```bash
# Get the KMS key policy
aws kms get-key-policy \
  --key-id <key-id> \
  --policy-name default \
  --profile dr

# Add the BackupRestoreRole to the key policy
```

## Monitoring Role Usage

### CloudWatch Metrics

Monitoring is configured via Terraform in the production account (see [backup-monitoring.tf](../aws/accounts/prod/eu-west-2/backup-monitoring.tf)).

### CloudTrail Queries

Query role assumptions:

```bash
# List all assume role events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --profile dr \
  --query 'Events[?contains(CloudTrailEvent, `BackupRestoreRole`)]'
```

## Cost Considerations

The IAM role itself has no cost, but be aware of:

- **RDS Instances**: Restored databases incur standard RDS charges
- **Backup Storage**: Recovery points in backup vaults
- **Data Transfer**: Cross-region restores (if applicable)
- **CloudWatch**: Logs and metrics storage

## Cleanup

To remove the IAM resources:

### Terraform

```bash
terraform destroy
```

### AWS CLI

```bash
# Detach policies
aws iam detach-role-policy \
  --role-name BackupRestoreRole \
  --policy-arn arn:aws:iam::134258997950:policy/BackupRestorePolicy \
  --profile dr

# Delete custom policy
aws iam delete-policy \
  --policy-arn arn:aws:iam::134258997950:policy/BackupRestorePolicy \
  --profile dr

# Delete role
aws iam delete-role \
  --role-name BackupRestoreRole \
  --profile dr
```

## Next Steps

After setting up the IAM role:

1. ✅ Test with a dry-run restore
2. ✅ Run a full DR test
3. ✅ Update runbook with role ARNs
4. ✅ Train team on assuming roles
5. ✅ Setup CloudTrail auditing
6. ✅ Configure CloudWatch alarms

## Additional Resources

- [AWS Backup IAM Roles](https://docs.aws.amazon.com/aws-backup/latest/devguide/iam-service-roles.html)
- [RDS Restore Permissions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAM.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

**Last Updated**: February 2026
**Maintained by**: DevOps Team
