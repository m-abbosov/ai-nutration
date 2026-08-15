import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from '../app.module';
import { EnvConfig } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';

/**
 * End-to-end proof that admin route enforcement actually happens at the
 * server boundary (docs/ADMIN_PANEL.md, "Enforcement"): a non-admin JWT is
 * rejected across a representative sample of modules, a role missing a
 * specific permission is rejected on that permission's route, and the
 * self-lockout guard on admin-team's PATCH route holds. Runs against a real
 * Postgres database (same one `prisma migrate dev`/`seed` were run
 * against) — the seeded AdminRole/AdminRolePermission rows this suite
 * depends on come from `prisma/seed.ts`.
 */
describe('Admin RBAC (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let secret: string;

  let nonAdminUserId: string;
  let moderatorUserId: string;
  let superAdminUserId: string;

  function tokenFor(userId: string): string {
    return jwt.sign({ sub: userId, type: 'access' }, secret);
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    secret = app
      .get(ConfigService<EnvConfig, true>)
      .get('JWT_SECRET', { infer: true });

    const suffix = Date.now();
    const nonAdmin = await prisma.user.create({
      data: { email: `rbac-nonadmin-${suffix}@test.local`, name: 'Non Admin' },
    });
    nonAdminUserId = nonAdmin.id;

    const moderatorRole = await prisma.adminRole.findUniqueOrThrow({
      where: { name: 'MODERATOR' },
    });
    const moderator = await prisma.user.create({
      data: {
        email: `rbac-moderator-${suffix}@test.local`,
        name: 'Moderator Admin',
        adminRoleId: moderatorRole.id,
        adminActive: true,
      },
    });
    moderatorUserId = moderator.id;

    const superAdminRole = await prisma.adminRole.findUniqueOrThrow({
      where: { name: 'SUPER_ADMIN' },
    });
    const superAdmin = await prisma.user.create({
      data: {
        email: `rbac-superadmin-${suffix}@test.local`,
        name: 'Super Admin',
        adminRoleId: superAdminRole.id,
        adminActive: true,
      },
    });
    superAdminUserId = superAdmin.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: { in: [nonAdminUserId, moderatorUserId, superAdminUserId] },
      },
    });
    await app.close();
  });

  describe('a non-admin JWT is rejected across modules', () => {
    it.each([
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/ai/requests',
    ])('GET %s -> 403 "Not an admin"', async (path) => {
      const res = await request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${tokenFor(nonAdminUserId)}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Not an admin');
    });
  });

  it('a MODERATOR-role admin gets 403 on GET /api/admin/admin-users (missing ADMIN_USERS_READ)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/admin-users')
      .set('Authorization', `Bearer ${tokenFor(moderatorUserId)}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Missing permission: ADMIN_USERS_READ');
  });

  it('a SUPER_ADMIN cannot disable their own admin access', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/admin-users/${superAdminUserId}`)
      .set('Authorization', `Bearer ${tokenFor(superAdminUserId)}`)
      .send({ adminActive: false });
    expect(res.status).toBe(400);

    const stillActive = await prisma.user.findUniqueOrThrow({
      where: { id: superAdminUserId },
    });
    expect(stillActive.adminActive).toBe(true);
  });

  it('a SUPER_ADMIN cannot demote themselves away from SUPER_ADMIN', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/admin-users/${superAdminUserId}`)
      .set('Authorization', `Bearer ${tokenFor(superAdminUserId)}`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(400);

    const role = await prisma.adminRole.findUniqueOrThrow({
      where: {
        id: (
          await prisma.user.findUniqueOrThrow({
            where: { id: superAdminUserId },
          })
        ).adminRoleId!,
      },
    });
    expect(role.name).toBe('SUPER_ADMIN');
  });

  it('a DISABLED user is rejected by JwtStrategy on any authenticated route', async () => {
    const disabled = await prisma.user.create({
      data: {
        email: `rbac-disabled-${Date.now()}@test.local`,
        name: 'Disabled User',
        status: 'DISABLED',
      },
    });
    try {
      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${tokenFor(disabled.id)}`);
      expect(res.status).toBe(401);
    } finally {
      await prisma.user.delete({ where: { id: disabled.id } });
    }
  });
});
