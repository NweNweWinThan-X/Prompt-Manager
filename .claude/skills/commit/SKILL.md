---
name: commit
description: Draft a commit message from the staged diff and run git commit. Always show the drafted message and get the user's approval first.
user-invocable: true
argument-hint: [target files or an extra note for the message]
allowed-tools: Bash, Read, Grep, Glob
---

# Git Commit Skill

Drafts a commit message in English and runs `git commit`.

## Usage

Just type `/commit`. Optionally pass target files or an extra note for the message.

## Steps

1. Run `git add ./` to stage all changes
2. Run `git diff --cached` to get the staged diff
3. Analyse the diff and work out what the change is really doing
4. Draft an English commit message following the rules below
5. **Show the drafted message to the user and ask for confirmation**
6. Run `git commit` once the user approves. If they ask for changes, revise the message first

## Commit message rules

- **First line (title)**: 50 characters or less, saying what the change does
  - Start with a verb in the imperative (Add, Fix, Remove, Refactor, Update, Improve, …)
  - If the current branch name starts with `feature-`, take the digits right after `feature-` as the ticket_id and prefix the title with `#{ticket_id}`
    - e.g. `feature-12345` => `#12345`, `feature-11111` => `#11111`, `feature-42476_v1` (with a trailing `_v1` etc.) => `#42476`
  - If the branch name does not start with `feature-`, do not add `#{ticket_id}`
  - e.g. `#{ticket_id} Add JWT refresh tokens and tidy up cookie handling`
- **Blank line**
- **Body (optional)**: background, reasoning and details as bullet points
  - Bullets start with `- `
  - Favour "why it was done" and "what changed as a result" over "what was done"

## When there is nothing to commit

If there is no diff after `git add ./`, tell the user there is nothing to commit.

## Examples

```
/commit
/commit src/app/page.tsx
```
