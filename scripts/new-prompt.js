const fs = require("fs");
const path = require("path");
const { CATEGORIES, resolveCategorySlug, resolveCategoryName } = require("../categories.config");

// Create a new prompt: writes prompts/<slug>.md and prompts/<slug>.json
//
//   npm run new-prompt -- "My Prompt Title" --category programming
//   npm run new-prompt -- "My Prompt Title" --category programming --tags api,review
//
// Then run npm run dev (or npm run generate-data) to see it on the site.

const promptsDirectory = path.join(process.cwd(), "prompts");

function parseArgs(argv) {
  const options = { title: "", category: "other", tags: [], author: "" };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--category" || arg === "--tags" || arg === "--author") {
      const value = argv[i + 1] || "";
      i += 1;
      if (arg === "--category") options.category = value;
      if (arg === "--author") options.author = value;
      if (arg === "--tags") {
        options.tags = value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    } else if (!options.title) {
      options.title = arg;
    }
  }

  return options;
}

// Title to slug: non-alphanumerics become hyphens, letters of any script are kept, so the filename stays usable
function slugify(title) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `prompt-${Date.now()}`;
}

function main() {
  const { title, category, tags, author } = parseArgs(process.argv.slice(2));

  if (!title) {
    console.error('Usage: npm run new-prompt -- "Title" [--category <category>] [--tags a,b] [--author Name]');
    console.error(`Available categories: ${CATEGORIES.map((c) => c.slug).join(", ")}`);
    process.exit(1);
  }

  const categoryName = resolveCategoryName(category);
  if (resolveCategorySlug(category) === "other" && resolveCategorySlug("other") !== resolveCategorySlug(category)) {
    console.warn(`Unrecognized category "${category}", falling back to Other`);
  }

  const slug = slugify(title);
  const mdPath = path.join(promptsDirectory, `${slug}.md`);
  const jsonPath = path.join(promptsDirectory, `${slug}.json`);

  if (fs.existsSync(mdPath)) {
    console.error(`Already exists: ${path.relative(process.cwd(), mdPath)}`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const frontMatter = [
    "---",
    `title: ${title}`,
    "description: One sentence on what this prompt does.",
    `category: ${categoryName}`,
    tags.length ? `tags: [${tags.join(", ")}]` : null,
    author ? `author: ${author}` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const body = [
    "",
    `# ${title}`,
    "",
    "Write the prompt here. Use [square brackets] for the parts the user fills in.",
    "",
  ].join("\n");

  const metadata = {
    rating: 0,
    createdAt: today,
    featured: false,
  };

  if (!fs.existsSync(promptsDirectory)) {
    fs.mkdirSync(promptsDirectory, { recursive: true });
  }

  fs.writeFileSync(mdPath, `${frontMatter}\n${body}`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log(`Created ${path.relative(process.cwd(), mdPath)}`);
  console.log(`Created ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Category: ${categoryName} · run npm run dev to see it`);
}

main();
