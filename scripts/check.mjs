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
  if (rel(file).startsWith("src/")) {
    for (const sink of ["dangerouslySetInnerHTML", "innerHTML", "document.write", "eval(", "new Function"]) {
      if (text.includes(sink)) fail(`${rel(file)} uses ${sink}`)
    }
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

async function checkBehavior() {
  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  })
  try {
    const counter = await server.ssrLoadModule("/src/lib/counter.ts")
    const line = await server.ssrLoadModule("/src/lib/line.ts")
    const search = await server.ssrLoadModule("/src/lib/search.ts")
    const data = await server.ssrLoadModule("/src/data/signs.ts")

    eq(counter.counterEndpoint("medu"), "https://medu.goatcounter.com/count", "short code")
    eq(counter.counterEndpoint("medu.goatcounter.com"), "https://medu.goatcounter.com/count", "host")
    eq(counter.counterEndpoint("https://medu.goatcounter.com/count?x=1"), "https://medu.goatcounter.com/count", "strips query")
    eq(counter.counterOrigin("medu"), "https://medu.goatcounter.com", "origin")
    eq(counter.counterEndpoint(""), null, "empty")
    eq(counter.counterEndpoint("http://medu.goatcounter.com/count"), null, "http")
    eq(counter.counterEndpoint("https://evil.example/count"), null, "other host")
    eq(counter.counterEndpoint("medu.goatcounter.com.evil.com"), null, "suffix trick")
    eq(counter.counterEndpoint("https://user:pass@medu.goatcounter.com/count"), null, "userinfo")
    eq(counter.counterEndpoint("not a code"), null, "spaces")

    const script = line.parseLine("#<script>alert(1)</script>")
    if (script.length !== 0) fail("a script in the address was kept")
    const encoded = line.parseLine("#%3Cscript%3Ealert(1)%3C/script%3E")
    if (encoded.length !== 0) fail("an encoded script in the address was kept")
    const broken = line.parseLine("#%")
    if (broken.length !== 0) fail("a broken percent-escape was kept")
    const injected = line.parseLine("#F35-I9-D21' OR 1=1--")
    if (!injected.includes("F35") || !injected.includes("I9")) fail("known signs were dropped")
    if (injected.includes("D21")) fail("a sign glued to SQL text was kept")
    if (injected.some((id) => !/^[A-Za-z0-9]+$/.test(id))) fail("a parsed id is not a sign code")

    const signs = data.signs
    const sqlHits = search.visibleSigns(signs, "' OR 1=1 --", "A")
    if (sqlHits.length === signs.length || sqlHits.length > 3) fail("a SQL-shaped search matched too widely")
    const markupHits = search.visibleSigns(signs, "<img src=x onerror=alert(1)>", "A")
    if (markupHits.length !== 0) fail("markup in search matched a sign")
    const owls = search.visibleSigns(signs, "owl", "alphabet")
    if (!owls.some((sign) => sign.id === "G17")) fail("owl search lost the owl")
    if (owls.some((sign) => /bowl|fowling/i.test(`${sign.depiction} ${sign.meaning}`))) {
      fail("owl search matched inside another word")
    }
    search.visibleSigns(signs, "a".repeat(5000), "alphabet")
  } finally {
    await server.close()
  }
}

async function checkBuiltPage() {
  const html = await readFile(path.join(root, "dist/index.html"), "utf8")
  const raw = html.match(/http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"/) ||
    html.match(/content="([^"]+)"[^>]*http-equiv="Content-Security-Policy"/)
  const policy = raw ? raw[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&") : ""
  if (!policy) fail("the built page has no Content-Security-Policy")
  else {
    if (!policy.includes("script-src 'self'")) fail("the built page does not lock scripts to this site")
    if (policy.includes("unsafe-eval") || /script-src[^;]*unsafe-inline/.test(policy)) {
      fail("the built page allows inline or eval scripts")
    }
  }
  if (!html.includes('name="referrer" content="strict-origin-when-cross-origin"')) {
    fail("the built page has no referrer policy")
  }
  const privacy = await readFile(path.join(root, "dist/privacy.html"), "utf8")
  if (!privacy.includes("script-src 'none'")) fail("the privacy page allows scripts")
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
  await checkBuiltPage()
}

await checkBehavior()

if (failed > 0) {
  console.error(`${failed} check${failed === 1 ? "" : "s"} failed`)
  process.exit(1)
}
console.log("checks passed")
