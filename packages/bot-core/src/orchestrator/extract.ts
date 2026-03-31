import type { LlmExtractRequest, LlmExtractResponse } from "@lead/shared";

export interface LlmGateway {
  extract: (input: LlmExtractRequest) => Promise<Pick<LlmExtractResponse, "filled" | "missing" | "confidence" | "suggest_questions">>;
}

const defaultGateway: LlmGateway = {
  async extract(input) {
    const required = input.schema.required ?? [];
    const filled = Object.fromEntries(required.map((key) => [key, null]));
    return {
      filled,
      missing: required,
      confidence: 0.2,
      suggest_questions: required.map((field) => `Уточните поле: ${field}`),
    };
  },
};

export function computeCoverage(required: string[], filled: Record<string, unknown>): number {
  if (required.length === 0) {
    return 1;
  }

  const completed = required.filter((field) => {
    const value = filled[field];
    if (value === undefined || value === null) {
      return false;
    }
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return true;
  }).length;

  return completed / required.length;
}

export async function extractQualification(
  input: LlmExtractRequest,
  gateway: LlmGateway = defaultGateway,
): Promise<LlmExtractResponse> {
  const modelResponse = await gateway.extract(input);
  const required = input.schema.required ?? [];
  const coverage = computeCoverage(required, modelResponse.filled);

  return {
    filled: modelResponse.filled,
    missing: modelResponse.missing,
    confidence: modelResponse.confidence,
    suggest_questions: modelResponse.suggest_questions,
    coverage,
  };
}
