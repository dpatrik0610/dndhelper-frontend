import type { AssistantMessage } from "@features/aiAssistant/types";

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: "user" | "model";
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiErrorResponse {
  error?: {
    message?: string;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

interface SendAssistantMessageParams {
  modelId: string;
  systemPrompt: string;
  history: AssistantMessage[];
  message: string;
  signal?: AbortSignal;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? "";
const GEMINI_API_BASE =
  import.meta.env.VITE_GEMINI_API_BASE?.trim() ??
  "https://generativelanguage.googleapis.com/v1beta/models";

function ensureApiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in the frontend environment.");
  }
}

function toGeminiContents(history: AssistantMessage[], message: string): GeminiContent[] {
  const contents = history
    .filter((item) => item.text.trim().length > 0)
    .map<GeminiContent>((item) => ({
      role: item.role,
      parts: [{ text: item.text }],
    }));

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  return contents;
}

function extractText(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("").trim();
}

export async function sendAssistantMessage({
  modelId,
  systemPrompt,
  history,
  message,
  signal,
}: SendAssistantMessageParams): Promise<string> {
  ensureApiKey();

  const response = await fetch(
    `${GEMINI_API_BASE}/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: toGeminiContents(history, message),
        generationConfig: {
          temperature: 0.7,
        },
      }),
      signal,
    }
  );

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as GeminiErrorResponse | null;
    throw new Error(errorPayload?.error?.message ?? "The assistant request failed.");
  }

  const data = (await response.json()) as GeminiResponse;
  const text = extractText(data);

  if (!text) {
    throw new Error("The assistant returned an empty response.");
  }

  return text;
}
