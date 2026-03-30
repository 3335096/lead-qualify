import type { QualificationRule, QualificationScoreResponse } from "@lead/shared";

function readPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc !== "object" || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, source);
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function isRuleFired(rule: QualificationRule, filled: Record<string, unknown>): boolean {
  const left = readPath(filled, rule.when.field);
  switch (rule.when.op) {
    case "eq":
      return left === rule.when.value;
    case "ne":
      return left !== rule.when.value;
    case "gt":
      return toNumber(left) > toNumber(rule.when.value);
    case "gte":
      return toNumber(left) >= toNumber(rule.when.value);
    case "lt":
      return toNumber(left) < toNumber(rule.when.value);
    case "lte":
      return toNumber(left) <= toNumber(rule.when.value);
    case "in": {
      const expected = Array.isArray(rule.when.value) ? rule.when.value : [rule.when.value];
      return expected.includes(left);
    }
    default:
      return false;
  }
}

export function scoreQualification(
  filled: Record<string, unknown>,
  rules: QualificationRule[],
): QualificationScoreResponse {
  let score = 0;
  const fired: string[] = [];

  for (const rule of rules) {
    if (isRuleFired(rule, filled)) {
      score += rule.weight;
      fired.push(rule.id);
    }
  }

  return { score, fired };
}
