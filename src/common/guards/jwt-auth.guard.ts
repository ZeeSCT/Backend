import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) return true; // 🔥 bypass only in dev

    return super.canActivate(context);
  }
}