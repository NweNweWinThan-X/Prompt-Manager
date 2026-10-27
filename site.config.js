// Shared site configuration for next.config.js and the data generation scripts.
// Set NEXT_PUBLIC_BASE_PATH (e.g. "/Prompt-Manager") when deploying to a
// sub-path such as GitHub Pages. Empty means the site is served from the root.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const basePath = rawBasePath.replace(/\/$/, "");

module.exports = {
  basePath,
  // Directory inside `out/` that mirrors the base path (empty when served at root)
  outDir: basePath.replace(/^\//, ""),
};
