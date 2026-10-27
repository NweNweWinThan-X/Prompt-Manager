// Single source of truth for prompt categories, shared by the app
// (src/config/categories.ts) and the data generation scripts.
//
// `name` is the value a prompt's `category` front matter should use.
// `aliases` keeps other spellings working — the Chinese names the prompts
// were originally written with, and any shorthand worth accepting — so an
// existing prompt file keeps landing in the right category.
const CATEGORIES = [
  {
    slug: "content-creation",
    name: "Content Creation",
    nameKey: "categories.content_creation",
    icon: "fa-pen-fancy",
    aliases: ["内容创作", "content", "writing"],
  },
  {
    slug: "programming",
    name: "Programming",
    nameKey: "categories.programming",
    icon: "fa-code",
    aliases: ["编程开发", "code", "development", "dev"],
  },
  {
    slug: "creative-design",
    name: "Creative Design",
    nameKey: "categories.creative_design",
    icon: "fa-palette",
    aliases: ["创意设计", "design"],
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    nameKey: "categories.data_analysis",
    icon: "fa-chart-line",
    aliases: ["数据分析", "data"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    nameKey: "categories.marketing",
    icon: "fa-bullhorn",
    aliases: ["营销推广"],
  },
  {
    slug: "education",
    name: "Education",
    nameKey: "categories.education",
    icon: "fa-graduation-cap",
    aliases: ["教育学习", "learning"],
  },
  {
    slug: "other",
    name: "Other",
    nameKey: "categories.other",
    icon: "fa-ellipsis",
    aliases: ["其他"],
  },
];

// Map a prompt's `category` value — canonical name, slug or alias — to its
// slug. Returns "other" for anything unrecognised so a typo never drops a
// prompt out of the site.
function resolveCategorySlug(value) {
  if (!value) return "other";

  // Front matter may quote the value, e.g. category: "Data Analysis".
  const needle = String(value)
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim()
    .toLowerCase();
  const match = CATEGORIES.find(
    (category) =>
      category.slug === needle ||
      category.name.toLowerCase() === needle ||
      category.aliases.some((alias) => alias.toLowerCase() === needle)
  );

  return match ? match.slug : "other";
}

// The canonical display name for a prompt's `category` value.
function resolveCategoryName(value) {
  const slug = resolveCategorySlug(value);
  return CATEGORIES.find((category) => category.slug === slug).name;
}

module.exports = { CATEGORIES, resolveCategorySlug, resolveCategoryName };
