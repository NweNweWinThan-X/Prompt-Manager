const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const {
  resolveCategorySlug,
  resolveCategoryName,
} = require("../categories.config");

// Config
const ITEMS_PER_PAGE = 9; // Prompts shown per page
const CATEGORIES_ITEMS_PER_PAGE = 9; // Prompts shown per page on a category page

// Where the prompt files live
const promptsDirectory = path.join(process.cwd(), "prompts");
// Output directory
const outputDirectory = path.join(process.cwd(), "public/data");
// The build output needs a copy of the data too
const { outDir } = require("../site.config");
const buildOutputDirectory = path.join(process.cwd(), "out", outDir, "data");

/**
 * Read every prompt.
 */
function getAllPrompts() {
  // Nothing to read if the directory is missing
  if (!fs.existsSync(promptsDirectory)) {
    return [];
  }

  // Collect the markdown files
  const filenames = fs.readdirSync(promptsDirectory);
  const mdFiles = filenames.filter((filename) => filename.endsWith(".md"));

  const allPromptsData = mdFiles.map((filename) => {
    // The slug is the filename without ".md"
    const slug = filename.replace(/\.md$/, "");

    // Read the markdown file
    const fullPath = path.join(promptsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Parse the frontmatter with gray-matter
    const matterResult = matter(fileContents);

    // The matching JSON file, if any, carries extra metadata
    const jsonFilePath = path.join(promptsDirectory, `${slug}.json`);
    let jsonData = {};

    if (fs.existsSync(jsonFilePath)) {
      try {
        const jsonContent = fs.readFileSync(jsonFilePath, "utf8");
        jsonData = JSON.parse(jsonContent);
      } catch (error) {
        console.error(`Error parsing JSON for ${slug}:`, error);
      }
    }

    // Merge the frontmatter and the JSON metadata
    return {
      slug,
      ...matterResult.data,
      ...jsonData,
    };
  });

  // Sort by creation date, newest first
  return allPromptsData.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
}

/**
 * Create the output directories the generator needs.
 */
function createOutputDirectories() {
  // Main output directory
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  // Subdirectory for the paginated data
  const paginatedDir = path.join(outputDirectory, "paginated");
  if (!fs.existsSync(paginatedDir)) {
    fs.mkdirSync(paginatedDir, { recursive: true });
  }

  // Build output directory
  if (!fs.existsSync(buildOutputDirectory)) {
    fs.mkdirSync(buildOutputDirectory, { recursive: true });
  }

  // Paginated data subdirectory under the build output
  const buildPaginatedDir = path.join(buildOutputDirectory, "paginated");
  if (!fs.existsSync(buildPaginatedDir)) {
    fs.mkdirSync(buildPaginatedDir, { recursive: true });
  }

  return { paginatedDir, buildPaginatedDir };
}

/**
 * Write the paginated data for the full prompt list.
 */
function generateAllPromptsPages(allPrompts, paginatedDir, buildPaginatedDir) {
  const totalPages = Math.ceil(allPrompts.length / ITEMS_PER_PAGE);

  console.log(`Generating paginated data for all prompts: ${totalPages} pages`);

  // Pagination metadata
  const paginationMeta = {
    total: allPrompts.length,
    perPage: ITEMS_PER_PAGE,
    totalPages,
  };

  // Write the pagination metadata
  fs.writeFileSync(
    path.join(paginatedDir, "all-prompts-meta.json"),
    JSON.stringify(paginationMeta, null, 2)
  );
  fs.writeFileSync(
    path.join(buildPaginatedDir, "all-prompts-meta.json"),
    JSON.stringify(paginationMeta, null, 2)
  );

  // One file per page
  for (let page = 1; page <= totalPages; page++) {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = allPrompts.slice(startIndex, endIndex);

    fs.writeFileSync(
      path.join(paginatedDir, `all-prompts-page-${page}.json`),
      JSON.stringify(pageData, null, 2)
    );
    fs.writeFileSync(
      path.join(buildPaginatedDir, `all-prompts-page-${page}.json`),
      JSON.stringify(pageData, null, 2)
    );
  }
}

/**
 * Write the paginated data for each category.
 */
function generateCategoryPages(allPrompts, paginatedDir, buildPaginatedDir) {
  // Group the prompts by category
  const categories = {};

  allPrompts.forEach((prompt) => {
    if (prompt.category) {
      // Group by slug so frontmatter aliases land in the right category
      const slug = resolveCategorySlug(prompt.category);
      if (!categories[slug]) {
        categories[slug] = [];
      }
      categories[slug].push(prompt);
    }
  });

  // Paginate each category
  Object.entries(categories).forEach(([categorySlug, categoryPrompts]) => {
    const categoryName = resolveCategoryName(categorySlug);
    const totalPages = Math.ceil(
      categoryPrompts.length / CATEGORIES_ITEMS_PER_PAGE
    );

    console.log(`Generating paginated data for category "${categoryName}": ${totalPages} pages`);

    // Pagination metadata
    const paginationMeta = {
      category: categoryName,
      total: categoryPrompts.length,
      perPage: CATEGORIES_ITEMS_PER_PAGE,
      totalPages,
    };

    // Create the category directories
    const categoryDir = path.join(paginatedDir, "categories", categorySlug);
    const buildCategoryDir = path.join(
      buildPaginatedDir,
      "categories",
      categorySlug
    );

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    if (!fs.existsSync(buildCategoryDir)) {
      fs.mkdirSync(buildCategoryDir, { recursive: true });
    }

    // Write the pagination metadata
    fs.writeFileSync(
      path.join(categoryDir, "meta.json"),
      JSON.stringify(paginationMeta, null, 2)
    );
    fs.writeFileSync(
      path.join(buildCategoryDir, "meta.json"),
      JSON.stringify(paginationMeta, null, 2)
    );

    // One file per page
    for (let page = 1; page <= totalPages; page++) {
      const startIndex = (page - 1) * CATEGORIES_ITEMS_PER_PAGE;
      const endIndex = startIndex + CATEGORIES_ITEMS_PER_PAGE;
      const pageData = categoryPrompts.slice(startIndex, endIndex);

      fs.writeFileSync(
        path.join(categoryDir, `page-${page}.json`),
        JSON.stringify(pageData, null, 2)
      );
      fs.writeFileSync(
        path.join(buildCategoryDir, `page-${page}.json`),
        JSON.stringify(pageData, null, 2)
      );
    }
  });
}

/**
 * Entry point: generate all the paginated data.
 */
function generatePaginatedData() {
  console.log("Generating paginated data...");

  // Read every prompt
  const allPrompts = getAllPrompts();
  console.log(`Read ${allPrompts.length} prompts`);

  // Create the output directories
  const { paginatedDir, buildPaginatedDir } = createOutputDirectories();

  // Paginated data for the full prompt list
  generateAllPromptsPages(allPrompts, paginatedDir, buildPaginatedDir);

  // Paginated data per category
  generateCategoryPages(allPrompts, paginatedDir, buildPaginatedDir);

  console.log("Paginated data generated!");
}

// Run it
generatePaginatedData();
