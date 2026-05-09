import "dotenv/config";

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const chatModel = process.env.DEEPSEEK_CHAT_MODEL || "deepseek-chat";

if (!apiKey || apiKey === "YOUR_DEEPSEEK_API_KEY") {
  console.warn("[WARN] AI API key is not configured. AI features will be disabled.");
}

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export function isAIConfigured(): boolean {
  return !!apiKey && apiKey !== "YOUR_DEEPSEEK_API_KEY";
}

async function deepseekChat(messages: ChatMessage[], wantsJson: boolean): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error("AI service is not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: chatModel,
      messages,
      temperature: 0.3,
      response_format: wantsJson ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AI API error (${response.status}): ${body}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content || "";
}

export async function generateText(messages: ChatMessage[]): Promise<string> {
  return deepseekChat(messages, false);
}

export async function generateJsonObject(messages: ChatMessage[]): Promise<string> {
  return deepseekChat(messages, true);
}
