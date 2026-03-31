import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

@Controller("v1/leads")
export class CrmController {
  @Get()
  getLeads(@Query("status") status?: string, @Query("from") from?: string) {
    return {
      items: [],
      filters: { status, from },
    };
  }

  @Get(":id")
  getLeadById(@Param("id") id: string) {
    return { id, lead: null };
  }

  @Patch(":id")
  patchLead(@Param("id") id: string, @Body() payload: Record<string, unknown>) {
    return { id, ...payload, updated: true };
  }

  @Post(":id/notes")
  addLeadNote(@Param("id") id: string, @Body() payload: { text: string }) {
    return { id, note: payload.text, created: true };
  }

  @Post(":id/messages")
  addLeadMessage(
    @Param("id") id: string,
    @Body() payload: { text: string; channel?: string },
  ) {
    return { id, message: payload.text, channel: payload.channel ?? "telegram" };
  }
}
