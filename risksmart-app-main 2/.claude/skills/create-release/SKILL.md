---
name: create-release
description: Creates a new GitHub release — either a main release from the main branch or a hotfix release by cherry-picking commits onto a patch branch. Analyses commits, proposes a semver bump, generates categorised release notes with Linear ticket links, and moves completed tickets to "QA - Staging". Use when cutting a new release, shipping to staging, creating a hotfix, or when the user says "create a release", "cut a release", "new release", "hotfix", or "ship it".
argument-hint: [--major | --minor]
allowed-tools: Read, Bash, Grep, Glob
---

# Create Release

Creates a new versioned GitHub release with categorised release notes and
automatic Linear ticket status updates. Supports both main releases and
hotfix releases.

## Optional Arguments

- `--major` — Force a major version bump (main releases only).
- `--minor` — Force a minor version bump (main releases only).

## Steps

### Step 0 — Release type gate

Ask the user:

> Is this a **main release** or a **hotfix**?

- If **main release** → proceed to [Main Release Flow](#main-release-flow).
- If **hotfix** → proceed to [Hotfix Release Flow](#hotfix-release-flow).

---

# Main Release Flow

### Step M1 — Validate branch and CI status

1. Fetch latest main:
   ```bash
   git fetch origin main --quiet
   ```

2. Check CI status on the latest main commit:
   ```bash
   gh api repos/{owner}/{repo}/commits/main/status --jq '.state'
   ```
   - If `success` or `pending` — note the status and proceed.
   - If `failure` — WARN the user that CI is failing on main and ask
     whether to proceed anyway. Do NOT continue without confirmation.
   - If the `gh` command fails (e.g. HTTP 401, "Bad credentials", or
     any non-zero exit), STOP immediately and tell the user:

     > `gh` CLI authentication failed. Please run `gh auth login` to
     > re-authenticate, then re-run this skill.

     Do NOT continue the release flow until `gh` is working.

### Step M2 — Determine the last release

Find the most recent release tag (excluding hotfix suffixes):

```bash
git tag --sort=-creatordate | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1
```

Store this as `$LAST_TAG`. Report it to the user.

### Step M3 — Collect commits since last release

List all commits on main since the last tag, excluding merge commits:

```bash
git log $LAST_TAG..origin/main --oneline --no-merges
```

Also collect the full log with PR references for the release body:

```bash
git log $LAST_TAG..origin/main --oneline
```

If there are zero new commits, STOP:

> No new commits on main since $LAST_TAG. Nothing to release.

### Step M4 — Extract and categorise changes

Parse each commit message and categorise using conventional commit
prefixes and common patterns:

| Category | Patterns |
|----------|----------|
| **Breaking Changes** | `BREAKING CHANGE`, `!:` after type |
| **Features** | `feat`, `add`, `new`, `Enable` |
| **Bug Fixes** | `fix`, `patch`, `hotfix` |
| **Migrations** | `V3 Migration`, `migrate`, `migration` |
| **Refactoring** | `refactor`, `restructure`, `split` |
| **Infrastructure / CI** | `ci`, `chore`, `build`, `deploy`, `infra`, `deps`, `install` |
| **Documentation** | `doc`, `guide`, `README` |
| **Other** | Anything not matching the above |

### Step M5 — Extract Linear ticket IDs

Parse all commit messages for ticket references:

```bash
git log $LAST_TAG..origin/main --oneline \
  | grep -oiE 'RSP[- ][0-9]+' \
  | sed 's/RSP /RSP-/' \
  | sort -u
```

For each ticket, note whether the commit language indicates:
- **Completing** — Direct reference like `RSP-1234 ...` or `[RSP-1234] ...`
- **Contributing** — `Contributes to RSP-1234`, `[Contributes to RSP-1234]`

This distinction matters in Step M9.

### Step M6 — Propose version number

Determine the bump based on the current version (`$LAST_TAG`) and changes:

1. If `--major` was passed, bump major.
2. If `--minor` was passed, bump minor.
3. If **Breaking Changes** were found, recommend major bump.
4. Otherwise, bump **minor** (the default for a main release).

Present the proposed version to the user:

> **Proposed release: v{X}.{Y}.{Z}**
>
> Previous: $LAST_TAG
> Bump type: minor (no breaking changes detected)

### Step M7 — Present release summary for confirmation

Display the full release summary and ASK the user to confirm before
proceeding. Format:

> ## Release v{X}.{Y}.{Z}
>
> **{N} commits** since $LAST_TAG | **{M} Linear tickets** referenced
>
> ### Features
> - feat(scoring-settings): Flatten matrix data model ([RSP-4463](https://linear.app/risksmart/issue/RSP-4463)) (#5572)
>
> ### Bug Fixes
> - fix: format ignore list for boolean-prop-naming rule
>
> ### Migrations
> - RSP-4527 migrating assessments insert to V3 ([RSP-4527](https://linear.app/risksmart/issue/RSP-4527))
>
> ### Infrastructure / CI
> - install playwright deps for web test in post-merge app deploy
>
> ### Other
> - ...
>
> ### Linear Tickets
> | Ticket | Relationship | Action |
> |--------|-------------|--------|
> | RSP-4527 | Completing | Will move to QA - Staging |
> | RSP-4463 | Contributes to | Will NOT move (ongoing work) |
>
> **Proceed with creating this release?**

Do NOT proceed without explicit user confirmation.

### Step M8 — Create the GitHub release

Create the release targeting main:

```bash
gh release create v{X}.{Y}.{Z} \
  --target main \
  --title "v{X}.{Y}.{Z}" \
  --notes "$(cat <<'EOF'
<generated release notes in markdown>
EOF
)"
```

The release notes body should include:
- The categorised change list from Step M7
- Linear ticket links in the format `[RSP-1234](https://linear.app/risksmart/issue/RSP-1234)`
- PR links in the format `[#5572](https://github.com/risk-smart/risksmart-app/pull/5572)`

If the `gh` command fails, STOP immediately and tell the user:

> `gh` CLI command failed. Please run `gh auth login` to
> re-authenticate, then re-run this skill.

Do NOT continue the release flow until `gh` is working.

### Step M9 — Move completed Linear tickets to "QA - Staging"

For each ticket identified as **Completing** (not "Contributes to"):

1. Fetch the ticket using `mcp__plugin_rs_linear__get_issue`.
2. If the ticket is already in `QA - Staging` or `Ready for Release`,
   skip it.
3. Otherwise, move it using `mcp__plugin_rs_linear__save_issue` with
   `state: "QA - Staging"`.

For tickets identified as **Contributing**, do NOT move them. Instead
list them:

> **Tickets left in current state (contributing commits only):**
> - RSP-4463 — "Update frontend to use new scoring settings" (In Development)

### Step M10 — Final report

Summarise the release:

> ## Release complete
>
> **Tag:** v{X}.{Y}.{Z}
> **URL:** https://github.com/risk-smart/risksmart-app/releases/tag/v{X}.{Y}.{Z}
>
> **Tickets moved to QA - Staging:** RSP-4527, RSP-4549, RSP-4567
> **Tickets unchanged (contributing only):** RSP-4463, RSP-4529
>
> **Next steps:**
> - QA team can begin testing on staging
> - Run `/release-audit v{X}.{Y}.{Z}` to verify ticket states

### Step M11 — (Optional) Deploy to staging

Ask the user:

> Would you like to trigger the **staging deploy** for this release?

- If **no** — skip this step and end the flow.
- If **yes** — ask which regions to deploy using AskUserQuestion
  with multiSelect enabled:

  > Which regions should be deployed?
  >
  > - UK (eu-west-2)
  > - US (us-east-1)

  Then trigger the GitHub Actions workflow using the release tag as
  the ref:

  ```bash
  gh workflow run "Manual / App Deploy Staging" \
    --repo risk-smart/risksmart-app \
    --ref v{X}.{Y}.{Z} \
    -f deploy_uk=<true|false> \
    -f deploy_us=<true|false>
  ```

  Set `deploy_uk` and `deploy_us` based on the user's region
  selection.

  If the `gh` command fails, STOP immediately and tell the user:

  > `gh` CLI command failed. Please run `gh auth login` to
  > re-authenticate, then re-run this skill.

  On success, report:

  > Staging deploy triggered for v{X}.{Y}.{Z}
  > **Regions:** UK, US (or whichever were selected)
  >
  > Monitor the workflow run at:
  > https://github.com/risk-smart/risksmart-app/actions/workflows/manual-app-deploy-staging.yml

---

# Hotfix Release Flow

### Step H1 — Select the base version to patch

1. List the 5 most recent main release tags:
   ```bash
   git tag --sort=-creatordate | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -5
   ```

2. Present them to the user as options, with a 6th option to specify
   a version manually:

   > Which release are you patching?
   >
   > 1. v2.67.0
   > 2. v2.66.0
   > 3. v2.65.0
   > 4. v2.64.0
   > 5. v2.63.13
   > 6. Other (specify version)

   Use AskUserQuestion with the tag values as option labels.

3. If the user selects "Other", ask them to provide the exact tag
   (e.g. `v2.60.0`). Validate it exists:
   ```bash
   git rev-parse --verify <tag> 2>/dev/null
   ```
   If not found, STOP and tell the user.

4. Store the selected tag as `$BASE_TAG`.

### Step H2 — Determine the hotfix branch and version

1. Check if a hotfix branch already exists for this base version:
   ```bash
   git fetch origin --quiet
   git branch -r | grep "origin/$BASE_TAG-x"
   ```

2. **If the branch already exists:**
   - Check it out:
     ```bash
     git checkout -b $BASE_TAG-x origin/$BASE_TAG-x
     ```
   - Find the latest hotfix tag for this base:
     ```bash
     git tag --sort=-creatordate | grep -E "^${BASE_TAG}-[0-9]+$" | head -1
     ```
   - If a previous hotfix tag exists (e.g. `v2.67.0-3`), extract the
     suffix number and increment it by 1 for the new version.
   - If no hotfix tags exist yet, the new version will be `$BASE_TAG-1`.

3. **If the branch does not exist:**
   - Create it from the base tag:
     ```bash
     git checkout -b $BASE_TAG-x $BASE_TAG
     ```
   - The new hotfix version will be `$BASE_TAG-1`.

4. Store the new version as `$HOTFIX_VERSION` (e.g. `v2.67.0-1`).
   Report to the user:

   > **Hotfix branch:** $BASE_TAG-x
   > **New hotfix version:** $HOTFIX_VERSION

### Step H3 — Select commits to cherry-pick

Ask the user:

> Do you have the git commit hashes you want to cherry-pick?

1. **If yes** — ask the user to provide the commit hashes (space or
   comma separated). Validate each hash exists:
   ```bash
   git cat-file -t <hash> 2>/dev/null
   ```
   If any hash is invalid, report which ones failed and ask the user
   to correct them.

2. **If no** — show recent commits on main for selection:
   ```bash
   git log origin/main --oneline --no-merges -30
   ```
   Present the commits in a numbered list and ask the user to specify
   which ones to cherry-pick (by number or hash). The user may select
   multiple commits.

3. Store the selected commit hashes in order as `$CHERRY_PICKS`.
   Confirm the selection with the user:

   > **Commits to cherry-pick (in order):**
   > 1. `abc1234` — Fix critical bug in login flow (#5601)
   > 2. `def5678` — Patch payment validation (#5603)
   >
   > Proceed with cherry-picking these commits?

   Do NOT proceed without confirmation.

### Step H4 — Cherry-pick commits

Cherry-pick each commit in order onto the hotfix branch:

```bash
git cherry-pick <hash>
```

- If a cherry-pick **succeeds**, continue to the next.
- If a cherry-pick **fails** (conflict), STOP and tell the user:

  > Cherry-pick of `<hash>` failed due to conflicts.
  > Please resolve the conflicts manually, then run:
  > ```
  > git cherry-pick --continue
  > ```
  > After resolving, re-run this skill to continue the release.

  Do NOT attempt to auto-resolve conflicts.

### Step H5 — Push the hotfix branch

Ask the user for confirmation before pushing:

> Ready to push branch `$BASE_TAG-x` to origin. Proceed?

On confirmation, push with `--no-verify`:

```bash
git push origin $BASE_TAG-x --no-verify
```

If the branch already existed on the remote, use:

```bash
git push origin $BASE_TAG-x --no-verify
```

Report success or failure.

### Step H6 — Extract and categorise changes

List the cherry-picked commits on the hotfix branch. If the branch
already had previous hotfix commits, only include commits since the
last hotfix tag. Otherwise include all commits since `$BASE_TAG`:

```bash
# If previous hotfix tag exists:
git log $LAST_HOTFIX_TAG..$BASE_TAG-x --oneline --no-merges

# If no previous hotfix tag:
git log $BASE_TAG..$BASE_TAG-x --oneline --no-merges
```

Categorise using the same rules as Step M4.

### Step H7 — Extract Linear ticket IDs

Parse the cherry-picked commit messages for ticket references using
the same approach as Step M5. Classify each as Completing or
Contributing.

### Step H8 — Present release summary for confirmation

Display the hotfix release summary and ASK the user to confirm:

> ## Hotfix Release $HOTFIX_VERSION
>
> **Base:** $BASE_TAG | **Branch:** $BASE_TAG-x | **{N} cherry-picked commits**
>
> ### Bug Fixes
> - Fix critical bug in login flow ([RSP-4700](https://linear.app/risksmart/issue/RSP-4700)) (#5601)
>
> ### Other
> - ...
>
> ### Linear Tickets
> | Ticket | Current Status | Relationship | Action |
> |--------|---------------|-------------|--------|
> | RSP-4700 | In Development | Completing | Will move to QA - Staging |
>
> **Proceed with creating this hotfix release?**

Do NOT proceed without explicit user confirmation.

### Step H9 — Create the GitHub release

Create the release targeting the **hotfix branch** (not main):

```bash
gh release create $HOTFIX_VERSION \
  --target $BASE_TAG-x \
  --title "$HOTFIX_VERSION" \
  --notes "$(cat <<'EOF'
<generated release notes in markdown>
EOF
)"
```

The release notes body should include:
- A header noting this is a hotfix: `**Hotfix for $BASE_TAG**`
- The categorised change list from Step H8
- Linear ticket links and PR links

If the `gh` command fails, STOP immediately and tell the user:

> `gh` CLI command failed. Please run `gh auth login` to
> re-authenticate, then re-run this skill.

Do NOT continue the release flow until `gh` is working.

### Step H10 — Move completed Linear tickets to "QA - Staging"

Same logic as Step M9:

1. For **Completing** tickets — move to `QA - Staging` unless already
   in `QA - Staging` or `Ready for Release`.
2. For **Contributing** tickets — leave unchanged and list them.

### Step H11 — Final report

Summarise the hotfix release:

> ## Hotfix release complete
>
> **Tag:** $HOTFIX_VERSION
> **Branch:** $BASE_TAG-x
> **URL:** https://github.com/risk-smart/risksmart-app/releases/tag/$HOTFIX_VERSION
>
> **Cherry-picked commits:** 2
> **Tickets moved to QA - Staging:** RSP-4700
> **Tickets unchanged (contributing only):** none
>
> **Next steps:**
> - QA team can begin testing on staging
> - Run `/release-audit $HOTFIX_VERSION` to verify ticket states
> - The hotfix branch `$BASE_TAG-x` remains available for future
>   patches against this version

### Step H12 — (Optional) Deploy to staging

Ask the user:

> Would you like to trigger the **staging deploy** for this hotfix?

- If **no** — skip this step and end the flow.
- If **yes** — ask which regions to deploy using AskUserQuestion
  with multiSelect enabled:

  > Which regions should be deployed?
  >
  > - UK (eu-west-2)
  > - US (us-east-1)

  Then trigger the GitHub Actions workflow using the hotfix tag as
  the ref:

  ```bash
  gh workflow run "Manual / App Deploy Staging" \
    --repo risk-smart/risksmart-app \
    --ref $HOTFIX_VERSION \
    -f deploy_uk=<true|false> \
    -f deploy_us=<true|false>
  ```

  Set `deploy_uk` and `deploy_us` based on the user's region
  selection.

  If the `gh` command fails, STOP immediately and tell the user:

  > `gh` CLI command failed. Please run `gh auth login` to
  > re-authenticate, then re-run this skill.

  On success, report:

  > Staging deploy triggered for $HOTFIX_VERSION
  > **Regions:** UK, US (or whichever were selected)
  >
  > Monitor the workflow run at:
  > https://github.com/risk-smart/risksmart-app/actions/workflows/manual-app-deploy-staging.yml

---

## Verification

### `gh` CLI authentication
- [ ] Any `gh` command failure STOPS the flow immediately
- [ ] User is told to run `gh auth login` and re-run the skill
- [ ] Flow does NOT continue, fall back, or show manual commands on `gh` failure

### Main release
- [ ] User confirmed this is a main release
- [ ] CI status on main was checked (flow stopped if `gh` failed)
- [ ] Previous release tag was correctly identified
- [ ] All commits since last release were collected
- [ ] Changes were categorised and presented to user
- [ ] Linear tickets were extracted and classified (completing vs contributing)
- [ ] Version bump was proposed and confirmed by user
- [ ] GitHub release was created with categorised notes
- [ ] Completing tickets were moved to "QA - Staging"
- [ ] Contributing tickets were left unchanged and reported
- [ ] Final summary with release URL was shown
- [ ] User was offered optional staging deploy
- [ ] If accepted, region selection was presented and workflow dispatched against release tag

### Hotfix release
- [ ] User confirmed this is a hotfix
- [ ] Base version was selected and validated
- [ ] Hotfix branch was created or checked out (pattern: $BASE_TAG-x)
- [ ] Hotfix version was calculated (incrementing suffix)
- [ ] Commits were selected (user-provided hashes or interactive selection)
- [ ] Cherry-picks were confirmed before execution
- [ ] All cherry-picks completed successfully (no unresolved conflicts)
- [ ] Branch push was confirmed by user before execution
- [ ] Branch was pushed with --no-verify
- [ ] Changes were categorised and presented to user
- [ ] Linear tickets were extracted and classified
- [ ] GitHub release was created against the hotfix branch (not main)
- [ ] Completing tickets were moved to "QA - Staging"
- [ ] Contributing tickets were left unchanged and reported
- [ ] Final summary with release URL and branch info was shown
- [ ] User was offered optional staging deploy
- [ ] If accepted, region selection was presented and workflow dispatched against hotfix tag
