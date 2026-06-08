# Disaster Recovery Runbook

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Overview](#overview)
3. [Prerequisites](#prerequisites)
4. [DR Scripts](#dr-scripts)
5. [Emergency Restore Procedure](#emergency-restore-procedure)
6. [Scheduled DR Testing](#scheduled-dr-testing)
7. [Backup Validation](#backup-validation)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)
10. [Contact Information](#contact-information)

---

## Quick Reference

### Common Commands

```bash
# Interactive menu (easiest way to perform DR operations)
./dr-helper.sh <tenant-name>

# Check backup health
./dr-backup-validation.sh <tenant-name>

# Run DR test with auto-cleanup
./dr-test.sh <tenant-name>

# Emergency restore (dry-run first!)
./dr-restore-full.sh <tenant-name> <new-db-id> --dry-run
./dr-restore-full.sh <tenant-name> <new-db-id>

# List available recovery points
aws --profile dr backup list-recovery-points-by-backup-vault \
  --backup-vault-name <tenant-name>-dr-backup-vault \
  --region eu-west-1
```

### Script Usage Summary

| Script | Purpose | Command |
|--------|---------|---------|
| `dr-helper.sh` | Interactive menu for all operations | `./dr-helper.sh <tenant>` |
| `dr-restore-full.sh` | Production database restore | `./dr-restore-full.sh <tenant> <db-id>` |
| `dr-test.sh` | Automated DR testing | `./dr-test.sh <tenant>` |
| `dr-backup-validation.sh` | Backup health checks | `./dr-backup-validation.sh <tenant>` |

---

## Overview

This runbook provides comprehensive procedures for disaster recovery (DR) operations for the RiskSmart application. The DR infrastructure uses AWS Backup to create cross-account backups of RDS databases to a dedicated DR account.

### Architecture
- **Production Account**: Primary RDS databases with automated backups
- **DR Account** (ID: 134258997950): Cross-account backup vault in eu-west-1
- **Backup Frequency**: Daily (configurable in backup policy)
- **Retention**: As configured in backup plan
- **RTO** (Recovery Time Objective): ~2-4 hours
- **RPO** (Recovery Point Objective): 24 hours (daily backups)

---

## Prerequisites

### Required Tools
- AWS CLI (configured with appropriate profiles)
- `jq` for JSON parsing
- Bash 4.0 or higher
- `psql` or `mysql` client (for connectivity testing)

### AWS Profiles
Ensure you have the following AWS CLI profiles configured:

```bash
# ~/.aws/config
[profile dr]
region = eu-west-1
output = json

[profile prod]
region = us-east-1
output = json
```

### Required Permissions
- `backup:ListRecoveryPointsByBackupVault`
- `backup:StartRestoreJob`
- `backup:DescribeRestoreJob`
- `rds:DescribeDBInstances`
- `rds:CreateDBInstance`
- `iam:PassRole` (for BackupRestoreRole)

### Verify Setup
```bash
# Test DR account access
aws --profile dr sts get-caller-identity

# List available backup vaults
aws --profile dr backup list-backup-vaults --region eu-west-1
```

---

## DR Scripts

### 1. dr-restore-full.sh
**Purpose**: Full database restore with monitoring and validation

**Usage**:
```bash
./dr-restore-full.sh <tenant-name> <new-db-identifier> [options]
```

**Options**:
- `--dry-run`: Simulate the restore without executing
- `--skip-validation`: Skip post-restore validation
- `--auto-approve`: Skip confirmation prompt
- `--target-time "YYYY-MM-DDTHH:MM:SSZ"`: Restore to specific point in time

**Examples**:
```bash
# Standard restore
./dr-restore-full.sh tenantname restored-tenantname-db

# Dry run to test
./dr-restore-full.sh tenantname test-db --dry-run

# Automated restore (for scripts)
./dr-restore-full.sh tenantname restored-db --auto-approve

# Point-in-time restore
./dr-restore-full.sh tenantname restored-db --target-time "2024-01-15T10:30:00Z"
```

### 2. dr-test.sh
**Purpose**: DR drill/test with automatic cleanup

**Usage**:
```bash
./dr-test.sh <tenant-name> [--keep-resources]
```

**Examples**:
```bash
# Run DR test (auto-cleanup)
./dr-test.sh tenantname

# Run test and keep resources for inspection
./dr-test.sh tenantname --keep-resources
```

### 3. dr-backup-validation.sh
**Purpose**: Validate backup health and compliance

**Usage**:
```bash
./dr-backup-validation.sh <tenant-name>
```

**Examples**:
```bash
# Check backup status
./dr-backup-validation.sh tenantname

# Run for all tenants (script this)
for tenant in tenantname tenant-b tenant-c; do
  ./dr-backup-validation.sh "$tenant"
done
```

### 4. dr-helper.sh
**Purpose**: Interactive menu for all DR operations

**Usage**:
```bash
./dr-helper.sh <tenant-name>
```

**Examples**:
```bash
# Launch interactive menu for tenantname
./dr-helper.sh tenantname

# Menu provides options for:
# - Check Backup Status
# - Run DR Test
# - Emergency Restore
# - List Recovery Points
# - Get Database Endpoint
# - Delete Test Database
# - Setup Monitoring
# - Generate Report
# - View Recent Logs
```

**When to use**:
- Team members unfamiliar with command-line options
- Quick access to common DR operations
- Guided workflows with confirmation prompts
- Reduced risk of command-line errors

---

## Emergency Restore Procedure

### Scenario: Production Database Failure

**Timeline**: 2-4 hours to full restore

#### Phase 1: Assessment (15 minutes)

1. **Confirm the incident**
   - Verify database is truly unavailable
   - Check AWS RDS console/CloudWatch
   - Document incident start time

2. **Identify affected tenant(s)**
   ```bash
   TENANT_NAME="tenantname"  # Replace with actual tenant
   ```

3. **Validate backup availability**
   ```bash
   ./dr-backup-validation.sh ${TENANT_NAME}
   ```

   If this fails, escalate immediately.

#### Phase 2: Restore Initiation (10 minutes)

1. **Choose new DB identifier**
   ```bash
   NEW_DB_ID="restored-${TENANT_NAME}-$(date +%Y%m%d-%H%M)"
   ```

2. **Review restore plan (dry run)**
   ```bash
   ./dr-restore-full.sh ${TENANT_NAME} ${NEW_DB_ID} --dry-run
   ```

3. **Initiate restore**
   ```bash
   ./dr-restore-full.sh ${TENANT_NAME} ${NEW_DB_ID}
   ```

   Review the plan and type `yes` when prompted.

#### Phase 3: Monitoring (90-180 minutes)

The script will automatically monitor the restore job. Monitor logs:

```bash
tail -f /tmp/dr-restore-logs/restore-*.log
```

**Expected timeline**:
- Small database (<10GB): 30-60 minutes
- Medium database (10-100GB): 60-120 minutes
- Large database (>100GB): 120+ minutes

#### Phase 4: Validation (30 minutes)

1. **Verify database is available**
   ```bash
   aws --profile dr rds describe-db-instances \
     --db-instance-identifier ${NEW_DB_ID} \
     --region eu-west-1 \
     --query 'DBInstances[0].DBInstanceStatus'
   ```

2. **Get endpoint**
   ```bash
   ENDPOINT=$(aws --profile dr rds describe-db-instances \
     --db-instance-identifier ${NEW_DB_ID} \
     --region eu-west-1 \
     --query 'DBInstances[0].Endpoint.Address' \
     --output text)

   echo "Database endpoint: ${ENDPOINT}"
   ```

3. **Test connectivity**
   ```bash
   # PostgreSQL
   psql -h ${ENDPOINT} -U your_user -d your_database -c "SELECT version();"

   # MySQL
   mysql -h ${ENDPOINT} -u your_user -p -e "SELECT VERSION();"
   ```

4. **Verify data integrity**
   - Run application smoke tests
   - Check row counts in critical tables
   - Verify recent transactions exist

#### Phase 5: Application Cutover (30 minutes)

1. **Update DNS/connection strings**
   - Update application configuration
   - Point to new endpoint
   - Update load balancer if applicable

2. **Restart application services**
   ```bash
   # Example for ECS
   aws ecs update-service \
     --cluster your-cluster \
     --service your-service \
     --force-new-deployment
   ```

3. **Monitor application health**
   - Check application logs
   - Verify user transactions
   - Monitor error rates

4. **Update monitoring/alerting**
   - Update CloudWatch alarms
   - Update Datadog monitors
   - Update on-call dashboards

#### Phase 6: Post-Incident (60 minutes)

1. **Document incident**
   - Restore report in `/tmp/dr-restore-logs/`
   - Timeline of events
   - Root cause (if known)

2. **Communicate status**
   - Notify stakeholders
   - Update status page
   - Schedule post-mortem

3. **Plan original database handling**
   - Investigate root cause
   - Decide on deletion/retention
   - Update billing/cost tracking

---

## Cross-Account Restore Procedures

### Scenario 2: Single Tenant Data Recovery (DR → Production)

**When to use**: Data corruption or accidental deletion in production, need to restore from DR backup to production account

**Timeline**: 2-4 hours to restore

#### Procedure

1. **Assess the situation**
   ```bash
   TENANT_NAME="tenant-a"  # Replace with affected tenant
   ```

2. **Validate DR backup availability**
   ```bash
   ./dr-backup-validation.sh ${TENANT_NAME}
   ```

   Verify backups exist and are recent enough for recovery.

3. **Choose restore target database identifier**
   ```bash
   NEW_DB_ID="restored-${TENANT_NAME}-$(date +%Y%m%d-%H%M)"
   ```

4. **Review restore plan (dry-run)**
   ```bash
   ./dr-restore-full.sh ${TENANT_NAME} ${NEW_DB_ID} \
     --target-account prod \
     --dry-run
   ```

   Review the output carefully before proceeding.

5. **Execute restore to production**
   ```bash
   ./dr-restore-full.sh ${TENANT_NAME} ${NEW_DB_ID} \
     --target-account prod
   ```

   **IMPORTANT**: This creates the database in the **production account** (eu-west-2), NOT in DR.

6. **Monitor restore progress**
   - Script provides real-time progress monitoring
   - Check logs in `/tmp/dr-restore-logs/`
   - Expected duration: 30-180 minutes depending on database size

7. **Validate restored database**
   ```bash
   # Get database endpoint
   ENDPOINT=$(aws --profile prod rds describe-db-instances \
     --db-instance-identifier ${NEW_DB_ID} \
     --region eu-west-2 \
     --query 'DBInstances[0].Endpoint.Address' \
     --output text)

   echo "Restored database endpoint: ${ENDPOINT}"
   ```

8. **Verify data integrity**
   - Connect to database and run queries
   - Check row counts in critical tables
   - Verify data is from expected restore point
   - Run application smoke tests

9. **Application cutover**
   - Update application configuration to point to restored database
   - Restart application services
   - Monitor for errors

10. **Post-recovery cleanup**
    - Document incident and recovery steps
    - Investigate root cause of data corruption
    - Plan deletion of corrupted database (after investigation)

### Scenario 4: Rollback from DR to Production

**When to use**: After DR failover, production region is recovered and you need to move back

**Timeline**: 3-5 hours (includes data synchronization planning)

#### Procedure

1. **Assess data freshness**
   ```bash
   # Identify what data was written to DR during failover
   # This requires application-level analysis
   ```

2. **Plan data synchronization**
   - Identify transactions written to DR database during failover
   - Plan how to merge/replay these transactions in production
   - Consider using database logical replication or ETL

3. **Create synchronized backup**
   If significant data was written to DR:
   ```bash
   # Create snapshot of DR database
   aws --profile dr rds create-db-snapshot \
     --db-instance-identifier dr-active-db \
     --db-snapshot-identifier final-dr-snapshot-$(date +%Y%m%d) \
     --region eu-west-1
   ```

4. **Restore to production**
   ```bash
   TENANT_NAME="tenant-a"
   ROLLBACK_DB_ID="rollback-${TENANT_NAME}-$(date +%Y%m%d)"

   # Use latest DR backup (which includes DR-period data)
   ./dr-restore-full.sh ${TENANT_NAME} ${ROLLBACK_DB_ID} \
     --target-account prod
   ```

5. **Validate rollback database**
   - Verify all DR-period data is present
   - Run data integrity checks
   - Compare with DR database if still running

6. **Application cutover back to production**
   - Schedule maintenance window
   - Update DNS/connection strings to production database
   - Restart application services
   - Monitor application health and error rates

7. **Decommission DR resources**
   - Keep DR database for 7 days for forensics
   - Delete temporary databases
   - Update monitoring to point back to production
   - Document lessons learned

### Comparison: DR vs Production Restore

| Aspect | Restore to DR (`--target-account dr`) | Restore to Production (`--target-account prod`) |
|--------|----------------------------------------|-------------------------------------------------|
| **Use Case** | DR testing, temporary failover | Data recovery, production rollback |
| **Target Region** | eu-west-1 (DR) | eu-west-2 (Production) |
| **AWS Profile** | `dr` | `prod` |
| **IAM Role** | BackupRestoreRole (DR account) | BackupRestoreRole (Production account) |
| **Impact** | No production impact | Requires application cutover |
| **Cleanup** | Delete after testing | Becomes new production database |

### Important Notes

**Security Considerations:**
- Cross-account restore requires proper IAM roles in both accounts
- Ensure production BackupRestoreRole exists (deployed via Terraform)
- DR vault policy must allow production to read recovery points
- All restore operations are logged in CloudTrail

**Cost Considerations:**
- Restored databases incur standard RDS charges
- Data transfer between regions may incur charges
- Plan to delete temporary/test databases promptly

**Testing Recommendations:**
- Test cross-account restore quarterly
- Use non-production tenant for testing
- Document restore times for capacity planning

---

## Scheduled DR Testing

### Monthly DR Drill

**Schedule**: First Monday of each month at 10:00 AM UTC

**Procedure**:

1. **Select test tenant**
   ```bash
   TEST_TENANT="tenant-test"  # Use a dedicated test tenant
   ```

2. **Run DR test**
   ```bash
   ./dr-test.sh ${TEST_TENANT}
   ```

3. **Document results**
   - Save logs
   - Note any issues
   - Update runbook if needed

4. **Review metrics**
   - Restore duration
   - Any errors encountered
   - Backup age and size

### Quarterly Full DR Exercise

**Schedule**: First week of each quarter

**Procedure**:

1. **Full production-like restore**
   - Select production-sized tenant
   - Restore to DR region
   - Validate data integrity

2. **Application validation**
   - Deploy application to DR region
   - Run full test suite
   - Validate user workflows

3. **Documentation review**
   - Update runbook
   - Verify contact information
   - Review escalation procedures

4. **Team training**
   - Walk through procedures
   - Practice incident response
   - Update team knowledge

---

## Backup Validation

### Daily Automated Checks

**Setup cron job**:
```bash
# Add to crontab
0 9 * * * /path/to/dr-backup-validation.sh tenantname >> /var/log/dr-backup-validation.log 2>&1
```

### Weekly Manual Review

1. **Check all tenants**
   ```bash
   for tenant in tenantname tenant-b tenant-c; do
     echo "Checking ${tenant}..."
     ./dr-backup-validation.sh "${tenant}"
   done
   ```

2. **Review backup sizes**
   - Confirm sizes are consistent
   - Investigate significant changes
   - Verify growth trends

3. **Test restore (random tenant)**
   ```bash
   # Randomly select a tenant
   RANDOM_TENANT=$(echo "tenantname tenant-b tenant-c" | tr ' ' '\n' | shuf | head -1)
   ./dr-test.sh ${RANDOM_TENANT}
   ```

### Monitoring Integration

**CloudWatch Alarms**:
- Alert if backup job fails
- Alert if no backup in 26 hours
- Alert if backup size decreases significantly

**Datadog Monitors**:
```bash
# Example Datadog monitor query
# See infrastructure/datadog/monitor-backups.tf
```

---

## Rollback Procedures

### Scenario: Restored Database Has Issues

If the restored database has data corruption or other issues:

1. **Identify alternative recovery point**
   ```bash
   aws --profile dr backup list-recovery-points-by-backup-vault \
     --backup-vault-name ${TENANT_NAME}-dr-backup-vault \
     --region eu-west-1
   ```

2. **Initiate restore from older backup**
   ```bash
   ./dr-restore-full.sh ${TENANT_NAME} ${NEW_DB_ID_V2} \
     --target-time "2024-01-14T10:00:00Z"
   ```

3. **Delete failed restore**
   ```bash
   aws --profile dr rds delete-db-instance \
     --db-instance-identifier ${FAILED_DB_ID} \
     --skip-final-snapshot \
     --region eu-west-1
   ```

### Scenario: Need to Return to Production DB

If production database becomes available again:

1. **Verify production database health**
   ```bash
   aws --profile prod rds describe-db-instances \
     --db-instance-identifier prod-${TENANT_NAME}-db \
     --region us-east-1
   ```

2. **Compare data freshness**
   - Check latest transaction timestamps
   - Identify data written to DR database
   - Plan data synchronization if needed

3. **Cutover back to production**
   - Update connection strings
   - Restart application
   - Monitor for issues

4. **Clean up DR database**
   - Keep for forensics initially
   - Delete after investigation complete

---

## Troubleshooting

### Issue: No Recovery Points Found

**Symptoms**:
```
ERROR: No recovery points found in vault tenantname-dr-backup-vault
```

**Diagnosis**:
1. Verify vault name
2. Check if backups are being created
3. Verify cross-account backup permissions

**Resolution**:
```bash
# Check backup plan
aws --profile prod backup list-backup-plans --region us-east-1

# Verify vault policy
aws --profile dr backup get-backup-vault-access-policy \
  --backup-vault-name ${TENANT_NAME}-dr-backup-vault \
  --region eu-west-1
```

### Issue: Restore Job Fails

**Symptoms**:
```
ERROR: Restore job FAILED
Status message: Insufficient permissions
```

**Diagnosis**:
1. Check IAM role permissions
2. Verify KMS key access
3. Check VPC/subnet configuration

**Resolution**:
```bash
# Verify IAM role
aws --profile dr iam get-role --role-name BackupRestoreRole

# Check restore job details
aws --profile dr backup describe-restore-job \
  --restore-job-id ${RESTORE_JOB_ID} \
  --region eu-west-1
```

### Issue: Database Stuck in "Creating" State

**Symptoms**:
- Restore job shows COMPLETED
- Database never becomes "available"

**Diagnosis**:
```bash
aws --profile dr rds describe-db-instances \
  --db-instance-identifier ${DB_ID} \
  --region eu-west-1
```

**Resolution**:
1. Wait up to 30 additional minutes
2. Check RDS events for errors
3. Contact AWS Support if persistent

### Issue: Cannot Connect to Restored Database

**Symptoms**:
- Database shows "available"
- Cannot connect from application

**Diagnosis**:
1. Check security groups
2. Verify network connectivity
3. Check database credentials

**Resolution**:
```bash
# Check security groups
aws --profile dr rds describe-db-instances \
  --db-instance-identifier ${DB_ID} \
  --region eu-west-1 \
  --query 'DBInstances[0].VpcSecurityGroups'

# Test from bastion host
psql -h ${ENDPOINT} -U ${USERNAME} -d ${DATABASE}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `AccessDenied` | Missing IAM permissions | Review IAM policies |
| `DBInstanceAlreadyExists` | DB identifier in use | Choose different identifier |
| `InvalidParameterValue` | Invalid restore metadata | Check DB parameters |
| `KMSKeyNotAccessible` | KMS key permissions | Update KMS key policy |
| `InvalidVPCNetworkState` | VPC/subnet issues | Verify network configuration |

---

## Contact Information

### Escalation Path

**Level 1**: On-call Engineer
- PagerDuty: [Link]
- Phone: [Number]

**Level 2**: Senior DevOps Engineer
- PagerDuty: [Link]
- Phone: [Number]

**Level 3**: AWS Support
- Support Case: Create in AWS Console
- Severity: Production system down

### Key Stakeholders

**Engineering Manager**: [Name]
- Email: [email]
- Phone: [number]

**Product Owner**: [Name]
- Email: [email]
- Phone: [number]

**Security Team**: [Team]
- Email: [email]
- Slack: #security

### External Contacts

**AWS TAM** (Technical Account Manager):
- Name: [Name]
- Email: [email]
- Phone: [number]

---

## Appendix

### A. Configuration Files

**Backup Policy**: `risksmart-app/infrastructure/aws/accounts/dr/eu-west-1/dr-backup-policy.json`
**Terraform**: `infrastructure/aws/accounts/dr/eu-west-1/backup-vaults.tf`

### B. Metrics and SLAs

| Metric | Target | Current |
|--------|--------|---------|
| RTO | 4 hours | TBD |
| RPO | 24 hours | 24 hours |
| Backup Success Rate | >99% | TBD |
| DR Test Success Rate | 100% | TBD |

### C. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-01-XX | 1.0 | Initial version | DevOps Team |

### D. Related Documentation

- AWS Backup Documentation: https://docs.aws.amazon.com/aws-backup/
- RDS Restore Guide: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html
- Internal Wiki: [Link to company wiki]

---

## Quick Reference

### One-Line Commands

```bash
# Emergency restore (auto-approve)
./dr-restore-full.sh tenantname restored-db-$(date +%Y%m%d) --auto-approve

# Quick backup check
./dr-backup-validation.sh tenantname

# DR test
./dr-test.sh tenantname

# Interactive menu (for guided operations)
./dr-helper.sh tenantname

# Get latest backup date
aws --profile dr backup list-recovery-points-by-backup-vault \
  --backup-vault-name tenantname-dr-backup-vault \
  --region eu-west-1 \
  --query 'RecoveryPoints[0].CreationDate' \
  --output text

# Get restored DB endpoint
aws --profile dr rds describe-db-instances \
  --db-instance-identifier ${DB_ID} \
  --region eu-west-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

---

**Document maintained by**: DevOps Team
**Last updated**: Feb 2026
**Next review**: Quarterly
