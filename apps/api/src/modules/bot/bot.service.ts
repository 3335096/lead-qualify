import { Injectable } from "@nestjs/common";
import { createTelegramBotRuntime, handleWebhookUpdate, type TelegramUpdate } from "@lead/bot-core/src";
import { env } from "../../config/env";

@Injectable()
export class BotService {
  private readonly bot = createTelegramBotRuntime({
    token: env.TELEGRAM_BOT_TOKEN || "dev-token",
    webhookSecret: env.TELEGRAM_WEBHOOK_SECRET || "dev-secret",
  });

  async handleWebhook(update: Record<string, unknown>, rawBody?: Buffer) {
    const result = await handleWebhookUpdate(this.bot, update as unknown as TelegramUpdate);
    return {
      ok: true,
      accepted: result.accepted,
      chatId: result.chatId ?? null,
      rawSize: rawBody?.byteLength ?? 0,
    };
  }
}
