# AI Context Priming Guide

This document provides a comprehensive context priming sequence for AI assistants working with the RiskSmart application.

## Quick Start Priming Sequence

Execute these commands in order to establish complete project context:

### 1. Primary Context Files

```bash
# Read main AI context documentation
cat ai/docs/general-context.md

```

### 2. Project Structure Overview

```bash
# Get repository structure
ls -la
cat README.md
cat package.json
cat pnpm-workspace.yaml
```

### 3. Architecture and Configuration

```bash
# TypeScript and build configuration
cat tsconfig.json
cat turbo.json
cat vitest.workspace.js

# Development environment
cat docker-compose.yml
cat setup.sh
```

### 4. Package Structure

```bash
# Explore main packages
ls -la packages/
ls -la packages/web/src/
ls -la packages/rest-api/src/
ls -la packages/components/
ls -la stacks/
```

### 5. AI-Specific Documentation

```bash
# Read all Claude-specific documentation
find ai/docs -name "*.md" -exec echo "=== {} ===" \; -exec cat {} \;

# Read troubleshooting guides
cat ai/docs/troubleshooting/typescript-troubleshooting.md
cat ai/docs/implementations/trpc-migration-guide.md
cat ai/docs/implementations/chat-components-guide.md
cat ai/docs/architecture/chat-integration.md
```

## Essential Files for Context

### Core Configuration Files

1. **CLAUDE.md** - Primary AI context document
2. **package.json** - Project dependencies and scripts
3. **pnpm-workspace.yaml** - Monorepo workspace configuration
4. **tsconfig.json** - TypeScript configuration
5. **turbo.json** - Build pipeline configuration

### Development Files

1. **README.md** - Project overview and setup
2. **docker-compose.yml** - Local development environment
3. **setup.sh** - Environment setup script
4. **vitest.workspace.js** - Testing configuration

### Architecture Files

1. **docs/taxonomy.md** - Domain model and business concepts
2. **docs/dev-workflow.md** - Development practices
3. **sst.config.ts** - Infrastructure configuration
4. **api-stack/hasura/config.yaml** - GraphQL configuration

### AI Documentation

1. **ai/docs/**/\*.md\*\* - documentation overview

## Complete Priming Command Sequence

```bash
# === PHASE 1: PROJECT OVERVIEW ===
echo "=== PROJECT OVERVIEW ==="
cat CLAUDE.md
cat README.md
cat package.json | jq '.scripts, .workspaces, .dependencies'

# === PHASE 2: REPOSITORY STRUCTURE ===
echo -e "\n=== REPOSITORY STRUCTURE ==="
tree -d -L 3 -I node_modules
ls -la packages/
cat pnpm-workspace.yaml

# === PHASE 3: CONFIGURATION ===
echo -e "\n=== CONFIGURATION ==="
cat tsconfig.json
cat turbo.json
cat docker-compose.yml

# === PHASE 4: AI DOCUMENTATION ===
echo -e "\n=== AI DOCUMENTATION ==="
find ai/docs -name "*.md" -not -name "README.md" -exec echo -e "\n--- {} ---" \; -exec cat {} \;

# === PHASE 5: DOMAIN KNOWLEDGE ===
echo -e "\n=== DOMAIN KNOWLEDGE ==="
cat docs/*taxonomy.md


# === PHASE 6: ARCHITECTURE ===
echo -e "\n=== ARCHITECTURE ==="
cat sst.config.ts
head -50 api-stack/hasura/config.yaml

# === PHASE 7: KEY IMPLEMENTATION PATTERNS ===
echo -e "\n=== KEY PATTERNS ==="
head -100 packages/web/src/components/Chat/useChatStore.ts
head -100 packages/web/src/hooks/queries/useGetActionsQuery.tsx
head -100 packages/trpc/src/routers/action.router.ts
```

## Context Validation Checklist

After priming, verify understanding of:

- [ ] **Project Type**: Risk management monorepo application
- [ ] **Tech Stack**: React, TypeScript, tRPC, GraphQL, PostgreSQL, SST
- [ ] **Architecture**: Migrating from GraphQL to tRPC with feature flags
- [ ] **State Management**: Zustand (replacing React Context)
- [ ] **Testing**: Vitest (unit), Playwright (e2e)
- [ ] **Build System**: pnpm workspaces with Turbo
- [ ] **Development**: Docker for local services, SST for infrastructure

## Quick Reference Commands

### Development

```bash
# Start development environment
pnpm run api:min          # Start Hasura and Postgres
pnpm start           # Start web application
pnpm run sst:dev     # Start SST development

# Type generation (run in this order)
pnpm run generate-graphql  # GraphQL types
pnpm run sst:types        # SST types
pnpm run db:pull          # Database types

# Quality checks
pnpm run lint        # Check linting
pnpm run tsc         # TypeScript check
pnpm test           # Run all tests
```

### Common Debugging

```bash
# Clear caches
rm -rf .turbo packages/*/.turbo
pnpm store prune

# Restart services
docker-compose down && docker-compose up -d

# Check service status
docker ps
pnpm run tsc --noEmit
```

## Context Patterns to Understand

### 1. Feature Flag Pattern

```typescript
// tRPC migration pattern
const { data: featureFlags } = useGetFeatureFlags();
const trpcEnabled = featureFlags?.trpc || false;

const trpcResult = useObjectTRPC({ enabled: trpcEnabled });
const graphqlResult = useObjectGraphQL({ enabled: !trpcEnabled });

return trpcEnabled ? trpcResult : graphqlResult;
```

### 2. State Management Pattern

```typescript
// Zustand store pattern
export const useObjectStore = create<ObjectState>()(
  subscribeWithSelector((set, get) => ({
    // State
    entities: [],
    isLoading: false,

    // Actions
    setEntities: (entities) => set({ entities }),
    setLoading: (loading) => set({ isLoading: loading }),
  }))
);
```

### 3. Component Pattern

```typescript
// Standard component structure
export const ComponentName = React.memo<Props>(({ prop }) => {
  const { state, action } = useStore();

  const handleEvent = useCallback(() => {
    // Handler implementation
  }, [dependencies]);

  return (
    <div className={styles.container}>
      {/* Component JSX */}
    </div>
  );
});
```

### 4. Testing Pattern

```typescript
// Standard test structure
describe('ComponentName', () => {
  beforeEach(() => {
    mockStore.mockReturnValue({ /* mock state */ });
  });

  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles interactions', async () => {
    const mockAction = jest.fn();
    render(<ComponentName />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

## Domain-Specific Context

### Risk Management Concepts

- **Risks**: Potential events that could negatively impact the organization
- **Controls**: Measures to mitigate risks
- **Assessments**: Evaluation of risk levels and control effectiveness
- **Actions**: Tasks to address risks or improve controls
- **Issues**: Problems or incidents that have occurred
- **Third-Party**: External vendor risk management

### Application Areas

- **Risk Register**: Central repository of organizational risks
- **Control Framework**: System of controls and testing
- **Compliance Management**: Regulatory compliance tracking
- **Assessment Workflows**: Risk and control assessments
- **Action Management**: Task tracking and completion
- **Reporting**: Risk dashboards and analytics

## Emergency Context Recovery

If context is lost or unclear, run this minimal recovery sequence:

```bash
# Quick context recovery
cat CLAUDE.md | head -50
cat ai/docs/README.md
ls -la packages/
cat package.json | jq '.scripts'
cat ai/docs/troubleshooting/typescript-troubleshooting.md | head -30
```

## Integration with Other AI Systems

This priming guide is compatible with:

- **Claude Code**: Primary target for this documentation
- **GitHub Copilot**: Reference `.github/copilot-instructions.md`
- **Gemini**: Reference `docs/gemini/GEMINI.md`

Cross-reference between systems using the respective documentation in their designated folders.

---

**Note**: This priming sequence is designed to provide comprehensive context efficiently. Adjust the sequence based on specific task requirements and available time.
