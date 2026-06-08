# Integrations Versioning Workflow

This document describes the versioning workflow for the `n8n-nodes-risksmart` package using Changesets.

## Overview

The integrations package uses [Changesets](https://github.com/changesets/changesets) for semantic versioning. This ensures proper version management and allows the version to be used as the ECR image tag for container deployments.

## Developer Workflow

### 1. Making Changes

When you make changes to the integrations package:

```bash
# Create feature branch
git checkout -b feature/add-new-node

# Make your changes to packages/integrations/
# ... edit files ...
```

### 2. Creating a Changeset

After making changes, create a changeset to document the change:

```bash
# Run changeset command
pnpm changeset

# You'll be prompted:
# - Which packages changed? (select n8n-nodes-risksmart)
# - What type of change? (patch/minor/major)
# - Description of changes
```

This creates a file like `.changeset/funny-cats-jump.md`:

```markdown
---
"n8n-nodes-risksmart": patch
---

Fixed authentication issue in RiskSmart trigger node
```

### 3. Applying Version Bump

Apply the version bump to your package.json:

```bash
# Apply the changeset to update package.json and CHANGELOG
pnpm changeset:version
```

This will:

- Update `packages/integrations/package.json` version
- Update `packages/integrations/CHANGELOG.md`
- Remove the consumed changeset file

### 4. Commit and Push

Commit all changes including the version bump:

```bash
git add .
git commit -m "feat: add new node + bump version to 1.1.0"
git push origin feature/add-new-node
```

### 5. Create PR and Merge

- Create PR (shows code changes + version bump + changelog)
- Review and merge to main
- Post-merge workflow automatically builds and pushes the versioned image to ECR

## Container Build Integration

The version is automatically used as the ECR image tag:

```bash
# ECR image tag format
risksmart/integrations:1.0.0
```

The `INTEGRATIONS_CONTAINER_BUILD` environment variable in CDK uses this version to pull the correct image from ECR.

## Semantic Versioning Rules

- **patch**: Bug fixes, security patches, minor node updates
- **minor**: New nodes, new features, backwards-compatible changes
- **major**: Breaking changes to node interfaces or behavior

## Example Complete Workflow

```bash
# 1. Create branch and make changes
git checkout -b feature/add-webhook-node
# ... make changes ...

# 2. Create changeset
pnpm changeset
# Select: n8n-nodes-risksmart
# Type: minor (new feature)
# Description: "Add webhook trigger node for external events"

# 3. Apply version bump
pnpm changeset:version
# This bumps version from 1.0.0 → 1.1.0

# 4. Commit everything
git add .
git commit -m "feat: add webhook trigger node + bump to v1.1.0"

# 5. Push and create PR
git push origin feature/add-webhook-node
# Create PR, review, merge

# 6. Post-merge automatically:
#    - Checks if risksmart/integrations:1.1.0 exists in ECR
#    - If not, builds and pushes the image
#    - CDK deploy uses the new version
```

## Commands Reference

```bash
# Create a changeset
pnpm changeset

# Apply version bumps
pnpm changeset:version

# Build integrations package
pnpm run --filter n8n-nodes-risksmart build

# Get current version
node -p "require('./packages/integrations/package.json').version"
```

## Notes

- Version bumps must be included in the same PR as code changes
- Docker images are tagged with the semantic version (e.g., `1.0.0`)
- Staging and production deployments pull pre-built images from ECR (no rebuild)
- The post-merge workflow handles building and pushing to ECR
