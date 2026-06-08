# Data Migrations

This directory contains **manual, supervised data migration scripts** that require human review and execution.

## ⚠️ Important Notes

- **NOT automatically executed** - These scripts must be run manually
- **Org-specific** - Many scripts are for specific organizations
- **Supervised** - Should be reviewed and executed step-by-step
- **One-time** - Generally run once during deployment or data cleanup

## Verification

Always include:

1. **Review queries** - Show what will change before executing
2. **Execution statements** - The actual data changes
3. **Verification queries** - Confirm changes were applied correctly
4. **Rollback plan** - Document how to undo if needed
