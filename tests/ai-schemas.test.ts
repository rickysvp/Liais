import { describe, expect, it } from "vitest";

import { parseScreeningOutput } from "../server/lib/aiSchemas";

describe("AI output schemas", () => {
  it("parses valid screening output", () => {
    const result = parseScreeningOutput(JSON.stringify({
      summaryText: "Relevant partnership request.",
      qualificationLevel: "high fit",
      suggestedAction: "Review and reply.",
    }));

    expect(result.summaryText).toBe("Relevant partnership request.");
    expect(result.qualificationLevel).toBe("high fit");
  });

  it("falls back safely for malformed model output", () => {
    const result = parseScreeningOutput("not json");

    expect(result.summaryText).toBe("AI summary unavailable. Review manually.");
    expect(result.qualificationLevel).toBe("unclear");
    expect(result.suggestedAction).toBe("Review safely");
  });
});
