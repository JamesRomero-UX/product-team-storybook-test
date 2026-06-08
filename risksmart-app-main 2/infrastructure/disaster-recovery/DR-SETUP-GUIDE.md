# Disaster Recovery Setup Guide

## 🎯 Overview

This guide will walk you through setting up and testing the complete disaster recovery system in **15 minutes**.

## ✅ What You'll Get

After completing this setup, you'll have:
- ✅ Automated backup validation
- ✅ One-command database restore
- ✅ Scheduled DR testing
- ✅ CloudWatch monitoring and alerts
- ✅ Comprehensive runbook and documentation

## 📦 Files Created

All DR scripts are in `risksmart-app/infrastructure/disaster-recovery/`:

| File | Purpose | Execute? |
|------|---------|----------|
| `dr-restore-full.sh` | Production restore script | ✅ Yes |
| `dr-test.sh` | Automated DR testing | ✅ Yes |
| `dr-backup-validation.sh` | Backup health checks | ✅ Yes |
| `dr-helper.sh` | Interactive menu | ✅ Yes |
| `DR-RUNBOOK.md` | Operational procedures | 📖 Read |
| `DR-README.md` | Complete documentation | 📖 Read |
| `DR-SETUP-GUIDE.md` | This file | 📖 Read |

## 🚀 Quick Setup (15 Minutes)

### Step 1: Prerequisites (5 minutes)

1. **Verify AWS CLI is installed:**
   ```bash
   aws --version
   # Should show: aws-cli/2.x.x or higher
   ```

2. **Install jq (if needed):**
   ```bash
   # macOS
   brew install jq

   # Linux (Ubuntu/Debian)
   sudo apt-get install jq

   # Verify
   jq --version
   ```

3. **Configure AWS profiles:**

   Create/update `~/.aws/config`:
   ```ini
   [profile dr]
   region = eu-west-1
   output = json

   [profile prod]
   region = us-east-1
   output = json
   ```

4. **Configure credentials:**
   ```bash
   aws configure --profile dr
   # Enter your DR account access key, secret key

   aws configure --profile prod
   # Enter your production account access key, secret key
   ```

5. **Test access:**
   ```bash
   aws --profile dr sts get-caller-identity
   aws --profile prod sts get-caller-identity
   ```

   You should see your account IDs and ARNs.

### Step 2: Verify Infrastructure (2 minutes)

1. **Check DR backup vaults exist:**
   ```bash
   aws --profile dr backup list-backup-vaults --region eu-west-1
   ```

   You should see vaults like:
   - `sandbox-dr-backup-vault`
   - `customername-dr-backup-vault`
   - etc.

2. **Verify IAM role exists:**
   ```bash
   aws --profile dr iam get-role --role-name BackupRestoreRole
   ```

   If this fails, you may need to create the role (see Terraform in `infrastructure/aws/accounts/prod/us-east-1/backup-role.tf`).

### Step 3: First Test (5 minutes)

1. **Navigate to disaster-recovery directory:**
   ```bash
   cd /Users/mannypotter/repo/risksmart-app/infrastructure/disaster-recovery/
   ```

2. **Make scripts executable (already done):**
   ```bash
   ls -l dr-*.sh
   # Should show -rwxr-xr-x permissions
   ```

3. **Run backup validation:**
   ```bash
   ./dr-backup-validation.sh tenantname
   ```

   **Expected output:**
   ```
   [INFO] =========================================
   [INFO] DR BACKUP VALIDATION
   [INFO] Tenant: tenantname
   [INFO] =========================================
   [SUCCESS] Backup vault exists
   [INFO] Found 7 recovery point(s)
   [SUCCESS] ✓ 2024-01-15T10:30:00Z - COMPLETED
   ...
   [SUCCESS] Overall Status: PASS ✓
   ```

   ✅ If you see `PASS`, backups are healthy!
   ❌ If you see errors, check the troubleshooting section below.

4. **Run a dry-run restore:**
   ```bash
   ./dr-restore-full.sh tenantname test-db-dryrun --dry-run
   ```

   This simulates a restore without actually doing anything. Review the output to understand what would happen.

### Step 4: Setup Monitoring (3 minutes)

Monitoring is configured via Terraform in the production account (see [backup-monitoring.tf](../aws/accounts/prod/eu-west-2/backup-monitoring.tf)).

1. **Subscribe to email alerts:**
   ```bash
   aws --profile dr sns subscribe \
     --topic-arn arn:aws:sns:eu-west-1:134258997950:dr-backup-alerts \
     --protocol email \
     --notification-endpoint your-email@example.com \
     --region eu-west-1
   ```

   Check your email and confirm the subscription.

3. **View CloudWatch dashboard:**
   - Go to AWS Console → CloudWatch → Dashboards
   - Select "DR-Backup-Monitoring"

### Step 5: Interactive Helper (Optional)

For easier DR operations, use the interactive menu:

```bash
./dr-helper.sh <tenant-name>

# Example:
./dr-helper.sh tenantname
```

This provides a user-friendly menu for all DR operations for the specified tenant.

## 🧪 Running Your First DR Test

Now that everything is set up, run a full DR test:

```bash
./dr-test.sh tenantname
```

**What happens:**
1. ✅ Validates latest backup exists
2. ✅ Creates test restore
3. ✅ Monitors progress (15-30 minutes)
4. ✅ Validates database is available
5. ✅ Automatically deletes test resources

**Timeline:**
- Small DB (<10GB): ~15-20 minutes
- Medium DB (10-100GB): ~30-45 minutes
- Large DB (>100GB): ~60+ minutes

Watch the progress:
```bash
# In another terminal
tail -f /tmp/dr-test-*.log
```

## 🚨 Emergency Restore Procedure

In case of real disaster:

### Quick Reference Card

**Print this and keep handy:**

```
╔══════════════════════════════════════════════════════════╗
║         EMERGENCY RESTORE QUICK REFERENCE                ║
╔══════════════════════════════════════════════════════════╗

1. Validate backups exist:
   ./dr-backup-validation.sh <tenant-name>

2. Choose new DB identifier:
   NEWDB="restored-<tenant>-$(date +%Y%m%d-%H%M)"

3. Start restore:
   ./dr-restore-full.sh <tenant-name> $NEWDB

4. Monitor: Script shows progress automatically

5. Get endpoint when complete:
   aws --profile dr rds describe-db-instances \
     --db-instance-identifier $NEWDB \
     --region eu-west-1 \
     --query 'DBInstances[0].Endpoint.Address'

6. Update application connection string

7. Restart application services

HELP: See DR-RUNBOOK.md for full procedures
╚══════════════════════════════════════════════════════════╝
```

### Detailed Steps

See [DR-RUNBOOK.md](DR-RUNBOOK.md) → Emergency Restore Procedure

## 🔍 Troubleshooting

### Issue: "Cannot authenticate to DR account"

**Fix:**
```bash
# Reconfigure DR profile
aws configure --profile dr

# Test
aws --profile dr sts get-caller-identity
```

### Issue: "No recovery points found"

**Possible causes:**
1. Backups haven't run yet (check backup schedule)
2. Wrong tenant name
3. Cross-account backup not configured

**Fix:**
```bash
# List all vaults
aws --profile dr backup list-backup-vaults --region eu-west-1

# Check backup jobs in production
aws --profile prod backup list-backup-jobs \
  --region us-east-1 \
  --by-resource-type RDS
```

### Issue: "Script not executable"

**Fix:**
```bash
chmod +x risksmart-app/infrastructure/disaster-recovery/dr-*.sh
```

### Issue: "jq: command not found"

**Fix:**
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

## 📚 Next Steps

Now that you're set up:

1. **Read the runbook**: [DR-RUNBOOK.md](DR-RUNBOOK.md)
   - Emergency procedures
   - Escalation paths
   - Troubleshooting guide

2. **Review full documentation**: [DR-README.md](DR-README.md)
   - Architecture details
   - All features
   - Examples

3. **Schedule first monthly drill**:
   - Pick a date (recommend: first Monday)
   - Add to team calendar
   - Assign rotation

4. **Update contact information**:
   - Edit DR-RUNBOOK.md
   - Add your team's contacts
   - Update PagerDuty links

5. **Customize for your environment**:
   - Add your tenant names
   - Update regions if different
   - Adjust thresholds in monitoring

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] AWS CLI configured with `dr` and `prod` profiles
- [ ] Can list backup vaults in DR account
- [ ] Backup validation script runs successfully
- [ ] Dry-run restore completes without errors
- [ ] SNS topic created and email subscribed
- [ ] CloudWatch dashboard visible
- [ ] Cron jobs scheduled (daily validation)
- [ ] Team has access to runbook
- [ ] Emergency contact information updated
- [ ] First DR test completed successfully

## 🎓 Training

Share these with your team:

1. **Quick Start Video** (TODO: Record)
   - 5-minute walkthrough
   - Shows basic operations

2. **Hands-On Exercise**:
   ```bash
   # Have each team member run:
   ./dr-backup-validation.sh tenantname
   ./dr-restore-full.sh tenantname test-db-training --dry-run
   ./dr-helper.sh tenantname  # Explore the menu
   ```

3. **Monthly Drill Participation**:
   - Rotate who runs the DR drill
   - Different person each month
   - Build muscle memory

## 📞 Support

If you need help:

1. **Check the docs**:
   - This guide
   - DR-RUNBOOK.md
   - DR-README.md

2. **Review logs**:
   - `/tmp/dr-restore-logs/`
   - `/var/log/dr-*.log`

3. **AWS Documentation**:
   - [AWS Backup](https://docs.aws.amazon.com/aws-backup/)
   - [RDS Restore](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html)

4. **Escalate**:
   - On-call engineer
   - DevOps team
   - AWS Support

## 🎉 You're Done!

Congratulations! You now have a production-ready disaster recovery system.

**Key capabilities:**
- ✅ Restore any tenant database in under 4 hours
- ✅ Automated daily backup validation
- ✅ Monthly DR testing
- ✅ CloudWatch monitoring and alerts
- ✅ Comprehensive documentation

**Remember:**
- Test regularly (monthly minimum)
- Keep runbook updated
- Train all team members
- Review and improve after each drill

---

**Questions?** Update this doc and share knowledge with the team!

**Last Updated**: February 2026
