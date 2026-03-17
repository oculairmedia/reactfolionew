import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.join(__dirname, "..", "build");
const SERVER_DIR = path.join(__dirname, "..", "build-server");

const ROUTES_TO_PRERENDER = ["/"];

async function prerender() {
  const templatePath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("Client build not found at", templatePath);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");

  const jsDir = path.join(SERVER_DIR, "assets", "js");
  if (!fs.existsSync(jsDir)) {
    console.error("Server build not found at", jsDir);
    process.exit(1);
  }

  const entryFile = fs
    .readdirSync(jsDir)
    .find((f) => f.startsWith("entry-server") && f.endsWith(".js"));

  if (!entryFile) {
    console.error("No entry-server bundle found in", jsDir);
    process.exit(1);
  }

  const { render } = await import(path.join(jsDir, entryFile));

  console.log(`\nPrerendering ${ROUTES_TO_PRERENDER.length} route(s)...\n`);

  for (const url of ROUTES_TO_PRERENDER) {
    try {
      const { html, head } = await render(url);

      let page = template.replace("<!--app-html-->", html);
      if (head) {
        page = page.replace("<!--head-tags-->", head);
      } else {
        page = page.replace("<!--head-tags-->", "");
      }

      if (url === "/") {
        fs.writeFileSync(path.join(BUILD_DIR, "index.html"), page);
      } else {
        const dir = path.join(BUILD_DIR, url.slice(1));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), page);
      }

      const htmlSize = Buffer.byteLength(html, "utf-8");
      console.log(
        `  ${url} — ${(htmlSize / 1024).toFixed(1)}KB of prerendered HTML`,
      );
    } catch (err) {
      console.error(`  ${url} — FAILED (falling back to empty shell):`, err.message);
    }
  }

  console.log("\nPrerender complete.\n");
}

prerender().catch((err) => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
