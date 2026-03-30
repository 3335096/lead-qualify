import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { UserRole } from "@lead/shared";

interface LoginInput {
  userId: string;
  workspaceId: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(input: LoginInput): Promise<{ access_token: string }> {
    if (!input.userId || !input.workspaceId) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Placeholder auth logic for bootstrap.
    const payload = {
      sub: `user:${input.userId}`,
      workspaceId: input.workspaceId,
      role: input.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
