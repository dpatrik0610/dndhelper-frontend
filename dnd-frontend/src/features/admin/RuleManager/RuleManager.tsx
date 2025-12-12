import { useEffect, useMemo, useState } from "react";
import { Button, Divider, FileInput, Group, MultiSelect, Paper, Select, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { IconCheck, IconFileUpload, IconPlaylistAdd, IconUpload, IconX, IconPlus } from "@tabler/icons-react";
import { RuleCategory, type RuleDetail, type RuleCategoryResponse } from "@appTypes/Rules/Rule";
import { createRule } from "@services/ruleService";
import { useAuthStore } from "@store/useAuthStore";
import { showNotification } from "@components/Notification/Notification";
import { mockRuleDetails } from "@features/rules/mockRules";
import { ExpandableSection } from "@components/ExpandableSection";
import { createRuleCategory, getRuleCategories } from "@services/ruleCategoryService";
import "./ruleManager.css";
import { SectionColor } from "@appTypes/SectionColor";

const fallbackCategoryOptions = Object.values(RuleCategory).map((c) => ({ value: c, label: c }));

const defaultRule: RuleDetail = {
  slug: "",
  title: "",
  category: RuleCategory.Core,
  summary: "",
  tags: [],
};

export function RuleManager() {
  const token = useAuthStore((s) => s.token);
  const [rule, setRule] = useState<RuleDetail>(() => ({ ...defaultRule }));
  const [bodyText, setBodyText] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<RuleCategoryResponse[]>([]);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catOrder, setCatOrder] = useState<number | "">("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getRuleCategories();
        setCategories(cats ?? []);
      } catch (error) {
        console.error("Failed to load rule categories:", error);
      }
    };
    void loadCategories();
  }, []);

  const categoryOptions = useMemo(() => {
    if (categories && categories.length) {
      return categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ value: c.name, label: c.name }));
    }
    return fallbackCategoryOptions;
  }, [categories]);

  const sanitizeRule = (raw: Partial<RuleDetail>): RuleDetail => ({
    id: undefined,
    slug: raw.slug?.trim() ?? "",
    title: raw.title?.trim() ?? "",
    category: (raw.category as string) ?? RuleCategory.Core,
    summary: raw.summary ?? "",
    tags: raw.tags ?? [],
    updatedAt: raw.updatedAt,
    source: raw.source
      ? {
          title: raw.source.title ?? "",
          page: raw.source.page,
          edition: raw.source.edition,
          url: raw.source.url,
        }
      : undefined,
    body: raw.body,
    sources: raw.sources,
    examples: raw.examples,
    references: raw.references,
    relatedRuleSlugs: raw.relatedRuleSlugs,
  });

  const handleSave = async () => {
    if (!token) {
      showNotification({ message: "Login as admin to create rules.", color: "red", icon: <IconX size={16} /> });
      return;
    }
    const payload = sanitizeRule({
      ...rule,
      body: bodyText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
      tags: rule.tags.map((t) => t.trim()).filter(Boolean),
      source: sourceTitle
        ? {
            title: sourceTitle,
            page: sourcePage || undefined,
          }
        : undefined,
    });

    if (!payload.slug || !payload.title || !payload.summary) {
      showNotification({ message: "Slug, title, and summary are required.", color: "yellow" });
      return;
    }

    setSaving(true);
    try {
      await createRule(payload, token);
      showNotification({ message: `Rule "${payload.title}" created.`, color: "green", icon: <IconCheck size={16} /> });
      setRule({ ...defaultRule });
      setBodyText("");
      setSourceTitle("");
      setSourcePage("");
    } catch (error) {
      console.error("Failed to create rule", error);
      showNotification({ message: "Failed to create rule.", color: "red", icon: <IconX size={16} /> });
    } finally {
      setSaving(false);
    }
  };

  const parseJsonInput = async (text: string): Promise<RuleDetail[]> => {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((r) => sanitizeRule(r));
    return [sanitizeRule(parsed)];
  };

  const handleImport = async (rules: RuleDetail[]) => {
    if (!token) {
      showNotification({ message: "Login as admin to import rules.", color: "red", icon: <IconX size={16} /> });
      return;
    }
    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const r of rules) {
      try {
        await createRule(r, token);
        success += 1;
      } catch (error) {
        failed += 1;
        console.error(`Failed to import rule ${r.slug}`, error);
      }
    }
    setImporting(false);
    showNotification({
      message: `Import complete: ${success} created${failed ? `, ${failed} failed` : ""}.`,
      color: failed ? "yellow" : "green",
      icon: failed ? <IconUpload size={16} /> : <IconCheck size={16} />,
    });
  };

  const handleImportClick = async () => {
    try {
      if (jsonFile) {
        const text = await jsonFile.text();
        const rules = await parseJsonInput(text);
        await handleImport(rules);
        return;
      }
      if (importJson.trim()) {
        const rules = await parseJsonInput(importJson);
        await handleImport(rules);
        return;
      }
      showNotification({ message: "Provide JSON via file or text area.", color: "yellow" });
    } catch (error) {
      console.error("Failed to import JSON", error);
      showNotification({ message: "Invalid JSON input.", color: "red", icon: <IconX size={16} /> });
    }
  };

  const handleImportMocks = async () => {
    await handleImport(mockRuleDetails.map((r) => sanitizeRule(r)));
  };

  const handleCreateCategory = async () => {
    if (!token) {
      showNotification({ message: "Login as admin to create categories.", color: "red", icon: <IconX size={16} /> });
      return;
    }
    if (!catName.trim()) {
      showNotification({ message: "Category name is required.", color: "yellow" });
      return;
    }
    const payload: RuleCategoryResponse = {
      name: catName.trim(),
      slug: (catSlug || catName).trim().toLowerCase().replace(/\s+/g, "-"),
      description: catDescription.trim() || undefined,
      order: typeof catOrder === "number" ? catOrder : categories.length + 1,
    };
    setCreatingCategory(true);
    try {
      const created = await createRuleCategory(payload, token);
      if (created) {
        setCategories((prev) => [...prev, created]);
        showNotification({ message: `Category "${created.name}" created.`, color: "green", icon: <IconCheck size={16} /> });
        setCatName("");
        setCatSlug("");
        setCatDescription("");
        setCatOrder("");
      }
    } catch (error) {
      console.error("Failed to create category", error);
      showNotification({ message: "Failed to create category.", color: "red", icon: <IconX size={16} /> });
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="lg" shadow="lg" className="rule-manager-card">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>Rule Manager</Title>
            <Text size="sm" c="dimmed">
              Create a single rule or import many via JSON.
            </Text>
          </div>
          <Group gap="xs">
            <Button variant="subtle" color="violet" leftSection={<IconPlaylistAdd size={16} />} onClick={handleImportMocks}>
              Import mocks
            </Button>
            <Button
              variant="filled"
              color="grape"
              leftSection={<IconCheck size={16} />}
              loading={saving}
              onClick={handleSave}
            >
              Save rule
            </Button>
          </Group>
        </Group>

        <Divider my="md" />

        <SimpleRuleForm
          rule={rule}
          bodyText={bodyText}
          sourceTitle={sourceTitle}
          sourcePage={sourcePage}
          categoryOptions={categoryOptions}
          onUpdateRule={setRule}
          onUpdateBody={setBodyText}
          onUpdateTags={(tags) => setRule((prev) => ({ ...prev, tags }))}
          onUpdateSourceTitle={setSourceTitle}
          onUpdateSourcePage={setSourcePage}
        />
      </Paper>

      <Paper withBorder radius="md" p="lg" shadow="lg" className="rule-manager-card rule-manager-card--import">
        <Group justify="space-between" align="center">
          <div>
            <Title order={4}>Import via JSON</Title>
            <Text size="sm" c="dimmed">
              Paste JSON (single object or array) or upload a .json file. Fields should match the RuleDetail shape.
            </Text>
          </div>
          <Button
            variant="light"
            color="cyan"
            leftSection={<IconUpload size={16} />}
            loading={importing}
            onClick={handleImportClick}
          >
            Import
          </Button>
        </Group>

        <Stack gap="sm" mt="md">
          <FileInput
            label="Upload JSON file"
            placeholder="Select .json file"
            accept="application/json"
            leftSection={<IconFileUpload size={16} />}
            value={jsonFile}
            onChange={setJsonFile}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />

          <Textarea
            label="JSON text"
            minRows={6}
            autosize
            placeholder='[ { "slug": "cover", "title": "Cover", ... } ]'
            value={importJson}
            onChange={(e) => setImportJson(e.currentTarget.value)}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />

          <ExpandableSection title="Example RuleDetail JSON" color={SectionColor.Grape} defaultOpen>
            <Textarea
              readOnly
              minRows={10}
              autosize
              value={`{
  "id": "optional-id",
  "slug": "opportunity-attacks",
  "title": "Opportunity attacks",
  "category": "Combat",
  "summary": "Leaving a hostile creature's reach provokes a melee attack.",
  "tags": ["combat", "reaction"],
  "updatedAt": "2024-06-01T12:00:00Z",
  "source": { "title": "SRD", "page": "13" },
  "sources": [{ "title": "Homebrew Compendium", "page": "5" }],
  "body": [
    "You can make one melee attack as a reaction when a hostile creature you can see leaves your reach.",
    "Does not trigger if the creature Disengages or is moved without using its own movement."
  ],
  "examples": [{ "title": "Long reach", "description": "Reach weapon can trigger at 10 ft." }],
  "references": [{ "type": "condition", "name": "Prone" }],
  "relatedRuleSlugs": ["disengage", "grappling"]
}`}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </ExpandableSection>

          <Text size="sm" c="dimmed">
            Tips: tags should be an array of strings; body is an array of paragraphs. Missing fields will be defaulted.
          </Text>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="lg" shadow="lg" className="rule-manager-card">
        <Group justify="space-between" align="center" mb="sm">
          <div>
            <Title order={4}>Manage categories</Title>
            <Text size="sm" c="dimmed">
              Create new categories; they show up in filters and the rule form.
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            color="grape"
            leftSection={<IconPlus size={14} />}
            loading={creatingCategory}
            onClick={handleCreateCategory}
          >
            Add category
          </Button>
        </Group>

        <Stack gap="sm">
          <Group grow>
            <TextInput
              label="Name"
              placeholder="Exploration"
              value={catName}
              onChange={(e) => setCatName(e.currentTarget.value)}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
            <TextInput
              label="Slug"
              placeholder="exploration"
              value={catSlug}
              onChange={(e) => setCatSlug(e.currentTarget.value)}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
            <TextInput
              label="Order"
              placeholder="1"
              value={catOrder}
              onChange={(e) => setCatOrder(e.currentTarget.value ? Number(e.currentTarget.value) : "")}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Group>
          <Textarea
            label="Description (optional)"
            value={catDescription}
            onChange={(e) => setCatDescription(e.currentTarget.value)}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />

          <ExpandableSection title="Existing categories" color={SectionColor.Violet} defaultOpen>
            <Stack gap="xs">
              {(categories.length ? categories : fallbackCategoryOptions.map((c, idx) => ({ name: c.label, order: idx + 1 } as any))).map((cat) => (
                <Group key={cat.slug ?? cat.name} justify="space-between">
                  <Text fw={600}>{cat.name}</Text>
                  <Text size="xs" c="dimmed">
                    Order: {"order" in cat ? cat.order : "-"}
                  </Text>
                </Group>
              ))}
            </Stack>
          </ExpandableSection>
        </Stack>
      </Paper>
    </Stack>
  );
}

interface SimpleRuleFormProps {
  rule: RuleDetail;
  bodyText: string;
  sourceTitle: string;
  sourcePage: string;
  categoryOptions: { value: string; label: string }[];
  onUpdateRule: (rule: RuleDetail) => void;
  onUpdateBody: (text: string) => void;
  onUpdateTags: (tags: string[]) => void;
  onUpdateSourceTitle: (title: string) => void;
  onUpdateSourcePage: (page: string) => void;
}

function SimpleRuleForm({
  rule,
  bodyText,
  sourceTitle,
  sourcePage,
  categoryOptions,
  onUpdateRule,
  onUpdateBody,
  onUpdateTags,
  onUpdateSourceTitle,
  onUpdateSourcePage,
}: SimpleRuleFormProps) {
  const [newTag, setNewTag] = useState("");

  const tagOptions = useMemo(
    () => Array.from(new Set(rule.tags ?? [])).map((t) => ({ value: t, label: t })),
    [rule.tags],
  );

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if ((rule.tags ?? []).includes(trimmed)) {
      setNewTag("");
      return;
    }
    onUpdateTags([...(rule.tags ?? []), trimmed]);
    setNewTag("");
  };

  return (
    <Stack gap="sm">
      <Group grow align="flex-start">
        <TextInput
          label="Slug"
          placeholder="opportunity-attacks"
          required
          value={rule.slug}
          onChange={(e) => onUpdateRule({ ...rule, slug: e.currentTarget.value })}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
        <TextInput
          label="Title"
          placeholder="Opportunity attacks"
          required
          value={rule.title}
          onChange={(e) => onUpdateRule({ ...rule, title: e.currentTarget.value })}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
      </Group>

      <Group grow align="flex-start">
        <Select
          label="Category"
          data={categoryOptions.length ? categoryOptions : fallbackCategoryOptions}
          value={rule.category?.toString()}
          onChange={(value) => onUpdateRule({ ...rule, category: value ?? RuleCategory.Core })}
          classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown", option: "glassy-option" }}
        />
        <TextInput
          label="Source title (optional)"
          placeholder="SRD"
          value={sourceTitle}
          onChange={(e) => onUpdateSourceTitle(e.currentTarget.value)}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
        <TextInput
          label="Source page (optional)"
          placeholder="12"
          value={sourcePage}
          onChange={(e) => onUpdateSourcePage(e.currentTarget.value)}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
      </Group>

      <Textarea
        label="Summary"
        placeholder="Short description used in the list"
        required
        minRows={2}
        value={rule.summary}
        onChange={(e) => onUpdateRule({ ...rule, summary: e.currentTarget.value })}
        classNames={{ input: "glassy-input", label: "glassy-label" }}
      />

      <Textarea
        label="Body (one paragraph per line)"
        placeholder="Paragraph 1\nParagraph 2"
        minRows={4}
        value={bodyText}
        onChange={(e) => onUpdateBody(e.currentTarget.value)}
        classNames={{ input: "glassy-input", label: "glassy-label" }}
      />

      <Group align="flex-end" gap="xs">
        <MultiSelect
          label="Tags"
          placeholder="combat, reaction"
          data={tagOptions}
          searchable
          value={rule.tags}
          onChange={(values) => onUpdateTags(values)}
          classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown", option: "glassy-option" }}
        />
        <TextInput
          label="New tag"
          placeholder="Add tag"
          value={newTag}
          onChange={(e) => setNewTag(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          w="30%"
        />
        <Button
          variant="light"
          color="grape"
          mt="xs"
          onClick={addTag}
        >
          Add
        </Button>
      </Group>

      <Group justify="flex-end">
        <Text size="xs" c="dimmed">
          Required: slug, title, summary. Tags help filtering.
        </Text>
      </Group>
    </Stack>
  );
}
