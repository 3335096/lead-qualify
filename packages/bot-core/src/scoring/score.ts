import type { QualificationRule, QualificationScoreResponse } from "@lead/shared";

const operators = {
  eq: (a: unknown, b: unknown) => a === b,
  ne: (a: unknown, b: unknown) => a !== b,
  gt: (a: number, b: number) => a > b,
  gte: (a: number, b: number) => a >= b,
  lt: (a: number, b: number) => a < b,
  lte: (a: number, b: number) => a <= b,
  in: (a: unknown, b: unknown[]) => b.includes(a),
};

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
  const op = operators[rule.when.op];
  if (!op) return false;

  if (["gt", "gte", "lt", "lte"].includes(rule.when.op)) {
    return (op as (a: number, b: number) => boolean)(toNumber(left), toNumber(rule.when.value));
  }

  if (rule.when.op === "in") {
    const expected = Array.isArray(rule.when.value) ? rule.when.value : [rule.when.value];
    return (op as (a: unknown, b: unknown[]) => boolean)(left, expected);
  }

  return (op as (a: unknown, b: unknown) => boolean)(left, rule.when.value);
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
