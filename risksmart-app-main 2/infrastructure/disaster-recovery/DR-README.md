# Disaster Recovery System

A comprehensive disaster recovery solution for RiskSmart, featuring automated backups, restore procedures, testing, and monitoring.

## 📋 Quick Start

```bash
# Check backup health for a tenant
./dr-backup-validation.sh tenant-a

# Run a DR test (with auto-cleanup)
./dr-test.sh tenant-a

# Emergency restore
./dr-restore-full.sh tenant-a restored-tenant-a-db
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Account                       │
│  ┌────────────┐         ┌─────────────────┐                │
│  │ RDS Instance│────────▶│  AWS Backup     │                │
│  │  (Tenant)   │         │  (Daily Backup) │                │
│  └────────────┘         └────────┬────────┘                │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │ Cross-Account Copy
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                        DR Account                            │
│                    (ID: 134258997950)                        │
│                    Region: eu-west-1                         │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │         DR Backup Vault                       │           │
│  │  (tenant-a-dr-backup-vault)                  │           │
│  │                                               │           │
│  │  ┌────────────┐  ┌────────────┐             │           │
│  │  │ Recovery   │  │ Recovery   │   ...        │           │
│  │  │ Point 1    │  │ Point 2    │             │           │
│  │  │ (Day 1)    │  │ (Day 2)    │             │           │
│  │  └────────────┘  └────────────┘             │           │
│  └──────────────────────────────────────────────┘           │
│                          │                                   │
│                          │ Restore                           │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────┐           │
│  │      Restored RDS Instance                    │           │
│  │  (Used for DR or Testing)                    │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files Overview

| File | Purpose | Usage |
|------|---------|-------|
| `dr-restore-full.sh` | Full production restore with monitoring | `./dr-restore-full.sh <tenant> <db-id>` |
| `dr-test.sh` | Automated DR testing with cleanup | `./dr-test.sh <tenant>` |
| `dr-backup-validation.sh` | Validate backup health | `./dr-backup-validation.sh <tenant>` |
| `dr-helper.sh` | Interactive menu for DR operations | `./dr-helper.sh <tenant>` |
| `DR-RUNBOOK.md` | Comprehensive operational runbook | Reference guide |
| `DR-README.md` | This file | Overview |

## 🚀 Features

### ✅ Automated Restore
- One-command database restore
- Progress monitoring with ETA
- Automatic validation
- Comprehensive logging
- Dry-run support

### ✅ DR Testing
- Automated test restores
- Self-cleaning test databases
- Scheduled drill support
- Compliance reporting

### ✅ Backup Validation
- Health checks for all backups
- Age and status verification
- Compliance monitoring
- Multi-tenant support

### ✅ Monitoring & Alerts
- CloudWatch alarms
- SNS notifications
- Automated cron jobs
- Weekly reports

## 🔧 Setup Instructions

### Prerequisites

1. **Install required tools:**
   ```bash
   # macOS
   brew install awscli jq

   # Linux (Ubuntu/Debian)
   sudo apt-get install awscli jq
   ```

2. **Configure AWS profiles:**
   ```bash
   # ~/.aws/config
   [profile dr]
   region = eu-west-1
   output = json

   [profile prod]
   region = us-east-1
   output = json
   ```

3. **Configure credentials:**
   ```bash
   aws configure --profile dr
   aws configure --profile prod
   ```

4. **Verify access:**
   ```bash
   aws --profile dr sts get-caller-identity
   aws --profile prod sts get-caller-identity
   ```

### Initial Setup

1. **Make scripts executable:**
   ```bash
   chmod +x dr-*.sh
   ```

2. **Test backup validation:**
   ```bash
   ./dr-backup-validation.sh tenant-a
   ```

3. **Run dry-run restore:**
   ```bash
   ./dr-restore-full.sh tenant-a test-db --dry-run
   ```

4. **Schedule your first DR test:**
   ```bash
   ./dr-test.sh tenant-a
   ```

## 📖 Usage Examples

### Example 1: Check Backup Status

```bash
# Check a single tenant
./dr-backup-validation.sh tenant-a

# Check all tenants
for tenant in tenant-a tenant-b tenant-c; do
  echo "Checking ${tenant}..."
  ./dr-backup-validation.sh "${tenant}"
done
```

**Expected Output:**
```
[INFO] =========================================
[INFO] DR BACKUP VALIDATION
[INFO] Tenant: tenant-a
[INFO] =========================================
[SUCCESS] Backup vault exists
[INFO] Found 7 recovery point(s)
[SUCCESS] ✓ 2024-01-15T10:30:00Z - COMPLETED
[SUCCESS] ✓ 2024-01-14T10:30:00Z - COMPLETED
...
[SUCCESS] Overall Status: PASS ✓
```

### Example 2: Run DR Test

```bash
# Standard test (with automatic cleanup)
./dr-test.sh tenant-a

# Test with manual cleanup (for investigation)
./dr-test.sh tenant-a --keep-resources
```

**What happens:**
1. Creates test restore from latest backup
2. Monitors restore progress
3. Validates database availability
4. Runs connectivity tests
5. Cleans up resources (unless `--keep-resources`)

### Example 3: Emergency Restore

```bash
# Step 1: Validate backups are available
./dr-backup-validation.sh tenant-a

# Step 2: Review restore plan (dry-run)
./dr-restore-full.sh tenant-a restored-db-20240115 --dry-run

# Step 3: Execute restore
./dr-restore-full.sh tenant-a restored-db-20240115

# Step 4: Get database endpoint
aws --profile dr rds describe-db-instances \
  --db-instance-identifier restored-db-20240115 \
  --region eu-west-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### Example 4: Point-in-Time Restore

```bash
# Restore to specific timestamp
./dr-restore-full.sh tenant-a restored-db \
  --target-time "2024-01-15T10:30:00Z"
```

### Example 5: Automated Restore (CI/CD)

```bash
# Use auto-approve for scripted restores
./dr-restore-full.sh tenant-a restored-db \
  --auto-approve \
  --skip-validation
```

## 📊 Monitoring & Alerting

### CloudWatch Alarms

Monitoring is configured via Terraform in the production account. You'll have:

1. **Backup Failure Alarm**
   - Triggers on any failed backup job
   - SNS notification sent

2. **Backup Age Alarm**
   - Triggers if no backup in 26 hours
   - Critical if >50 hours

3. **Dashboard**
   - View at: CloudWatch Console → Dashboards → DR-Backup-Monitoring
   - Shows backup success/failure trends
   - Displays recovery point counts

### Email Notifications

Subscribe to SNS topic:
```bash
aws --profile dr sns subscribe \
  --topic-arn arn:aws:sns:eu-west-1:134258997950:dr-backup-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region eu-west-1
```

### Scheduled Checks

Add to crontab for automated validation:
```bash
# Daily at 9 AM
0 9 * * * /path/to/dr-backup-validation.sh tenant-a >> /var/log/dr-validation.log 2>&1

# Weekly test restore on Sundays at 2 AM
0 2 * * 0 /path/to/dr-test.sh tenant-a >> /var/log/dr-test.log 2>&1
```

## 🔍 Troubleshooting

### Common Issues

#### Issue: "No recovery points found"

**Cause**: Backup vault is empty or backups haven't completed

**Solution**:
```bash
# Check backup jobs in production
aws --profile prod backup list-backup-jobs \
  --by-resource-arn "arn:aws:rds:us-east-1:*:db:tenant-a-db" \
  --region us-east-1

# Verify cross-account permissions
aws --profile dr backup get-backup-vault-access-policy \
  --backup-vault-name tenant-a-dr-backup-vault \
  --region eu-west-1
```

#### Issue: "Restore job failed"

**Cause**: Insufficient permissions, KMS issues, or network problems

**Solution**:
```bash
# Get detailed error
aws --profile dr backup describe-restore-job \
  --restore-job-id ${RESTORE_JOB_ID} \
  --region eu-west-1

# Check IAM role
aws --profile dr iam get-role \
  --role-name BackupRestoreRole
```

#### Issue: "Database stuck in 'creating' state"

**Cause**: Large database taking time to restore

**Solution**: Wait up to 2 hours for large databases. Monitor RDS events:
```bash
aws --profile dr rds describe-events \
  --source-identifier ${DB_IDENTIFIER} \
  --source-type db-instance \
  --region eu-west-1
```

### Debug Mode

Enable verbose logging:
```bash
# Add to script calls
bash -x ./dr-restore-full.sh tenant-a restored-db

# Check logs
tail -f /tmp/dr-restore-logs/restore-*.log
```

## 📅 Recommended Schedule

### Daily
- ✅ Automated backup validation (via cron)
- ✅ Review CloudWatch dashboards

### Weekly
- ✅ Manual review of all tenant backups
- ✅ Random DR test on one tenant
- ✅ Generate weekly report

### Monthly
- ✅ Full DR drill (first Monday)
- ✅ Update runbook documentation
- ✅ Review and test escalation procedures

### Quarterly
- ✅ Full production-like DR exercise
- ✅ Application-level validation
- ✅ Team training session
- ✅ Disaster recovery plan review

## 🎯 Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| **RTO** (Recovery Time Objective) | 4 hours | Time to restore database and resume operations |
| **RPO** (Recovery Point Objective) | 24 hours | Maximum acceptable data loss (daily backups) |
| **Backup Success Rate** | >99% | Percentage of successful backup jobs |
| **DR Test Success Rate** | 100% | All DR tests must succeed |

## 🔐 Security Considerations

### IAM Permissions
- Principle of least privilege applied
- Separate roles for backup and restore
- MFA required for production restores (recommended)

### Encryption
- All backups encrypted with KMS
- Cross-account KMS key policies configured
- In-transit encryption for restored databases

### Audit Trail
- All operations logged to CloudWatch
- Restore operations tracked in AWS Backup
- S3 bucket logs for backup vault access

### Access Control
- DR account access restricted to authorized personnel
- Assume role required for production access
- Regular access reviews

## 📚 Additional Resources

- **Full Runbook**: See [DR-RUNBOOK.md](DR-RUNBOOK.md)
- **AWS Backup Docs**: https://docs.aws.amazon.com/aws-backup/
- **RDS Restore Guide**: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html

## 🆘 Emergency Contacts

For production incidents:
1. **Primary**: On-call DevOps Engineer (via PagerDuty)
2. **Secondary**: Senior DevOps Engineer
3. **Escalation**: AWS Support (create high-severity case)

## 📝 Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-XX | 1.0.0 | Initial DR system implementation |
| | | - Automated restore scripts |
| | | - DR testing framework |
| | | - Monitoring and alerting |
| | | - Comprehensive runbook |

## 🤝 Contributing

To improve this DR system:
1. Test changes in DR account first
2. Update documentation
3. Run DR test to validate
4. Update version in change log
5. Train team on changes

---

**Maintained by**: DevOps Team
**Last Updated**: February 2026
**Next Review**: Quarterly
