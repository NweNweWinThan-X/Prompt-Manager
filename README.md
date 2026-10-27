# Prompt Library

> Explore, use, and share carefully curated AI prompts to unlock the full potential of artificial intelligence.

A multilingual prompt library built with Next.js. The interface is available in
**English** (primary), **日本語**, **中文** and **မြန်မာ** (optional translations,
falling back to English for any missing key).

## 🚀 Live demo

Deployed on Vercel: _URL to be added once the project is created._

## ✨ Features

- Browse prompts by category (content creation, programming, design, data, marketing, education)
- Full-text search over the generated prompt index
- Popular prompts view with client-side sorting
- Static export — deployable to GitHub Pages or any static host
- Four-language interface with a language switcher and English fallback

## 🛠️ Tech stack

- **Next.js 13** (App Router, static export)
- **React 18** + **TypeScript**
- **Markdown + JSON** prompt files (`prompts/`)
- Custom lightweight i18n layer (`src/lib/i18n.ts`)

## 📁 Project structure

```
src/
├── app/            # Next.js app router pages
├── components/     # React components
├── config/         # Categories, languages and site (base path) config
├── context/        # Language context
├── lib/            # i18n and prompt utilities
└── types/          # TypeScript types
prompts/            # Prompt content (Markdown + JSON metadata)
public/
├── data/           # Generated index and paginated data
└── locales/        # UI translations: en, ja, zh, my
scripts/            # Index and paginated-data generators
```

## 🔧 Local development

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

The dev and build scripts regenerate `public/data` from `prompts/` before
starting Next.js. Open http://localhost:3000.

## 🏗️ Build

```bash
npm run build
```

The static site is written to `out/`. To deploy under a sub-path (for example
GitHub Pages at `https://<user>.github.io/Prompt-Manager/`), set the base path:

```bash
NEXT_PUBLIC_BASE_PATH=/Prompt-Manager npm run build:optimized
```

`site.config.js` and `src/config/site.ts` read that variable, so the Next.js
`basePath`, the generated data output and every runtime fetch stay in sync.

## ▲ Deploying to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Leave the defaults — Vercel detects Next.js and runs `npm run build`, which
   regenerates the prompt data and writes the static export.
3. Deploy. Every later push to `main` redeploys automatically.

Leave `NEXT_PUBLIC_BASE_PATH` unset on Vercel: the site is served from the
domain root there, and the variable is only needed for a sub-path host such as
GitHub Pages.

## 🌐 Adding or editing a language

1. Add the locale to `LANGUAGES` in [`src/config/languages.ts`](src/config/languages.ts),
   including the `flag` country code shown in the switcher.
2. Create `public/locales/<code>/common.json` using
   [`public/locales/en/common.json`](public/locales/en/common.json) as the key reference.

English is the fallback language: any key missing from another locale is served
from the English file, so a partial translation is fine.

## ➕ Adding a prompt

Create a pair of files in `prompts/`:

- `my-prompt.md` — front matter (title, description, category, tags…) plus the prompt body
- `my-prompt.json` — metadata used by the index (rating, dates, featured flag…)

Then run `npm run generate-data` (or just `npm run dev`) to refresh the index.

## 📄 License

MIT — see [LICENSE](LICENSE). 
