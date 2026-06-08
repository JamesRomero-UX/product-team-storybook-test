# External API Versioning Workflow

This document describes the versioning workflow for the `@risksmart-app/external-api` package using Changesets.

## Overview

The external-api package uses [Changesets](https://github.com/changesets/changesets) for semantic versioning. This ensures proper version management and allows the version to be injected into Docker builds and deployment artifacts.

## Developer Workflow

### 1. Making Changes

When you make changes to the external-api package:

```bash
# Create feature branch
git checkout -b feature/fix-auth-bug

# Make your changes to packages/external-api/
# ... edit files ...
```

### 2. Creating a Changeset

After making changes, create a changeset to document the change:

```bash
# Run changeset command
pnpm changeset

# You'll be prompted:
# - Which packages changed? (select @risksmart-app/external-api)
# - What type of change? (patch/minor/major)
# - Description of changes
```

This creates a file like `.changeset/funny-cats-jump.md`:
```markdown
---
"@risksmart-app/external-api": patch
---

Fixed authentication timeout bug in external API
```

### 3. Applying Version Bump

Apply the version bump to your package.json:

```bash
# Apply the changeset to update package.json and CHANGELOG
pnpm changeset:version
```

This will:
- Update `packages/external-api/package.json` version
- Update `packages/external-api/CHANGELOG.md`
- Remove the consumed changeset file

### 4. Commit and Push

Commit all changes including the version bump:

```bash
git add .
git commit -m "fix: auth timeout + bump version to 0.0.2"
git push origin feature/fix-auth-bug
```

### 5. Create PR and Merge

- Create PR (shows code changes + version bump + changelog)
- Review and merge to main
- Deployment automatically uses the new version

## Docker Build Integration

The version is automatically injected into Docker builds:

```bash
# Docker build with version
docker build --build-arg PACKAGE_VERSION=$(node -p "require('./packages/external-api/package.json').version") .
```

The `PACKAGE_VERSION` environment variable is available in the running container and should be used by the `/healthz` endpoint.

## Semantic Versioning Rules

- **patch**: Bug fixes, security patches
- **minor**: New features, backwards-compatible changes  
- **major**: Breaking changes

## Example Complete Workflow

```bash
# 1. Create branch and make changes
git checkout -b feature/add-new-endpoint
# ... make changes ...

# 2. Create changeset
pnpm changeset
# Select: @risksmart-app/external-api
# Type: minor (new feature)
# Description: "Add new user management endpoint"

# 3. Apply version bump
pnpm changeset:version
# This bumps version from 0.0.1 → 0.1.0

# 4. Commit everything
git add .
git commit -m "feat: add user management endpoint + bump to v0.1.0"

# 5. Push and create PR
git push origin feature/add-new-endpoint
# Create PR, review, merge

# 6. Deploy automatically uses v0.1.0
```

## Commands Reference

```bash
# Create a changeset
pnpm changeset

# Apply version bumps
pnpm changeset:version

# Build external-api
pnpm --filter @risksmart-app/external-api build

# Get current version
node -p "require('./packages/external-api/package.json').version"
```

## Notes

- Only `@risksmart-app/external-api` uses changesets - other packages are unaffected
- Version bumps must be included in the same PR as code changes
- Docker builds automatically receive the version via `PACKAGE_VERSION` env var
- The `/healthz` endpoint should return the version from `process.env.PACKAGE_VERSION`