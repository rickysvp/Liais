import { z } from "zod";

const screeningOutputSchema = z.object({
  summaryText: z.string().min(1).max(2000),
  qualificationLevel: z.enum(["high fit", "possible fit", "low fit", "unclear"]),
  suggestedAction: z.string().min(1).max(1000),
});

export type ScreeningOutput = z.infer<typeof screeningOutputSchema>;

export const fallbackScreeningOutput: ScreeningOutput = {
  summaryText: "AI summary unavailable. Review manually.",
  qualificationLevel: "unclear",
  suggestedAction: "Review safely",
};

export function parseScreeningOutput(raw: string): ScreeningOutput {
  try {
    const parsedJson = JSON.parse(raw);
    const parsed = screeningOutputSchema.safeParse(parsedJson);
    return parsed.success ? parsed.data : fallbackScreeningOutput;
  } catch {
    return fallbackScreeningOutput;
  }
}
