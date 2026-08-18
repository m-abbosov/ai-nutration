import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Same JWT strategy as JwtAuthGuard, but never rejects the request when the
 * token is missing or invalid — `request.user` is simply left undefined.
 * For routes usable by both anonymous and signed-in visitors (e.g. public
 * calculator pages) that still want to attribute usage to a user when one
 * is logged in.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
