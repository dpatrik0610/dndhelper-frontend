// Self-check: npx esbuild src/utils/currency.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { adjustCurrency, coinInfo, currencySuggestions, formatCurrencies, sortCurrencies } from "./currency";

const wallet = [{ type: "sp", amount: 20 }, { type: "Mammon", amount: 3 }, { type: "gp", amount: 5 }];

assert.deepEqual(sortCurrencies(wallet).map((c) => c.type), ["gp", "sp", "Mammon"]);
assert.equal(formatCurrencies(wallet), "5 GP, 20 SP, 3 Mammon");
assert.equal(formatCurrencies([{ type: "gp", amount: 0 }]), "");
assert.equal(coinInfo(" GP ").label, "GP");
assert.equal(coinInfo("Mammon").standard, false);

// Case-insensitive merge, removal, and new stacks.
assert.deepEqual(adjustCurrency(wallet, "GP", 2).find((c) => c.type === "gp")?.amount, 7);
assert.equal(adjustCurrency(wallet, "mammon", -3).some((c) => c.type === "Mammon"), false);
assert.deepEqual(adjustCurrency([], " Shards ", 4), [{ type: "Shards", amount: 4 }]);
assert.deepEqual(adjustCurrency([], "gp", -1), []);

assert.deepEqual(currencySuggestions(wallet, [{ type: "MAMMON", amount: 1 }]), ["pp", "gp", "ep", "sp", "cp", "Mammon"]);

console.log("currency checks passed");
