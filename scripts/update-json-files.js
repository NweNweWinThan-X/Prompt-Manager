/**
 * Bulk-update the prompt JSON files.
 *
 * Strips the views, likes, usageCount, favoriteCount and slug fields from every JSON file.
 */

const fs = require("fs");
const path = require("path");

// Where the prompt files live
const PROMPTS_DIRECTORY = path.join(process.cwd(), "prompts");

// Collect the JSON files
function getAllJsonFiles() {
  const files = fs.readdirSync(PROMPTS_DIRECTORY);
  return files.filter((file) => file.endsWith(".json"));
}

// Update one JSON file
function updateJsonFile(filename) {
  const filePath = path.join(PROMPTS_DIRECTORY, filename);
  try {
    // Read the file
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Drop the fields we no longer keep
    const { views, likes, usageCount, favoriteCount, slug, ...rest } = data;

    // Write it back
    fs.writeFileSync(filePath, JSON.stringify(rest, null, 2), "utf8");
    console.log(`Updated: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Failed to update ${filename}:`, error);
    return false;
  }
}

// Entry point
function main() {
  console.log("Bulk-updating JSON files...");

  const jsonFiles = getAllJsonFiles();
  console.log(`Found ${jsonFiles.length} JSON files`);

  let successCount = 0;
  let failCount = 0;

  jsonFiles.forEach((file) => {
    const success = updateJsonFile(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log("\nUpdate complete:");
  console.log(`Succeeded: ${successCount} files`);
  console.log(`Failed: ${failCount} files`);
}

// Run it
main();
