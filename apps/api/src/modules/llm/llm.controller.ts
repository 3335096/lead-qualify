import { Body, Controller, Post } from "@nestjs/common";
import { LlmService } from "./llm.service";
import type { LlmExtractRequest, LlmExtractResponse } from "@lead/shared";

@Controller("v1/llm")
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post("extract")
  async extract(@Body() body: LlmExtractRequest): Promise<LlmExtractResponse> {
    return this.llmService.extract(body);
  }
}
