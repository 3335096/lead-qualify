import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { env } from "./config/env.instance";
import { piiSafeLogger } from "./common/middleware/pii-safe-logger.middleware";
import { JwtAuthGuard } from "./common/auth/jwt-auth.guard";
import { RolesGuard } from "./common/auth/roles.guard";
import { JwtService } from "@nestjs/jwt";

async function bootstrap() {
  process.env.ENCRYPTION_KEY_HEX = env.ENCRYPTION_KEY_HEX;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  app.use(require("express").json({
    verify: (req: { rawBody?: Buffer }, _res: unknown, buf: Buffer) => {
      req.rawBody = buf;
    },
  }));
  app.use(piiSafeLogger);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalGuards(
    new JwtAuthGuard(app.get(JwtService), app.get(Reflector)),
    new RolesGuard(app.get(Reflector)),
  );
  await app.listen(env.PORT);
}

void bootstrap();
