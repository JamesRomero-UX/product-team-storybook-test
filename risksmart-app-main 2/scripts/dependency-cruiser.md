# Dependency Cruiser Script

A wrapper script for [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) that generates visual dependency graphs for TypeScript/JavaScript modules in the project.

## Overview

This script uses dependency-cruiser to analyse and visualize module dependencies. It creates an interactive HTML report with an SVG dependency graph that helps identify:

- Circular dependencies
- Orphaned modules
- External package usage
- Module relationships and coupling

## Prerequisites

### GraphViz Installation

The script requires GraphViz to be installed for generating SVG visualizations:

```bash
# macOS (using Homebrew)
brew install graphviz
```

_NB: The script will automatically check for GraphViz installation and provide installation instructions if missing._

## Usage

```bash
./scripts/dependency-cruiser.sh --path <path> [options]
```

### Arguments

| Argument | Short | Required | Description |
|----------|-------|----------|-------------|
| `--path` | `-p` | Yes | Path to the file or directory to analyse (relative to project root) |
| `--filename` | `-f` | No | Custom output filename (without extension). If not provided, generates from path |
| `--format` | `-t` | No | Output format: `dot` for detailed file-level view (default), `ddot` for directory-level view, `archi` for high-level package overview |
| `--focus-depth` | `-d` | No | Depth of dependency analysis (default: 3). Higher values show more distant dependencies |
| `--help` | `-h` | No | Show help message and exit |

### Examples

#### Analyse a specific file
```bash
./scripts/dependency-cruiser.sh --path packages/web/src/components/FormBuilder.tsx
```
**Output:** `.dependency-cruiser/packages-web-src-components-FormBuilder_tsx.html`

#### Analyse a directory
```bash
./scripts/dependency-cruiser.sh --path packages/web/src/hooks
```
**Output:** `.dependency-cruiser/packages-web-src-hooks.html`

#### Custom filename
```bash
./scripts/dependency-cruiser.sh --path packages/web/src/utils --filename custom-utils-analysis
```
**Output:** `.dependency-cruiser/custom-utils-analysis.html`

#### Adjust focus depth for deeper analysis
```bash
./scripts/dependency-cruiser.sh --path packages/web/src/components/FormBuilder.tsx --focus-depth 5
```
**Shows 5 levels of dependencies instead of the default 3**

#### Shallow analysis for quick overview
```bash
./scripts/dependency-cruiser.sh --path packages/web/src/hooks --focus-depth 1
```
**Shows only direct dependencies (1 level deep)**

#### Package-level overview using archi format
```bash
./scripts/dependency-cruiser.sh --path packages/web --format archi
```
**Generates a high-level architectural view showing package relationships**

#### Directory-level overview using ddot format
```bash
./scripts/dependency-cruiser.sh --path packages/web --format ddot
```
**Generates a directory-level view, showing folder-to-folder dependencies**

#### Detailed file-level analysis with custom settings
```bash
./scripts/dependency-cruiser.sh --path packages/web/src/utils --filename detailed-analysis --format dot --focus-depth 4
```
**Custom filename, detailed file-level view, 4 levels deep**

#### Quick package overview
```bash
./scripts/dependency-cruiser.sh --path . --filename project-overview --format archi --focus-depth 2
```
**Entire project overview, architectural view, 2 levels deep**

#### Using short flags for brevity
```bash
./scripts/dependency-cruiser.sh -p packages/web/src/components -f components-analysis -t ddot -d 3
```
**Short flag version for faster typing**

#### Get help
```bash
./scripts/dependency-cruiser.sh --help
```
**Shows usage information and available options**

## Filename Generation

The script automatically generates consistent filenames by applying transformations to both auto-generated filenames (from paths) and custom filenames provided by the user:

1. **Replacing slashes (`/`) with dashes (`-`)**
2. **Replacing dots (`.`) with underscores (`_`)**
3. **Preserving file extensions with underscore separator**

**Auto-generated Examples:**
- `packages/web/src/utils/table/hooks/useGetTableProps.tsx` → `packages-web-src-utils-table-hooks-useGetTableProps_tsx.html`
- `packages/components/src/Button.tsx` → `packages-components-src-Button_tsx.html`
- `src/utils` → `src-utils.html`

**Custom filename transformations:**
- Custom: `my.project/analysis.report` → `my_project-analysis_report.html`
- Custom: `utils/helper.functions` → `utils-helper_functions.html`

## Console Output Features

The script provides enhanced console feedback with:

- **Colorized output** for better readability (cyan, green, red, orange)
- **Real-time status updates** showing what's being analysed
- **Animated progress indicator** with spinning animation during analysis
- **Configuration display** showing the format and focus depth being used
- **Automatic browser opening** launches the HTML report when analysis completes
- **Cross-platform browser detection** (macOS `open`, Linux `xdg-open`, Windows `start`)
- **Clear error messages** with specific resolution steps
- **Warning messages** for invalid arguments with automatic fallbacks

Example output:
```
🚢 Cruising dependencies for: packages/web/src/components/FormBuilder.tsx

📊 Format: dot, 🔍 Focus depth: 3

Setting sail... [|] Analysing dependencies...

Analysis complete!

Dependency cruiser report generated: ./.dependency-cruiser/packages-web-src-components-FormBuilder_tsx.html
Opening report in browser...
```

## Configuration

The script uses the configuration file `.dependency-cruiser.cjs` with the following key settings:

### Analysis Scope
- **Focus Depth:** 3 levels deep from the target path
- **Exclusions:** `node_modules`, `@cloudscape-design`, `@risk-smart` packages
- **TypeScript Support:** Full TypeScript compilation and resolution

### Rules Enforced
- **Circular Dependencies:** Warns about circular imports
- **Orphaned Modules:** Identifies unused files
- **Deprecated Dependencies:** Flags deprecated npm packages
- **Missing Dependencies:** Catches unresolved imports
- **Test File Isolation:** Prevents production code from importing test files

### Output Features
- **Interactive HTML:** Clickable nodes and edges
- **SVG Graphics:** Scalable vector graphics with orthogonal splines
- **Focus Highlighting:** Emphasizes the target module and its connections
- **Collapsible Patterns:** Groups related modules for clarity

## Output

The script generates an HTML file in the `.dependency-cruiser/` directory containing:

- **Interactive dependency graph** (SVG format)
- **Module details** (file paths, types, relationships)
- **Dependency violations** (rule violations highlighted)

### Reading the Graph

- **Nodes:** Represent modules/files
- **Edges:** Show import/require relationships
- **Colors:** Indicate different module types (internal, external, etc.)
- **Shapes:** Different shapes for different file types
- **Violations:** Highlighted in red or with warning indicators

## Troubleshooting

### Common Issues

#### "dot: command not found"
```bash
Error: GraphViz is not installed. The 'dot' command is required for dependency visualization.
```
**Solution:** Install GraphViz using the package manager for your OS (see Prerequisites section).

#### "Could not resolve" warnings
These typically indicate:
- Missing TypeScript type definitions
- Incorrect import paths
- Missing npm packages

**Solution:** Check the `.dependency-cruiser.cjs` configuration and ensure all dependencies are properly installed.

#### Large graphs are slow to render
For complex modules with many dependencies:
- Consider analysing smaller subdirectories
- Adjust the focus depth (currently set to 3)
- Use exclusion patterns to filter out noise

### Performance Tips

- **Analyse specific files** rather than entire directories when possible
- **Use meaningful exclusions** to filter out unimportant dependencies
- **Increase focus depth cautiously** as it exponentially increases complexity

## Related Documentation

- [Dependency Cruiser Official Documentation](https://github.com/sverweij/dependency-cruiser)
- [Configuration Options Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md)
- [Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- [GraphViz Documentation](https://graphviz.org/documentation/)

## Configuration Customization

To modify the analysis behavior, edit `.dependency-cruiser.cjs`:

```typescript
// Add custom rules
forbidden: [
  {
    name: 'custom-rule',
    severity: 'error',
    from: { path: 'src/.*' },
    to: { path: 'packages/.*' }
  }
]

// Adjust exclusions
exclude: {
  path: ['^node_modules', '^dist', '^build']
}
```

## Integration with Development Workflow

### CI/CD Integration
The script can be integrated into CI/CD pipelines to automatically generate dependency reports for pull requests or releases.
