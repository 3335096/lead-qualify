import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

@Controller("v1/integrations/outbound")
export class IntegrationsController {
  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return { id: "integration-1", ...payload };
  }

  @Get()
  list() {
    return [];
  }

  @Patch(":id")
  patch(@Param("id") id: string, @Body() payload: Record<string, unknown>) {
    return { id, ...payload };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return { id, deleted: true };
  }

  @Post(":id/test")
  test(@Param("id") id: string, @Body() payload: Record<string, unknown>) {
    return { id, tested: true, payload };
  }
}
