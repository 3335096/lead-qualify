import { Bot } from "grammy";
import type { LeadStatus } from "@lead/shared";

export interface BotRuntimeConfig {
  token: string;
  webhookSecret: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
}

export function createTelegramBotRuntime(config: BotRuntimeConfig): Bot {
  const bot = new Bot(config.token);
  bot.on("message:text", async (ctx) => {
    await ctx.reply("Сообщение принято, начинаю квалификацию.");
  });
  return bot;
}

export async function handleWebhookUpdate(
  bot: Bot,
  update: TelegramUpdate,
): Promise<{ accepted: boolean; chatId?: string; status?: LeadStatus }> {
  await bot.handleUpdate(update as never);
  const chatId = update.message?.chat.id ? String(update.message.chat.id) : undefined;
  return { accepted: true, chatId };
}
