import { describe, expect, it } from "vitest";
import { computeCoverage } from "../src/orchestrator/extract";
import { scoreQualification } from "../src/scoring/score";

describe("coverage and scoring", () => {
  it("calculates required coverage", () => {
    const coverage = computeCoverage(
      ["name", "budget", "city"],
      { name: "Alice", budget: "", city: "Paris" },
    );
    expect(coverage).toBeCloseTo(2 / 3);
  });

  it("scores from boolean-like values", () => {
    const { score, fired } = scoreQualification(
      { budget: true, is_urgent: "yes", employees: 10 },
      [
        { id: "has_budget", when: { field: "budget", op: "eq", value: true }, weight: 20 },
        { id: "is_urgent", when: { field: "is_urgent", op: "eq", value: "yes" }, weight: 10 },
        { id: "employees", when: { field: "employees", op: "gte", value: 1 }, weight: 15 },
      ],
    );

    expect(score).toBe(45);
    expect(fired).toContain("has_budget");
    expect(fired).toContain("is_urgent");
    expect(fired).toContain("employees");
  });
});
