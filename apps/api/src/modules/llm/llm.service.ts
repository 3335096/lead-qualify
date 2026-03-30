import { Injectable } from "@nestjs/common";
import { extractQualification } from "@lead/bot-core/src";
import type { LlmExtractRequest, LlmExtractResponse } from "@lead/shared";

@Injectable()
export class LlmService {
  async extract(input: LlmExtractRequest): Promise<LlmExtractResponse> {
    return extractQualification(input);
  }
}
