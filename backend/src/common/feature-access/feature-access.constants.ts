/** Known per-user gated feature keys. Plain strings (not a Prisma enum) so a
 * new gated page/feature never needs a migration — see UserFeatureAccess in
 * schema.prisma. Add new keys here as new features need gating. */
export const FEATURE_KEYS = {
  FITNESS: 'FITNESS',
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

/**
 * Interim bootstrap allowlist: emails always granted a feature even with no
 * UserFeatureAccess row, so the very first rollout doesn't require a
 * production DB write nobody can currently make from this environment (no
 * public DB proxy, SSH blocked — see the fitness-catalog seed note). Once a
 * real UserFeatureAccess row is granted via the admin panel for these
 * emails, this allowlist becomes redundant (the DB row already grants it)
 * but stays harmless — safe to leave in place.
 */
export const FEATURE_BOOTSTRAP_EMAILS: Partial<Record<FeatureKey, string[]>> = {
  FITNESS: ['m.abbbosov@gmail.com'],
};
