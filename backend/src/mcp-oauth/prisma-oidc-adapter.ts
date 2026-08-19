import type { Adapter, AdapterPayload } from 'oidc-provider';
import { PrismaService } from '../database/prisma.service';

/**
 * Generic Postgres/Prisma adapter for oidc-provider, backed by the single
 * `OidcModel` table (see schema.prisma). One instance per model "name"
 * (Client, Grant, Session, AccessToken, ... — see oidc-provider's docs),
 * matching its documented adapter interface exactly.
 */
export class PrismaOidcAdapter implements Adapter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly name: string,
  ) {}

  async upsert(
    id: string,
    payload: AdapterPayload,
    expiresIn?: number,
  ): Promise<void> {
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    await this.prisma.oidcModel.upsert({
      where: { id: this.key(id) },
      create: {
        id: this.key(id),
        name: this.name,
        payload: payload as object,
        grantId: payload.grantId ?? null,
        userCode: payload.userCode ?? null,
        uid: payload.uid ?? null,
        expiresAt,
      },
      update: {
        payload: payload as object,
        grantId: payload.grantId ?? null,
        userCode: payload.userCode ?? null,
        uid: payload.uid ?? null,
        expiresAt,
      },
    });
  }

  async find(id: string): Promise<AdapterPayload | undefined> {
    const row = await this.prisma.oidcModel.findUnique({
      where: { id: this.key(id) },
    });
    return this.toPayload(row);
  }

  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    const row = await this.prisma.oidcModel.findFirst({
      where: { name: this.name, userCode },
    });
    return this.toPayload(row);
  }

  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    const row = await this.prisma.oidcModel.findFirst({
      where: { name: this.name, uid },
    });
    return this.toPayload(row);
  }

  async consume(id: string): Promise<void> {
    await this.prisma.oidcModel
      .update({
        where: { id: this.key(id) },
        data: { consumedAt: new Date() },
      })
      .catch(() => undefined); // already gone/expired — nothing to consume
  }

  async destroy(id: string): Promise<void> {
    await this.prisma.oidcModel
      .delete({ where: { id: this.key(id) } })
      .catch(() => undefined);
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    await this.prisma.oidcModel.deleteMany({ where: { grantId } });
  }

  /** Namespaces the row id by model name — oidc-provider ids are only
   * unique within their own model kind, not globally. */
  private key(id: string): string {
    return `${this.name}:${id}`;
  }

  private toPayload(
    row: {
      payload: unknown;
      consumedAt: Date | null;
      expiresAt: Date | null;
    } | null,
  ): AdapterPayload | undefined {
    if (!row) return undefined;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return undefined;
    const payload = row.payload as AdapterPayload;
    return row.consumedAt ? { ...payload, consumed: true } : payload;
  }
}

export function createOidcAdapterFactory(
  prisma: PrismaService,
): (name: string) => Adapter {
  return (name: string) => new PrismaOidcAdapter(prisma, name);
}
