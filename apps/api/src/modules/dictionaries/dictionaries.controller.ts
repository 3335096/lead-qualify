import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

@Controller("v1/dictionaries")
export class DictionariesController {
  @Post()
  create(@Body() body: unknown) {
    return { ok: true, payload: body };
  }

  @Get()
  list(@Query("source") source?: string) {
    return { items: [], source: source ?? null };
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return { id, item: null };
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return { id, updated: true, payload: body };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return { id, deleted: true };
  }

  @Post(":id/sync")
  sync(@Param("id") id: string) {
    return { id, synced: true };
  }

  @Get(":id/items")
  items(@Param("id") id: string) {
    return { dictionaryId: id, items: [] };
  }
}
