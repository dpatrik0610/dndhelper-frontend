export interface AssistantMessage {
  id: string;
  role: "user" | "model";
  text: string;
  isPending?: boolean;
}

export interface AssistantModelOption {
  id: string;
  label: string;
}

export interface AssistantTopicCategory {
  id: string;
  label: string;
}

export interface AssistantTopic {
  id: string;
  name: string;
  categoryId: string;
  systemPrompt: string;
}

export interface AssistantConfig {
  defaultModelId: string;
  models: AssistantModelOption[];
  categories: AssistantTopicCategory[];
  topics: AssistantTopic[];
}
