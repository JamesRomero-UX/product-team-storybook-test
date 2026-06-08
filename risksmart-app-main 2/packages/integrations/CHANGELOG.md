# n8n-nodes-risksmart

## 1.1.3

### Patch Changes

- Updated n8n version to 1.123.23 to address CVEs in 1.123.20

## 1.1.2

### Patch Changes

- Use explicit docker.io registry in Dockerfile to satisfy Datadog untrusted registry rule

## 1.1.1

### Patch Changes

- Updated n8n version

## 1.1.0

### Minor Changes

- Updated to use in memory credentials store to better support JWT expiry

## 1.0.2

### Patch Changes

- Removed n8n-core as its not actually a required dep whilst containing CVEs

## 1.0.1

### Patch Changes

- Introduce changeset versioning releases

## 1.0.0

### Major Changes

- Initial versioned release using changesets.
- Integrations container now uses semantic versioning for ECR image tags.
- Images are built on post-merge to main and reused across pre-merge/staging/production deployments.
