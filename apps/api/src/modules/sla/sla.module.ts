import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "../../prisma/prisma.module";
import { SlaProcessor } from "./sla.processor";

@Module({
  imports: [BullModule.registerQueue({ name: "sla" }), PrismaModule],
  providers: [SlaProcessor],
})
export class SlaModule {}
