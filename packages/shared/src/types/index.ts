export type UserRole = "owner" | "admin" | "manager" | "agent";

export type LeadStatus =
  | "new"
  | "in_qualification"
  | "awaiting_client"
  | "awaiting_operator"
  | "qualified"
  | "in_contact"
  | "won"
  | "not_target"
  | "no_answer"
  | "duplicate"
  | "spam_test"
  | "lost";

export type DictionarySource = "manual" | "sheets";

export const LEAD_STATUSES = [
  "new",
  "in_qualification",
  "awaiting_client",
  "awaiting_operator",
  "qualified",
  "in_contact",
  "won",
  "not_target",
  "no_answer",
  "duplicate",
  "spam_test",
  "lost",
] as const;

export interface QualificationRule {
  id: string;
  weight: number;
  when: {
    field: string;
    op: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in";
    value: unknown;
  };
}

export interface QualificationResult {
  score: number;
  fired: string[];
}

export interface ExtractionResult {
  filled: Record<string, unknown>;
  missing: string[];
  confidence: number;
  suggest_questions: string[];
  coverage: number;
}

export interface DictionaryItemDTO {
  id: string;
  code: string;
  value: string;
  meta?: Record<string, unknown>;
}

export const leadStatusSchema = {
  safeParse: (value: unknown): { success: boolean; data?: LeadStatus } => {
    const success = typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
    return success ? { success: true, data: value as LeadStatus } : { success: false };
  },
};

export interface LlmExtractRequest {
  schema: {
    required?: string[];
    [key: string]: unknown;
  };
  history: Array<Record<string, unknown>>;
  message: string;
  dictionaries: Array<Record<string, unknown>>;
}

export interface LlmExtractResponse {
  filled: Record<string, unknown>;
  missing: string[];
  confidence: number;
  suggest_questions: string[];
  coverage: number;
}

export interface QualificationScoreResponse {
  score: number;
  fired: string[];
}
