import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Autocomplete, Button, Loader, ScrollArea, TagsInput, Text, TextInput, ThemeIcon, Tooltip } from "@mantine/core";
import { IconBook2, IconDeviceFloppy, IconExternalLink, IconFileImport, IconInbox, IconLock, IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router";
import type { Rule, RuleInput } from "@appTypes/Rules/Rule";
import { useRulesStore } from "@store/rules/rulesStore";
import { useCanEditContent, useCurrentCampaignId } from "@store/campaign/campaignSelectors";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { BaseModal } from "@components/BaseModal";
import { PromoteToCoreButton } from "@components/common/CoreContentBadge";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { searchRules } from "@features/rules/ruleSearch";
import { onlyNew, toRuleInput } from "./ruleImport";
import shared from "@styles/InventoryDashboard.module.css";
import session from "@features/admin/SessionManager/SessionManager.module.css";
import classes from "./RuleManager.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

const NEW = "new";
const blank = (category = "General"): RuleInput => ({ title: "", category, tags: [], content: "", source: "" });
const inputOf = (r: Rule): RuleInput => ({ title: r.title, category: r.category, tags: r.tags, content: r.content, source: r.source ?? "" });
const same = (a: RuleInput, b: RuleInput) => JSON.stringify(a) === JSON.stringify(b);

export function RuleManager() {
  const campaignId = useCurrentCampaignId();
  const { rules, loading, load, save, remove } = useRulesStore();
  const canEdit = useCanEditContent();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RuleInput>(blank());
  const [filter, setFilter] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedId(null);
    void load(campaignId ?? null);
  }, [campaignId, load]);

  const selected = rules.find((r) => r.id === selectedId) ?? null;
  const isNew = selectedId === NEW;
  const baseline = selected ? inputOf(selected) : blank(draft.category);
  const dirty = (isNew || !!selected) && !same(draft, baseline);
  const editable = isNew || (!!selected && canEdit(selected.campaignId));

  const fallbackCategory = selected?.category ?? draft.category;
  const select = useCallback(
    (id: string) => {
      const rule = rules.find((r) => r.id === id);
      setSelectedId(id);
      setDraft(rule ? inputOf(rule) : blank(fallbackCategory));
      setPending(null);
    },
    [rules, fallbackCategory],
  );
  const requestSelect = (id: string) => (dirty && id !== selectedId ? setPending(id) : select(id));

  const linked = params.get("rule");
  useEffect(() => {
    if (!linked || !rules.length) return;
    const rule = rules.find((r) => r.slug === linked);
    if (rule) select(rule.id);
    setParams({}, { replace: true });
  }, [linked, rules, select, setParams]);

  useEffect(() => {
    if (!selectedId && !linked && rules.length) select(rules[0].id);
  }, [rules, selectedId, linked, select]);

  const categories = useMemo(() => [...new Set(rules.map((r) => r.category))], [rules]);
  const allTags = useMemo(() => [...new Set(rules.flatMap((r) => r.tags))].sort(), [rules]);
  const visible = useMemo(() => searchRules(rules, filter).map((h) => h.rule), [rules, filter]);
  const groups = useMemo(() => {
    const map = new Map<string, Rule[]>();
    for (const r of visible) map.set(r.category, [...(map.get(r.category) ?? []), r]);
    return [...map.entries()];
  }, [visible]);

  const patch = (p: Partial<RuleInput>) => setDraft((d) => ({ ...d, ...p }));

  const submit = async (asCopy = false) => {
    if (!draft.title.trim()) {
      showNotification({ message: "Give the rule a title first.", color: SectionColor.Yellow });
      return;
    }
    setBusy(true);
    const saved = await save(asCopy || isNew ? null : selectedId, draft);
    setBusy(false);
    if (saved) {
      setSelectedId(saved.id);
      setDraft(inputOf(saved));
      showNotification({ message: `Saved "${saved.title}".`, color: SectionColor.Green });
    }
  };

  const doDelete = async () => {
    if (!selected) return;
    setBusy(true);
    const ok = await remove(selected.id);
    setBusy(false);
    setConfirmDelete(false);
    if (ok) setSelectedId(null);
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    let items: RuleInput[];
    try {
      const parsed: unknown = JSON.parse(await file.text());
      items = (Array.isArray(parsed) ? parsed : [parsed]).map(toRuleInput).filter((r): r is RuleInput => !!r);
    } catch {
      showNotification({ message: "That file isn't valid JSON.", color: SectionColor.Red });
      return;
    }
    const fresh = onlyNew(items, rules);
    const skipped = items.length - fresh.length;
    setBusy(true);
    let created = 0;
    for (const item of fresh) if (await save(null, item)) created++;
    setBusy(false);
    showNotification({
      message: `Imported ${created} of ${fresh.length} new rules${skipped ? `, skipped ${skipped} you already have` : ""}.`,
      color: created === fresh.length ? SectionColor.Green : SectionColor.Yellow,
    });
  };

  return (
    <div className={shared.dashboardRoot}>
      <div className={shared.splitLayout}>
        <div className={shared.sidebar}>
          <div className={shared.sidebarHeader}>
            <div className={classes.heading}>
              <ThemeIcon variant="light" color="neon" size="md" radius="sm">
                <IconBook2 size={16} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" c="white">Rules</Text>
                <Text size="xs" c="dimmed">{rules.length} rules in {categories.length} categories</Text>
              </div>
            </div>
            <div className={classes.toolbar}>
              <Button
                size="xs"
                className="glass-btn-primary"
                leftSection={<IconPlus size={14} />}
                onClick={() => requestSelect(NEW)}
                disabled={!campaignId}
                style={{ flex: 1 }}
              >
                New rule
              </Button>
              <Tooltip label="Import rules from a JSON file" withArrow>
                <ActionIcon variant="light" color="gray" size="md" onClick={() => fileRef.current?.click()} loading={busy} aria-label="Import JSON">
                  <IconFileImport size={15} />
                </ActionIcon>
              </Tooltip>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  void importFile(e.currentTarget.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
            </div>
            <TextInput
              size="xs"
              placeholder="Filter: cover, #reaction, cat:magic"
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
              aria-label="Filter rules"
            />
          </div>

          <ScrollArea className={shared.sidebarScroll} offsetScrollbars>
            {loading && rules.length === 0 ? (
              <div className={classes.center}><Loader color="neon" size="sm" /></div>
            ) : visible.length === 0 ? (
              <div className={classes.center}>
                <IconInbox size={22} color="gray" />
                <Text c="dimmed" size="xs">{rules.length ? "No matches." : "No rules yet."}</Text>
              </div>
            ) : (
              groups.map(([category, items]) => (
                <div key={category}>
                  <div className={shared.listGroupHeader}>
                    <span>{category}</span>
                    <span className={shared.listGroupCount}>{items.length}</span>
                  </div>
                  {items.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-current={r.id === selectedId || undefined}
                      className={`${shared.listItem} ${classes.item} ${r.id === selectedId ? shared.listItemSelected : ""}`}
                      onClick={() => requestSelect(r.id)}
                    >
                      <span className={shared.listItemName}>{r.title}</span>
                      {r.campaignId === null && <IconLock size={12} className={classes.lock} aria-label="Core rule" />}
                    </button>
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        <div className={shared.workspaceArea}>
          {isNew || selected ? (
            <div className={shared.workspacePanel}>
              <div className={shared.metaBar}>
                <TextInput
                  className={session.nameInput}
                  placeholder="Rule title"
                  value={draft.title}
                  onChange={(e) => patch({ title: e.currentTarget.value })}
                  readOnly={!editable}
                  aria-label="Title"
                  autoFocus={isNew}
                />
                <div className={session.actions}>
                  {dirty && <span className={session.saveState}>Unsaved</span>}
                  {selected && (
                    <Tooltip label="Open in the rules reference" withArrow>
                      <ActionIcon variant="subtle" color="gray" onClick={() => navigate(`/rules/${selected.slug}`)} aria-label="Open in rules">
                        <IconExternalLink size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {selected && <PromoteToCoreButton type="Rules" id={selected.id} campaignId={selected.campaignId} onPromoted={() => void load(campaignId ?? null, true)} />}
                  {selected && editable && (
                    <Tooltip label="Delete rule" withArrow>
                      <ActionIcon variant="subtle" color="red" onClick={() => setConfirmDelete(true)} aria-label="Delete rule">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {editable ? (
                    <Button size="xs" className="glass-btn-primary" leftSection={<IconDeviceFloppy size={14} />} loading={busy} disabled={!dirty} onClick={() => void submit()}>
                      {isNew ? "Create rule" : "Save"}
                    </Button>
                  ) : (
                    <Button size="xs" className="glass-btn-secondary" loading={busy} disabled={!campaignId} onClick={() => void submit(true)}>
                      Copy to campaign
                    </Button>
                  )}
                </div>
              </div>

              <div className={session.detailsBar}>
                <div className={session.field}>
                  <span className={session.fieldLabel}>Category</span>
                  <Autocomplete aria-label="Category" size="xs" data={categories} value={draft.category} onChange={(category) => patch({ category })} readOnly={!editable} />
                </div>
                <div className={`${session.field} ${classes.grow}`}>
                  <span className={session.fieldLabel}>Tags</span>
                  <TagsInput aria-label="Tags" size="xs" data={allTags} value={draft.tags} onChange={(tags) => patch({ tags })} readOnly={!editable} placeholder="Add tag" clearable={false} className={classes.grow} />
                </div>
                <div className={session.field}>
                  <span className={session.fieldLabel}>Source</span>
                  <TextInput aria-label="Source" size="xs" placeholder="PHB p.195" value={draft.source ?? ""} onChange={(e) => patch({ source: e.currentTarget.value })} readOnly={!editable} />
                </div>
              </div>

              {!editable && (
                <p className={classes.notice}>
                  Core rule, shared by every campaign. Copy it to your campaign to change it; your copy replaces it for your players.
                </p>
              )}

              <div className={`${session.columns} ${preview ? "" : classes.single}`}>
                <section className={session.pane}>
                  <div className={shared.itemsPanelHeader}>
                    <span className={session.hint}>Markdown. Link another rule with [Cover](#cover).</span>
                    <fieldset className={`${session.tabs} ${classes.fieldset}`} aria-label="Preview">
                      <button type="button" className={session.tab} aria-pressed={!preview} onClick={() => setPreview(false)}>Write</button>
                      <button type="button" className={session.tab} aria-pressed={preview} onClick={() => setPreview(true)}>Side by side</button>
                    </fieldset>
                  </div>
                  <ScrollArea className={shared.itemsPanelBody} offsetScrollbars>
                    {editable ? (
                      <MarkdownTextarea label="" value={draft.content} onChange={(content) => patch({ content })} minHeightRem={26} />
                    ) : (
                      <Suspense fallback={<Loader size="sm" />}>
                        <MarkdownRenderer content={draft.content} textColor="var(--cyber-fg)" />
                      </Suspense>
                    )}
                  </ScrollArea>
                </section>
                {preview && (
                  <section className={session.pane}>
                    <div className={shared.itemsPanelHeader}>
                      <span className={session.hint}>Preview</span>
                    </div>
                    <ScrollArea className={shared.itemsPanelBody} offsetScrollbars>
                      {draft.content.trim() ? (
                        <Suspense fallback={<Loader size="sm" />}>
                          <MarkdownRenderer content={draft.content} textColor="var(--cyber-fg)" />
                        </Suspense>
                      ) : (
                        <span className={session.empty}>Nothing written yet.</span>
                      )}
                    </ScrollArea>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className={shared.emptyState}>
              <div className={shared.emptyStateInner}>
                <IconBook2 size={28} />
                <span>{campaignId ? "Write your first rule" : "Select a campaign first"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <BaseModal
        opened={!!pending}
        onClose={() => setPending(null)}
        title="Discard changes"
        size="sm"
        onSave={() => pending && select(pending)}
        saveLabel="Discard"
      >
        <Text size="sm">You have unsaved changes to this rule. Discard them?</Text>
      </BaseModal>

      <BaseModal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete rule"
        size="sm"
        loading={busy}
        onSave={() => void doDelete()}
        saveLabel="Delete"
      >
        <Text size="sm">
          Delete <b>{selected?.title}</b>? Players lose access to it right away. This can't be undone.
        </Text>
      </BaseModal>
    </div>
  );
}
