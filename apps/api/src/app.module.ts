import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { AuthModule } from "./modules/auth/auth.module";
import { BotModule } from "./modules/bot/bot.module";
import { LlmModule } from "./modules/llm/llm.module";
import { QualificationModule } from "./modules/qualification/qualification.module";
import { SchemasModule } from "./modules/schemas/schemas.module";
import { DictionariesModule } from "./modules/dictionaries/dictionaries.module";
import { CrmModule } from "./modules/crm/crm.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { SlaModule } from "./modules/sla/sla.module";
import { PrismaModule } from "./prisma/prisma.module";
import { env } from "./config/env.instance";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: env.REDIS_URL || "redis://localhost:6379",
      },
    }),
    PrismaModule,
    AuthModule,
    BotModule,
    LlmModule,
    QualificationModule,
    SchemasModule,
    DictionariesModule,
    CrmModule,
    IntegrationsModule,
    MetricsModule,
    SlaModule,
  ],
})
export class AppModule {}
