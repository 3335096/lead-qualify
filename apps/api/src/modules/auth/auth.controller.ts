import { Body, Controller, Post } from "@nestjs/common";
import type { UserRole } from "@lead/shared";
import { Public } from "../../common/auth/public.decorator";
import { AuthService } from "./auth.service";

interface LoginDto {
  workspaceId: string;
  userId: string;
  role?: UserRole;
}

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.login({
      userId: body.userId,
      workspaceId: body.workspaceId,
      role: body.role ?? "agent",
    });
  }
}
