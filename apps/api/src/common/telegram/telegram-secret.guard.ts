import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { env } from "../../config/env";

@Injectable()
export class TelegramSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const secret = request.headers["x-telegram-bot-api-secret-token"];
    if (!secret || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
      throw new UnauthorizedException("Invalid telegram secret token");
    }
    return true;
  }
}
