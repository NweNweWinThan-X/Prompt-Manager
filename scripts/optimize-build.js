const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

console.log("Optimizing the production build...");

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
      console.log(`Optimizing file: ${fullPath}`);
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
  console.log("Optimization complete!");
} else {
  console.error("Error: output directory not found. Run npm run build first");
}
