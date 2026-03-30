import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { Job, Queue } from "bullmq";

@Injectable()
@Processor("sla")
export class SlaProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(SlaProcessor.name);

  constructor(@InjectQueue("sla") private readonly queue: Queue) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    const exists = repeatableJobs.some((job) => job.name === "sla-check");
    if (exists) return;

    await this.queue.add(
      "sla-check",
      {
        firstResponseMinutes: 3,
        inactivityHours: 24,
      },
      {
        repeat: { every: 60_000 },
        removeOnComplete: true,
      },
    );
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`SLA check executed, jobId=${job.id}`);
  }
}
