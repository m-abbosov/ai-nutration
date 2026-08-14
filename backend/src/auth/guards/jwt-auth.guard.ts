import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Reusable guard protecting any route that requires a valid JWT access token. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
