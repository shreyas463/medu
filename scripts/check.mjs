import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

const root = fileURLToPath(new URL("..", import.meta.url))
const wantDist = process.argv.includes("--dist")
let failed = 0

function fail(message) {
  failed += 1
  console.error(message)
}

const secretPatterns = [
  { name: "aws-access-key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "github-token", re: /ghp_[A-Za-z0-9]{20,}/ },
  { name: "github-fine-grained", re: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: "stripe-live", re: /sk_live_[A-Za-z0-9]+/ },
  { name: "slack-token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
]

const allowedVite = new Set(["VITE_GOATCOUNTER", "BASE_URL", "DEV", "PROD", "SSR", "MODE"])
const textExt = new Set([".ts", ".tsx", ".js", ".mjs", ".html", ".css", ".yml", ".yaml", ".md", ".json", ".svg"])

async function walk(dir) {
  const found = []
  let entries = []
  try {
    entries = await readdir(dir)
  } catch {
    return found
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git") continue
    const full = path.join(dir, name)
    const info = await stat(full)
    if (info.isDirectory()) found.push(...(await walk(full)))
    else found.push(full)
  }
  return found
}

function rel(file) {
  return path.relative(root, file)
}

async function scanFile(file) {
  const base = path.basename(file)
  if (base === ".env" || base.startsWith(".env.")) fail(`${rel(file)} is an env file and must stay out of the tree`)
  if (!textExt.has(path.extname(file))) return
  if (rel(file) === "scripts/check.mjs") return
  const text = await readFile(file, "utf8")
  for (const pattern of secretPatterns) {
    if (pattern.re.test(text)) fail(`${pattern.name} matched in ${rel(file)}`)
  }
  if (rel(file).startsWith("src/") && /\bconsole\./.test(text)) {
    fail(`${rel(file)} logs to the console`)
  }
  const names = text.match(/VITE_[A-Z0-9_]+/g) ?? []
  for (const name of names) {
    if (!allowedVite.has(name)) fail(`${rel(file)} reads ${name}. Only VITE_GOATCOUNTER may be inlined into the page.`)
  }
}

async function scanTree(dir) {
  const files = await walk(dir)
  for (const file of files) await scanFile(file)
}

function eq(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`)
}

async function checkCounter() {
  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  })
  try {
    const mod = await server.ssrLoadModule("/src/lib/counter.ts")
    eq(mod.counterEndpoint("medu"), "https://medu.goatcounter.com/count", "short code")
    eq(mod.counterEndpoint("medu.goatcounter.com"), "https://medu.goatcounter.com/count", "host")
    eq(mod.counterEndpoint("https://medu.goatcounter.com/count?x=1"), "https://medu.goatcounter.com/count", "strips query")
    eq(mod.counterOrigin("medu"), "https://medu.goatcounter.com", "origin")
    eq(mod.counterEndpoint(""), null, "empty")
    eq(mod.counterEndpoint("http://medu.goatcounter.com/count"), null, "http")
    eq(mod.counterEndpoint("https://evil.example/count"), null, "other host")
    eq(mod.counterEndpoint("medu.goatcounter.com.evil.com"), null, "suffix trick")
    eq(mod.counterEndpoint("https://user:pass@medu.goatcounter.com/count"), null, "userinfo")
    eq(mod.counterEndpoint("not a code"), null, "spaces")
  } finally {
    await server.close()
  }
}

const sourceDirs = ["src", "scripts", "public", ".github"].map((dir) => path.join(root, dir))
for (const dir of sourceDirs) await scanTree(dir)
for (const file of ["index.html", "README.md", "package.json", "vite.config.ts"]) {
  await scanFile(path.join(root, file))
}

if (wantDist) {
  const dist = path.join(root, "dist")
  try {
    await stat(dist)
  } catch {
    fail("dist is missing. Run the check after the build.")
  }
  await scanTree(dist)
}

await checkCounter()

if (failed > 0) {
  console.error(`${failed} check${failed === 1 ? "" : "s"} failed`)
  process.exit(1)
}
console.log("checks passed")
