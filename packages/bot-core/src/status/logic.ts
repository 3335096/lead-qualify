import type { LeadStatus } from "@lead/shared";

export interface DedupInput {
  hasActiveLeadInLast14Days: boolean;
}

export interface StatusDecisionInput {
  coverage: number;
  score: number;
  suggestQuestions: string[];
  dedup: DedupInput;
}

export interface StatusDecision {
  status: LeadStatus;
  autoQualified: boolean;
  triggerOutbound: boolean;
}

export function decideLeadStatus(input: StatusDecisionInput): StatusDecision {
  if (input.dedup.hasActiveLeadInLast14Days) {
    return {
      status: "duplicate",
      autoQualified: false,
      triggerOutbound: false
    };
  }

  if (input.coverage >= 0.8 && input.score >= 40) {
    return {
      status: "qualified",
      autoQualified: true,
      triggerOutbound: true
    };
  }

  if (input.suggestQuestions.length > 0) {
    return {
      status: "awaiting_client",
      autoQualified: false,
      triggerOutbound: false
    };
  }

  return {
    status: "in_qualification",
    autoQualified: false,
    triggerOutbound: false
  };
}
