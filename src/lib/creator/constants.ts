export const CREATOR_PRICE_PRESETS = [
  { label: "Free", value: 0 },
  { label: "$2.99", value: 2.99 },
  { label: "$4.99", value: 4.99 },
  { label: "$9.99", value: 9.99 },
  { label: "$19.99", value: 19.99 },
  { label: "$29.99", value: 29.99 },
] as const;

export const SUPPORTED_AI_MODELS = [
  "ChatGPT",
  "GPT-4o",
  "Claude",
  "Claude 3.5 Sonnet",
  "Gemini",
  "Gemini 2.0",
  "Cursor",
] as const;
