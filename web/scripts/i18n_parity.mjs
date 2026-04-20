import fs from "node:fs";
import path from "node:path";

function listJsonFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listJsonFiles(full));
    else if (ent.isFile() && ent.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function flattenKeys(obj, prefix = "") {
  const keys = [];
  if (!obj || typeof obj !== "object") return keys;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keys.push(...flattenKeys(v, next));
    else keys.push(next);
  }
  return keys;
}

function toRel(p, root) {
  return path.relative(root, p).replaceAll("\\", "/");
}

const webRoot = path.resolve(process.cwd());
const localesRoot = path.join(webRoot, "locales");
const enRoot = path.join(localesRoot, "en");
const zhRoot = path.join(localesRoot, "zh");
const arRoot = path.join(localesRoot, "ar");

if (!fs.existsSync(enRoot) || !fs.existsSync(zhRoot) || !fs.existsSync(arRoot)) {
  console.error(`[i18n:parity] Missing locales roots: ${enRoot}, ${zhRoot}, or ${arRoot}`);
  process.exit(2);
}

const enFiles = listJsonFiles(enRoot).map((p) => toRel(p, enRoot)).sort();
const zhFiles = listJsonFiles(zhRoot).map((p) => toRel(p, zhRoot)).sort();
const arFiles = listJsonFiles(arRoot).map((p) => toRel(p, arRoot)).sort();

const missingInZh = enFiles.filter((f) => !zhFiles.includes(f));
const extraInZh = zhFiles.filter((f) => !enFiles.includes(f));
const missingInAr = enFiles.filter((f) => !arFiles.includes(f));
const extraInAr = arFiles.filter((f) => !enFiles.includes(f));

let ok = true;
if (missingInZh.length) {
  ok = false;
  console.error("[i18n:parity] Missing zh files:");
  for (const f of missingInZh) console.error(`- ${f}`);
}
if (extraInZh.length) {
  ok = false;
  console.error("[i18n:parity] Extra zh files:");
  for (const f of extraInZh) console.error(`- ${f}`);
}
if (missingInAr.length) {
  ok = false;
  console.error("[i18n:parity] Missing ar files:");
  for (const f of missingInAr) console.error(`- ${f}`);
}
if (extraInAr.length) {
  ok = false;
  console.error("[i18n:parity] Extra ar files:");
  for (const f of extraInAr) console.error(`- ${f}`);
}

for (const rel of enFiles) {
  if (!zhFiles.includes(rel)) continue;
  const enPath = path.join(enRoot, rel);
  const zhPath = path.join(zhRoot, rel);
  const enJson = loadJson(enPath);
  const zhJson = loadJson(zhPath);
  const enKeys = new Set(flattenKeys(enJson));
  const zhKeys = new Set(flattenKeys(zhJson));

  const missingKeys = [...enKeys].filter((k) => !zhKeys.has(k)).sort();
  const extraKeys = [...zhKeys].filter((k) => !enKeys.has(k)).sort();

  if (missingKeys.length || extraKeys.length) {
    ok = false;
    console.error(`[i18n:parity] Key mismatch in ${rel}`);
    if (missingKeys.length) {
      console.error("  Missing zh keys:");
      for (const k of missingKeys) console.error(`  - ${k}`);
    }
    if (extraKeys.length) {
      console.error("  Extra zh keys:");
      for (const k of extraKeys) console.error(`  - ${k}`);
    }
  }
}

for (const rel of enFiles) {
  if (!arFiles.includes(rel)) continue;
  const enPath = path.join(enRoot, rel);
  const arPath = path.join(arRoot, rel);
  const enJson = loadJson(enPath);
  const arJson = loadJson(arPath);
  const enKeys = new Set(flattenKeys(enJson));
  const arKeys = new Set(flattenKeys(arJson));

  const missingKeys = [...enKeys].filter((k) => !arKeys.has(k)).sort();
  const extraKeys = [...arKeys].filter((k) => !enKeys.has(k)).sort();

  if (missingKeys.length || extraKeys.length) {
    ok = false;
    console.error(`[i18n:parity] Key mismatch in ${rel}`);
    if (missingKeys.length) {
      console.error("  Missing ar keys:");
      for (const k of missingKeys) console.error(`  - ${k}`);
    }
    if (extraKeys.length) {
      console.error("  Extra ar keys:");
      for (const k of extraKeys) console.error(`  - ${k}`);
    }
  }
}

if (!ok) process.exit(1);
console.log("[i18n:parity] OK");
