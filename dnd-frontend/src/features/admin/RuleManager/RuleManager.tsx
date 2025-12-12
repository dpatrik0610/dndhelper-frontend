import { useState } from "react";
import { Button, Divider, FileInput, Group, MultiSelect, Paper, Select, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { IconCheck, IconFileUpload, IconPlaylistAdd, IconUpload, IconX } from "@tabler/icons-react";
import { RuleCategory, type RuleDetail } from "@appTypes/Rules/Rule";
import { createRule } from "@services/ruleService";
import { useAuthStore } from "@store/useAuthStore";
import { showNotification } from "@components/Notification/Notification";
import { mockRuleDetails } from "@features/rules/mockRules";
import { ExpandableSection } from "@components/ExpandableSection";
import "./ruleManager.css";

const categoryOptions = Object.values(RuleCategory).map((c) => ({ value: c, label: c }));

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

          <ExpandableSection title="Example RuleDetail JSON" color="grape" defaultOpen>
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
    </Stack>
  );
}

interface SimpleRuleFormProps {
  rule: RuleDetail;
  bodyText: string;
  sourceTitle: string;
  sourcePage: string;
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
  onUpdateRule,
  onUpdateBody,
  onUpdateTags,
  onUpdateSourceTitle,
  onUpdateSourcePage,
}: SimpleRuleFormProps) {
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
          data={categoryOptions}
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

      <MultiSelect
        label="Tags"
        placeholder="combat, reaction"
        data={[]}
        searchable
        value={rule.tags}
        onChange={(values) => onUpdateTags(values)}
        getCreateLabel={(query) => `+ Add "${query}"`}
        onCreate={(query) => {
          const trimmed = query.trim();
          if (!trimmed) return null;
          const next = [...new Set([...(rule.tags ?? []), trimmed])];
          onUpdateTags(next);
          return trimmed;
        }}
        classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown", option: "glassy-option" }}
      />

      <Group justify="flex-end">
        <Text size="xs" c="dimmed">
          Required: slug, title, summary. Tags help filtering.
        </Text>
      </Group>
    </Stack>
  );
}
