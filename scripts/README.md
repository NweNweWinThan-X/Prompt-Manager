# Prompt library scripts

This directory holds the utility scripts that maintain the prompt library.

## generate-index.js

Builds `public/data/prompts-index.json` from the Markdown files in `prompts/`.
The search page loads that index.

## generate-paginated-data.js

Builds the paginated data under `public/data/paginated/` — all prompts split
into pages, plus a folder per category. Categories are keyed by slug, resolved
through `categories.config.js`, so a prompt's `category` value may be the
canonical name, the slug or one of the aliases.

Both of the above run automatically on `npm run dev` and `npm run build`, or on
their own with `npm run generate-data`.

## new-prompt.js

Creates a prompt's `.md` and `.json` pair:

```bash
npm run new-prompt -- "My Prompt Title" --category programming --tags api,review
```

## optimize-build.js

Post-processes the static export in `out/`. Runs as part of
`npm run build:optimized`.

## update-json-files.js

A one-off migration: strips fields the site no longer uses (`views`, `likes`,
`usageCount`, `favoriteCount`, `slug`) from every prompt JSON file.

### Usage

```bash
# from the repository root
node scripts/update-json-files.js
```

### What it does

1. Scans every JSON file in `prompts/`.
2. Removes the `views`, `likes`, `usageCount`, `favoriteCount` and `slug` fields.
3. Keeps the rest (`featured`, `createdAt`, `updatedAt`, `rating`).
4. Writes each file back.

### Before you run it

- It rewrites the original files in place, so commit or back up first.
- It prints how many files succeeded and how many failed when it finishes.
