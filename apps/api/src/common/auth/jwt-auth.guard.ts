import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: Record<string, unknown>;
    }>();
    const auth = request.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = auth.replace("Bearer ", "");
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload as Record<string, unknown>;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid bearer token");
    }
  }
}
