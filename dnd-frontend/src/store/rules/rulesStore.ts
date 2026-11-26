import { create } from "zustand";
import type { Rule, RuleInput } from "@appTypes/Rules/Rule";
import { createRule, deleteRule, getRules, updateRule } from "@services/ruleService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

interface RulesStore {
  campaignId: string | null | undefined;
  rules: Rule[];
  loading: boolean;
  load: (campaignId: string | null, force?: boolean) => Promise<void>;
  save: (id: string | null, input: RuleInput) => Promise<Rule | null>;
  remove: (id: string) => Promise<boolean>;
}

const fail = (title: string, err: unknown) =>
  showNotification({ title, message: err instanceof Error ? err.message : String(err), color: SectionColor.Red });

const byCategoryThenTitle = (a: Rule, b: Rule) =>
  a.category.localeCompare(b.category, undefined, { sensitivity: "base" }) ||
  a.title.localeCompare(b.title, undefined, { sensitivity: "base" });

export const useRulesStore = create<RulesStore>()((set, get) => ({
  campaignId: undefined,
  rules: [],
  loading: false,

  async load(campaignId, force = false) {
    if (!force && get().campaignId === campaignId) return;
    set({ campaignId, loading: true, ...(get().campaignId !== campaignId && { rules: [] }) });
    try {
      const rules = await getRules();
      if (get().campaignId === campaignId) set({ rules: rules.sort(byCategoryThenTitle) });
    } catch (err) {
      fail("Couldn't load rules", err);
    } finally {
      set({ loading: false });
    }
  },

  async save(id, input) {
    try {
      const saved = id ? await updateRule(id, input) : await createRule(input);
      set((s) => ({
        rules: [...s.rules.filter((r) => r.id !== saved.id && r.slug !== saved.slug), saved].sort(byCategoryThenTitle),
      }));
      return saved;
    } catch (err) {
      fail("Couldn't save rule", err);
      return null;
    }
  },

  async remove(id) {
    try {
      await deleteRule(id);
      await get().load(get().campaignId ?? null, true);
      return true;
    } catch (err) {
      fail("Couldn't delete rule", err);
      return false;
    }
  },
}));
