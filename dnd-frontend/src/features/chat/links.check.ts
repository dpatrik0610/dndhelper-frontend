// Self-check: npx esbuild src/features/chat/links.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { splitLinks } from "./links";

assert.deepEqual(splitLinks("no links here"), ["no links here"]);
assert.deepEqual(splitLinks("see https://a.b/c?d=1, ok"), ["see ", "https://a.b/c?d=1", ", ok"]);
assert.deepEqual(splitLinks("(http://x.y/z)."), ["(", "http://x.y/z", ")."]);
assert.deepEqual(splitLinks("https://a.b https://c.d"), ["", "https://a.b", " ", "https://c.d", ""]);
assert.deepEqual(splitLinks("javascript:alert(1) ftp://x"), ["javascript:alert(1) ftp://x"]);

console.log("chat link checks passed");
