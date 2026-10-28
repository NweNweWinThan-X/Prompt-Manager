const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// Where the prompt files live
const promptsDirectory = path.join(process.cwd(), "prompts");
// Output directory
const outputDirectory = path.join(process.cwd(), "public/data");
// The build output needs a copy of the data too
const { outDir } = require("../site.config");
const buildOutputDirectory = path.join(process.cwd(), "out", outDir, "data");

function generateIndex() {
  // Make sure the output directory exists
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  // Same for the build output directory
  if (!fs.existsSync(buildOutputDirectory)) {
    fs.mkdirSync(buildOutputDirectory, { recursive: true });
  }

  const promptFiles = fs
    .readdirSync(promptsDirectory)
    .filter((file) => file.endsWith(".md"));

  const indexData = promptFiles.map((fileName) => {
    // The slug is the filename without its extension
    const slug = fileName.replace(/\.md$/, "");

    // Read the file
    const fullPath = path.join(promptsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Parse the frontmatter with gray-matter
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      description: data.description || "",
      category: data.category || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date || new Date().toISOString(),
    };
  });

  // Write the index into public/
  fs.writeFileSync(
    path.join(outputDirectory, "prompts-index.json"),
    JSON.stringify(indexData, null, 2)
  );

  // And into the build output
  fs.writeFileSync(
    path.join(buildOutputDirectory, "prompts-index.json"),
    JSON.stringify(indexData, null, 2)
  );

  console.log(`索引生成完成，共 ${indexData.length} 个提示词`);
}

generateIndex();
