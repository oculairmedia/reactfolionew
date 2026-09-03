import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, "..", "build");
const routes = [
  "/",
  "/portfolio",
  "/about",
  "/blog",
  "/links",
  "/privacy",
  "/terms",
];

const hashes = new Set();

for (const route of routes) {
  const outputPath =
    route === "/"
      ? path.join(buildDir, "index.html")
      : path.join(buildDir, route.slice(1), "index.html");

  if (!fs.existsSync(outputPath)) {
    throw new Error(`${route}: prerendered HTML is missing`);
  }

  const html = fs.readFileSync(outputPath, "utf8");
  if (!html.includes("data-prerendered")) {
    throw new Error(`${route}: prerender marker is missing`);
  }
  if (html.includes("<!--app-html-->")) {
    throw new Error(`${route}: unresolved app placeholder remains`);
  }

  hashes.add(crypto.createHash("sha256").update(html).digest("hex"));
}

if (hashes.size !== routes.length) {
  throw new Error(
    `Expected ${routes.length} route-specific documents, found ${hashes.size}`,
  );
}

console.log(`Verified ${routes.length} unique prerendered route documents.`);
