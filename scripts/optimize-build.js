const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

console.log("开始优化生产构建...");

// Output directory
const outDir = path.join(process.cwd(), "out");

// Walk the output tree, handling every HTML, JS and CSS file
function optimizeFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      optimizeFiles(fullPath);
      continue;
    }

    // Only HTML, JS and CSS files
    if (/\.(html|js|css)$/.test(file.name)) {
      console.log(`优化文件: ${fullPath}`);
      let content = fs.readFileSync(fullPath, "utf8");

      // Minify HTML
      if (file.name.endsWith(".html")) {
        // Crude minification: strip comments and extra whitespace
        content = content
          .replace(/<!--(?!<!)[^\[>][\s\S]*?-->/g, "") // strip comments
          .replace(/\s{2,}/g, " ") // collapse runs of whitespace
          .replace(/>\s+</g, "><"); // drop whitespace between tags
      }

      // Write the optimized file back
      fs.writeFileSync(fullPath, content, "utf8");

      // Also write a gzipped copy; GitHub Pages serves it when it exists
      const gzipped = zlib.gzipSync(content);
      fs.writeFileSync(`${fullPath}.gz`, gzipped);
    }
  }
}

// Nothing to do unless the build output is there
if (fs.existsSync(outDir)) {
  // Go
  optimizeFiles(outDir);
  console.log("优化完成！");
} else {
  console.error("错误: 输出目录不存在。请先运行 npm run build");
}
