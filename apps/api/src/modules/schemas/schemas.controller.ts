import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

@Controller("v1/schemas")
export class SchemasController {
  @Post()
  create(@Body() body: unknown) {
    return { ok: true, body };
  }

  @Get()
  list(@Query("niche") niche?: string) {
    return { items: [], niche: niche ?? null };
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return { id, ok: true, body };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return { id, deleted: true };
  }
}
