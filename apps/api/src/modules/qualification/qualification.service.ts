import { Injectable } from "@nestjs/common";
import { scoreQualification } from "@lead/bot-core";
import type { QualificationRule } from "@lead/shared";

@Injectable()
export class QualificationService {
  score(
    filled: Record<string, unknown>,
    rules: QualificationRule[],
  ): { score: number; fired: string[] } {
    return scoreQualification(filled, rules);
  }
}
