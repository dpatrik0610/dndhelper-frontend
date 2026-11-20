// Self-check: bunx esbuild src/styles/gpu.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const CHEAP_PROPS = new Set([
  "transform",
  "translate",
  "scale",
  "rotate",
  "opacity",
  "offset",
  "visibility",
  "animation-timing-function",
  "stroke-dashoffset",
  "stroke-dasharray",
  "stroke-opacity",
  "fill-opacity",
]);

const ALLOWED_KEYFRAMES: Record<string, string> = {
  morph: "spell-school blob shape; border-radius has no compositor equivalent and the element is small",
  "bardify-pulse": "ring on one sidebar row, a few hundred pixels",
  pollPulse: "7px status dot",
};

type Violation = { file: string; line: number; reason: string };

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
}

function lineAt(css: string, index: number) {
  return css.slice(0, index).split("\n").length;
}

function keyframeProps(css: string) {
  const out = new Map<string, Set<string>>();
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let i = (m.index ?? 0) + m[0].length;
    let depth = 1;
    const start = i;
    while (depth && i < css.length) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    const props = out.get(m[1]) ?? new Set<string>();
    for (const p of css.slice(start, i - 1).matchAll(/([a-z-]+)\s*:/g)) props.add(p[1]);
    out.set(m[1], props);
  }
  return out;
}

function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function analyzeCss(file: string, raw: string, globalKeyframes: Map<string, Set<string>>): Violation[] {
  const css = stripComments(raw);
  const local = keyframeProps(css);
  const violations: Violation[] = [];

  for (const m of css.matchAll(/transition\s*:\s*all\b/g)) {
    violations.push({ file, line: lineAt(css, m.index ?? 0), reason: "transition: all; list the properties that change" });
  }

  for (const m of css.matchAll(/animation\s*:\s*([^;}]+)/g)) {
    for (const part of splitTopLevel(m[1])) {
      if (!/\binfinite\b/.test(part) || /steps\(|step-start|step-end/.test(part)) continue;
      for (const token of part.match(/[\w-]+/g) ?? []) {
        const props = local.get(token) ?? globalKeyframes.get(token);
        if (!props || token in ALLOWED_KEYFRAMES) continue;
        const heavy = [...props].filter((p) => !CHEAP_PROPS.has(p));
        if (heavy.length) {
          violations.push({
            file,
            line: lineAt(css, m.index ?? 0),
            reason: `infinite "${token}" repaints every frame (${heavy.join(", ")}); animate transform/opacity on a pseudo-element instead`,
          });
        }
      }
    }
  }
  return violations;
}

const sample = `
.a { transition: all 0.2s; }
.b { animation: glow 2s ease-in-out infinite, spin 1s linear infinite; }
.c { animation: glow 2s steps(4) infinite; }
.d { animation: glow 2s ease 1; }
@keyframes glow { 50% { box-shadow: 0 0 8px red; } }
@keyframes spin { to { transform: rotate(1turn); } }
`;
assert.deepEqual(
  analyzeCss("sample.css", sample, new Map()).map((v) => v.line),
  [2, 3],
  "analyzer should flag transition: all and the smooth infinite box-shadow only",
);

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? cssFiles(join(dir, e.name)) : e.name.endsWith(".css") ? [join(dir, e.name)] : [],
  );
}

const root = join(process.cwd(), "src");
const files = cssFiles(root).map((path) => ({ path, css: readFileSync(path, "utf8") }));
const globalKeyframes = new Map<string, Set<string>>();
for (const { css } of files) {
  for (const [name, props] of keyframeProps(stripComments(css))) {
    globalKeyframes.set(name, new Set([...(globalKeyframes.get(name) ?? []), ...props]));
  }
}

const found = files.flatMap(({ path, css }) => analyzeCss(relative(process.cwd(), path), css, globalKeyframes));
assert.equal(found.length, 0, `GPU budget violations:\n${found.map((v) => `  ${v.file}:${v.line} ${v.reason}`).join("\n")}`);
console.log(`GPU checks passed (${files.length} stylesheets)`);
