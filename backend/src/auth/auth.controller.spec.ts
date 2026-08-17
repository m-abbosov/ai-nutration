import type { Request, Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleProfilePayload } from './strategies/google.strategy';

/**
 * Proves the `state=admin` branch added for Phase 2 does not touch the
 * pre-existing Phase 1 code path: when `state` is absent (or anything
 * other than exactly `'admin'`), the controller must call
 * `authService.loginWithGoogle` — never any admin-specific method — and
 * redirect to the exact same `${FRONTEND_URL}/auth/callback?token=&refresh=`
 * shape it did before this change (docs/ADMIN_API_CONTRACT.md, "Auth").
 */
describe('AuthController — google/callback state branching', () => {
  const FRONTEND_URL = 'http://localhost:5173';
  const ADMIN_FRONTEND_URL = 'http://localhost:5174';
  const PROFILE: GoogleProfilePayload = {
    googleId: 'google-123',
    email: 'someone@example.com',
    name: 'Someone',
    avatarUrl: null,
  };

  function buildController() {
    const authService = {
      loginWithGoogle: jest.fn(),
      resolveAdminGoogleUser: jest.fn(),
      issueAdminSession: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const configService = {
      get: jest.fn((key: string) =>
        key === 'ADMIN_FRONTEND_URL' ? ADMIN_FRONTEND_URL : FRONTEND_URL,
      ),
    };

    const auditLogService = {
      record: jest.fn(),
    } as unknown as jest.Mocked<AuditLogService>;

    const controller = new AuthController(
      authService,
      configService as never,
      auditLogService,
    );

    return { controller, authService, configService, auditLogService };
  }

  function buildReqRes(query: Record<string, unknown>) {
    const redirect = jest.fn();
    const req = {
      user: PROFILE,
      query,
      ip: '203.0.113.7',
    } as unknown as Request;
    const res = { redirect } as unknown as Response;
    return { req, res, redirect };
  }

  it('no `state` query param: calls loginWithGoogle and redirects to /auth/callback (byte-for-byte Phase 1 behavior)', async () => {
    const { controller, authService, auditLogService } = buildController();
    authService.loginWithGoogle.mockResolvedValue({
      accessToken: 'access-tok',
      refreshToken: 'refresh-tok',
      user: {} as never,
    });
    const { req, res, redirect } = buildReqRes({});

    await controller.googleAuthCallback(req, res);

    expect(authService.loginWithGoogle).toHaveBeenCalledWith(PROFILE);
    expect(authService.resolveAdminGoogleUser).not.toHaveBeenCalled();
    expect(authService.issueAdminSession).not.toHaveBeenCalled();
    expect(auditLogService.record).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      `${FRONTEND_URL}/auth/callback?token=access-tok&refresh=refresh-tok`,
    );
  });

  it('state=anything-other-than-admin: still calls loginWithGoogle, unchanged', async () => {
    const { controller, authService, auditLogService } = buildController();
    authService.loginWithGoogle.mockResolvedValue({
      accessToken: 'access-tok',
      refreshToken: 'refresh-tok',
      user: {} as never,
    });
    const { req, res, redirect } = buildReqRes({ state: 'something-else' });

    await controller.googleAuthCallback(req, res);

    expect(authService.loginWithGoogle).toHaveBeenCalledWith(PROFILE);
    expect(authService.resolveAdminGoogleUser).not.toHaveBeenCalled();
    expect(auditLogService.record).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      `${FRONTEND_URL}/auth/callback?token=access-tok&refresh=refresh-tok`,
    );
  });

  it('state=admin AND the resolved user is an admin: issues an admin session and redirects to the admin frontend /auth/callback', async () => {
    const { controller, authService, auditLogService } = buildController();
    authService.resolveAdminGoogleUser.mockResolvedValue({
      id: 'user-1',
      adminRoleId: 'role-1',
      adminActive: true,
    } as never);
    authService.issueAdminSession.mockResolvedValue({
      accessToken: 'admin-access',
      refreshToken: 'admin-refresh',
    });
    const { req, res, redirect } = buildReqRes({ state: 'admin' });

    await controller.googleAuthCallback(req, res);

    expect(authService.loginWithGoogle).not.toHaveBeenCalled();
    expect(authService.resolveAdminGoogleUser).toHaveBeenCalledWith(PROFILE);
    expect(authService.issueAdminSession).toHaveBeenCalledWith('user-1');
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ adminId: 'user-1', action: 'ADMIN_LOGIN' }),
    );
    expect(redirect).toHaveBeenCalledWith(
      `${ADMIN_FRONTEND_URL}/auth/callback?token=admin-access&refresh=admin-refresh`,
    );
  });

  it('state=admin AND the resolved user is NOT an admin: denies, audits, redirects with error=not_admin and no tokens', async () => {
    const { controller, authService, auditLogService } = buildController();
    authService.resolveAdminGoogleUser.mockResolvedValue({
      id: 'user-2',
      adminRoleId: null,
      adminActive: true,
    } as never);
    const { req, res, redirect } = buildReqRes({ state: 'admin' });

    await controller.googleAuthCallback(req, res);

    expect(authService.issueAdminSession).not.toHaveBeenCalled();
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 'user-2',
        action: 'ADMIN_LOGIN_DENIED',
        targetType: 'User',
        targetId: 'user-2',
      }),
    );
    expect(redirect).toHaveBeenCalledWith(
      `${ADMIN_FRONTEND_URL}/auth/callback?error=not_admin`,
    );
  });
});
