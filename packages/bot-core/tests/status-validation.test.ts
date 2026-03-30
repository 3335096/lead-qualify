import { describe, expect, it } from "vitest";
import { leadStatusSchema, type LeadStatus } from "@lead/shared";

const mockReasonDictionary = {
  not_target: ["no_budget", "wrong_geo"],
  no_answer: ["no_response_24h"],
  lost: ["competitor", "price"],
} as const;

function validateReason(status: LeadStatus, reasonCode?: string): boolean {
  const validStatus = leadStatusSchema.safeParse(status).success;
  if (!validStatus) return false;

  if (!reasonCode) return true;
  const reasonList = mockReasonDictionary[status as keyof typeof mockReasonDictionary];
  if (!reasonList) return false;
  return reasonList.includes(reasonCode as never);
}

describe("status/reason validation", () => {
  it("accepts valid status and reason pair", () => {
    expect(validateReason("lost", "price")).toBe(true);
  });

  it("rejects unknown reason for status", () => {
    expect(validateReason("lost", "wrong_geo")).toBe(false);
  });

  it("rejects reason for status without dictionary reasons", () => {
    expect(validateReason("qualified", "price")).toBe(false);
  });
});
