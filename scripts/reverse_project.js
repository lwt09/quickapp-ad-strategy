#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { execFile, execSync } = require("child_process");

const execFileAsync = promisify(execFile);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function checkWebcrackAvailable() {
  try {
    execSync("webcrack --version", { stdio: "ignore" });
    return true;
  } catch (_) {
    return false;
  }
}

function loadWebcrack() {
  const fromEnv = process.env.WEBCRACK_DIST;
  const candidates = [
    fromEnv,
    "webcrack",
    path.resolve(process.cwd(), "node_modules/webcrack/dist/index.js"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const mod = require(candidate);
      if (mod && typeof mod.webcrack === "function") {
        return mod.webcrack;
      }
    } catch (_) {
      // Ignore and try next candidate.
    }
  }
  return null;
}

function listFilesRecursively(rootDir, excludedAbsDirs) {
  const out = [];
  const stack = [rootDir];

  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (excludedAbsDirs.has(full)) continue;
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }

  return out.sort();
}

async function reverseWithCli(inputCode) {
  const { stdout } = await execFileAsync("webcrack", [], {
    input: inputCode,
    maxBuffer: 1024 * 1024 * 50,
    encoding: "utf8",
  });
  return stdout;
}

async function reverseJsFile(webcrackFn, inputPath) {
  const sourceCode = fs.readFileSync(inputPath, "utf8");

  if (webcrackFn) {
    const result = await webcrackFn(sourceCode, {
      sandbox: async (code) => (0, eval)(code),
      unpack: true,
      deobfuscate: true,
      unminify: true,
      jsx: true,
    });
    return String(result.code || "");
  }

  return reverseWithCli(sourceCode);
}

async function main() {
  const webcrackFn = loadWebcrack();

  if (!webcrackFn && !checkWebcrackAvailable()) {
    process.stderr.write(
      [
        "Error: webcrack not found.",
        "",
        "Please install webcrack globally first:",
        "  npm install -g webcrack",
        "",
        "Or set WEBCRACK_DIST environment variable to your local webcrack dist path.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  const sourceArg = process.argv[2] || ".";
  const sourceDirPath = path.resolve(process.cwd(), sourceArg);

  if (!fs.existsSync(sourceDirPath) || !fs.statSync(sourceDirPath).isDirectory()) {
    throw new Error(`source directory not found: ${sourceDirPath}`);
  }

  const sourceDirName = path.basename(sourceDirPath);
  const outputDirName = `${sourceDirName}-reverse`;
  const outputDirPath = path.join(sourceDirPath, outputDirName);

  const excludedNames = new Set([".git", ".codex", ".helloagents", "node_modules", outputDirName]);
  const excludedAbsDirs = new Set(
    Array.from(excludedNames)
      .map((name) => path.join(sourceDirPath, name))
      .filter((abs) => fs.existsSync(abs) && fs.statSync(abs).isDirectory()),
  );

  const allFiles = listFilesRecursively(sourceDirPath, excludedAbsDirs);
  const failedJs = [];

  fs.rmSync(outputDirPath, { recursive: true, force: true });
  ensureDir(outputDirPath);

  for (const absPath of allFiles) {
    const relPath = path.relative(sourceDirPath, absPath);
    const outPath = path.join(outputDirPath, relPath);
    ensureDir(path.dirname(outPath));

    if (!absPath.endsWith(".js")) {
      fs.copyFileSync(absPath, outPath);
      continue;
    }

    try {
      const reversed = await reverseJsFile(webcrackFn, absPath);
      fs.writeFileSync(outPath, reversed, "utf8");
    } catch (err) {
      fs.copyFileSync(absPath, outPath);
      failedJs.push({
        file: relPath,
        error: String(err && err.message ? err.message : err),
      });
    }
  }

  const summary = {
    source: sourceDirPath,
    output: outputDirPath,
    total_files: allFiles.length,
    js_files: allFiles.filter((f) => f.endsWith(".js")).length,
    failed_js_count: failedJs.length,
    failed_js: failedJs,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : err}\n`);
  process.exit(1);
});
