// Base path the site is served from. Set NEXT_PUBLIC_BASE_PATH at build time
// when deploying to a sub-path (GitHub Pages, etc.).
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

// Prefix a root-relative asset/data path with the base path.
export const withBasePath = (path: string) =>
  `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;

// This project's own repository, linked from the footer and the about page.
export const REPO_URL = 'https://github.com/NweNweWinThan-X/Prompt-Manager';
export const REPO_ISSUES_URL = `${REPO_URL}/issues`;
export const REPO_README_URL = `${REPO_URL}/blob/main/README.md`;
