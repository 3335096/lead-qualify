import { Body, Controller, Post } from "@nestjs/common";
import type { QualificationRule } from "@lead/shared";
import { QualificationService } from "./qualification.service";

interface ScoreBody {
  filled: Record<string, unknown>;
  rules: QualificationRule[];
}

@Controller("v1/qualification")
export class QualificationController {
  constructor(private readonly qualificationService: QualificationService) {}

  @Post("score")
  score(@Body() body: ScoreBody) {
    return this.qualificationService.score(body.filled ?? {}, body.rules ?? []);
  }
}
