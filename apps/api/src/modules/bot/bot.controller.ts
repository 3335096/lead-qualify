import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../../common/auth/public.decorator";
import { TelegramSecretGuard } from "../../common/telegram/telegram-secret.guard";
import { BotService } from "./bot.service";

@Controller("v1/bot/telegram")
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Public()
  @UseGuards(TelegramSecretGuard)
  @HttpCode(HttpStatus.OK)
  @Post("webhook")
  async webhook(@Req() req: Request, @Body() update: Record<string, unknown>) {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    return this.botService.handleWebhook(update, rawBody);
  }
}
