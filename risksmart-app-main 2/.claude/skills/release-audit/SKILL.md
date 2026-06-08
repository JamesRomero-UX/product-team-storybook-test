---
name: release-audit
description: Audits a git release tag by extracting Linear ticket references from commits, checking each ticket's status in Linear, and reporting any tickets not in the expected release-ready states. Use when checking release readiness, verifying ticket statuses before or after a release, or auditing any tagged version.
argument-hint: <tag> [--expected-status "Status1, Status2"]
allowed-tools: Read, Bash, Grep, Glob
---

# Release Audit

Cross-references a git release tag with Linear ticket statuses to surface
tickets that are not in the expected workflow state.

## Required Arguments

- `$1` — Git tag to audit (e.g. `v2.67.0`). If omitted, defaults to the
  most recent tag (`git tag --sort=-creatordate | head -1`).

## Optional Arguments

- `--expected-status` — Comma-separated list of acceptable Linear statuses.
  Defaults to `"QA - Staging, Ready for Release"`.

## Argument Validation

1. If `$1` is provided, verify the tag exists:
   ```bash
   git rev-parse --verify "$1" 2>/dev/null
   ```
   If the tag does not exist, STOP and tell the user.

2. If `$1` is omitted, resolve the latest tag:
   ```bash
   git tag --sort=-creatordate | head -1
   ```

3. Parse `--expected-status` if provided, otherwise use the defaults.

## Steps

### Step 1 — Determine the comparison range

Find the tag immediately before the target tag:

```bash
git tag --sort=-creatordate | grep -A1 "^<tag>$" | tail -1
```

If no previous tag exists, use `git log <tag> --oneline --no-merges` for
all commits up to the tag.

### Step 2 — Extract commits in the release

List commits between the two tags (excluding merges):

```bash
git log <previous-tag>..<tag> --oneline --no-merges
```

### Step 3 — Extract Linear ticket IDs

Parse commit messages for ticket references matching `RSP-\d+` (handling
both `RSP-1234` and `RSP 1234` formats):

```bash
git log <previous-tag>..<tag> --oneline --no-merges \
  | grep -oiE 'RSP[- ][0-9]+' \
  | sed 's/RSP /RSP-/' \
  | sort -u
```

If no tickets are found, report that and STOP.

### Step 4 — Check each ticket's status in Linear

For each extracted ticket ID, use the `mcp__plugin_rs_linear__get_issue`
tool to fetch the ticket. Extract `status`, `title`, and `assignee`.

Call all ticket lookups in parallel for efficiency.

### Step 5 — Classify and report

Compare each ticket's status against the expected statuses.

Produce a summary table:

```
| Ticket    | Title            | Status          | Assignee     |
|-----------|------------------|-----------------|--------------|
| RSP-1234  | Some feature     | QA - Staging    | Jane Doe     |
| RSP-5678  | Another feature  | In Development  | John Smith   |
```

Then list any tickets NOT in an expected status under a clear heading, e.g.:

> **Tickets not in expected state:**
>
> - **RSP-5678** — "Another feature" is in **In Development** (assignee: John Smith)

### Step 6 — Add context for "Contributes to" commits

If a ticket is not in an expected state, check if the commits referencing
it use "Contributes to" or similar partial-work language. If so, note this:

> Note: Commits for RSP-5678 are marked "Contributes to", indicating
> ongoing work — the ticket may intentionally remain in development.

## Output Format

1. **Release summary** — Tag, date, commit count, ticket count.
2. **Full ticket table** — All tickets with statuses.
3. **Flagged tickets** — Tickets not matching expected statuses, with
   context about whether partial contributions explain the state.
4. **Verdict** — A one-line summary: either "All tickets are release-ready"
   or "N ticket(s) require attention".

## Verification

- [ ] Tag was resolved and validated
- [ ] All commits between tags were listed
- [ ] All ticket IDs were extracted (both `RSP-1234` and `RSP 1234` formats)
- [ ] Each ticket was looked up in Linear
- [ ] Report includes the full table and any flagged tickets
- [ ] "Contributes to" context was added where applicable
