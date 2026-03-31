import { Controller, Get, Query } from "@nestjs/common";

@Controller("v1/metrics")
export class MetricsController {
  @Get("summary")
  getSummary(@Query("from") from?: string, @Query("to") to?: string) {
    return {
      from,
      to,
      leads_total: 0,
      qualified_total: 0,
      auto_qualified_total: 0,
      conversion_rate: 0,
      avg_response_time_sec: 0,
    };
  }
}
