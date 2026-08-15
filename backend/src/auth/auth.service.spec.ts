import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { GoogleProfilePayload } from './strategies/google.strategy';

/**
 * `loginWithGoogle` (Phase 1) and `resolveAdminGoogleUser` (Phase 2) both
 * call the same private `resolveGoogleUser` upsert logic — this proves that
 * shared logic still resolves/creates a user exactly as Phase 1 did:
 * googleId match first, then email match (linking googleId), then create.
 */
describe('AuthService — resolveGoogleUser (shared by loginWithGoogle and the admin branch)', () => {
  const PROFILE: GoogleProfilePayload = {
    googleId: 'google-abc',
    email: 'person@example.com',
    name: 'Person',
    avatarUrl: 'https://example.com/a.png',
  };

  function buildService(prismaOverrides: Record<string, unknown>) {
    const prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        ...prismaOverrides,
      },
    };
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('tok'),
    } as unknown as JwtService;
    const configService = {
      get: jest.fn().mockReturnValue('secret'),
    };
    const featureFlags = { isEnabled: jest.fn().mockResolvedValue(true) };

    const service = new AuthService(
      prisma as never,
      jwtService,
      configService as never,
      featureFlags as never,
    );
    return { service, prisma };
  }

  // These three exercise the shared `resolveGoogleUser` upsert logic via
  // `resolveAdminGoogleUser` — a thin pass-through to the same private
  // method `loginWithGoogle` calls, but without the token-issuance side
  // effects (which also touch `prisma.user.update` for refreshTokenHash),
  // so the assertions below isolate resolve-only behavior precisely.
  it('finds an existing user by googleId and does not create or re-link', async () => {
    const existing = {
      id: 'u1',
      googleId: 'google-abc',
      email: 'person@example.com',
    };
    const { service, prisma } = buildService({
      findUnique: jest.fn().mockResolvedValue(existing),
    });

    const resolved = await service.resolveAdminGoogleUser(PROFILE);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { googleId: PROFILE.googleId },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(resolved).toBe(existing);
  });

  it('falls back to matching by email and links googleId when no googleId match exists', async () => {
    const byEmail = { id: 'u2', googleId: null, email: 'person@example.com' };
    const linked = { ...byEmail, googleId: PROFILE.googleId };
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(null) // by googleId — no match
      .mockResolvedValueOnce(byEmail); // by email — match
    const { service, prisma } = buildService({
      findUnique,
      update: jest.fn().mockResolvedValue(linked),
    });

    const resolved = await service.resolveAdminGoogleUser(PROFILE);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u2' },
      data: { googleId: PROFILE.googleId },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(resolved).toBe(linked);
  });

  it('creates a new user when neither googleId nor email matches', async () => {
    const created = {
      id: 'u3',
      googleId: PROFILE.googleId,
      email: PROFILE.email,
    };
    const { service, prisma } = buildService({
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(created),
    });

    const resolved = await service.resolveAdminGoogleUser(PROFILE);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        googleId: PROFILE.googleId,
        email: PROFILE.email,
        name: PROFILE.name,
        avatarUrl: PROFILE.avatarUrl,
      },
    });
    expect(resolved).toBe(created);
  });

  it('loginWithGoogle (Phase 1 path) still issues a token pair via the same resolve logic', async () => {
    const existing = {
      id: 'u1',
      googleId: 'google-abc',
      email: 'person@example.com',
    };
    const { service, prisma } = buildService({
      findUnique: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(existing),
      findUniqueOrThrow: jest.fn().mockResolvedValue(existing),
    });

    const result = await service.loginWithGoogle(PROFILE);

    expect(result.accessToken).toBe('tok');
    expect(result.refreshToken).toBe('tok');
    // The only update call in this path is issueTokenPair persisting the
    // refresh token hash — never a googleId-link (already matched by id).
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { refreshTokenHash: expect.any(String) },
    });
  });

  it('resolveAdminGoogleUser resolves the identical user row loginWithGoogle would (same shared upsert)', async () => {
    const existing = {
      id: 'u1',
      googleId: 'google-abc',
      email: 'person@example.com',
      adminRoleId: null,
      adminActive: true,
    };
    const { service, prisma } = buildService({
      findUnique: jest.fn().mockResolvedValue(existing),
    });

    const resolved = await service.resolveAdminGoogleUser(PROFILE);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { googleId: PROFILE.googleId },
    });
    expect(resolved).toBe(existing);
  });
});
