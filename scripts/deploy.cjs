#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const ghpages = require("gh-pages");

const pkg = require("../package.json");

const normalizeBasePath = (value) => {
  if (!value) return "";
  const trimmed = value.replace(/^\/*/, "").replace(/\/*$/, "");
  return trimmed ? `/${trimmed}` : "";
};

const resolvedBasePath =
  normalizeBasePath(process.env.DEPLOY_BASE_PATH) ||
  normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH) ||
  normalizeBasePath(
    process.env.GITHUB_REPOSITORY?.split("/").slice(-1)[0] ?? "",
  ) ||
  normalizeBasePath(pkg.name);

process.env.NEXT_PUBLIC_BASE_PATH = resolvedBasePath;

console.log(`Deploying with basePath "${process.env.NEXT_PUBLIC_BASE_PATH}"`);

execSync("yarn export:static", { stdio: "inherit" });

const outDir = path.join(process.cwd(), "out");
if (!fs.existsSync(outDir)) {
  throw new Error("Missing export output directory. Did the build succeed?");
}

fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

ghpages.publish(
  outDir,
  {
    branch: "gh-pages",
    dotfiles: true,
  },
  (error) => {
    if (error) {
      console.error("Failed to publish to GitHub Pages:", error);
      process.exit(1);
    } else {
      console.log("GitHub Pages deployment completed.");
    }
  },
);
