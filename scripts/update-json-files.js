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
    console.log(`已更新: ${filename}`);
    return true;
  } catch (error) {
    console.error(`更新 ${filename} 失败:`, error);
    return false;
  }
}

// Entry point
function main() {
  console.log("开始批量更新JSON文件...");

  const jsonFiles = getAllJsonFiles();
  console.log(`找到 ${jsonFiles.length} 个JSON文件`);

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

  console.log("\n更新完成:");
  console.log(`成功: ${successCount} 个文件`);
  console.log(`失败: ${failCount} 个文件`);
}

// Run it
main();
