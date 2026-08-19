/**
 * Jest can't parse `oidc-provider` — it ships pure ESM with no CJS build,
 * and Jest's default transform ignores everything under node_modules (see
 * jest.config.js's `moduleNameMapper`, which redirects `oidc-provider`
 * imports here for every test). None of our current test suites exercise
 * real OAuth behavior; they only need `OidcProviderService`'s constructor
 * (mcp-oauth/oidc-provider.service.ts) to not throw while building the
 * Nest module graph.
 */
class Provider {
  proxy = false;
  Grant = class {
    addResourceScope() {}
    async save() {
      return 'mock-grant-id';
    }
  };
  Client = { find: async () => undefined };
  AccessToken = { find: async () => undefined };

  constructor(..._args: unknown[]) {}
  callback() {
    return () => {};
  }
  async interactionDetails() {
    return { uid: 'mock', prompt: { name: 'login' }, params: {} };
  }
  async interactionResult() {
    return '/mock-redirect';
  }
}

export default Provider;
export const errors = {
  InvalidTarget: class InvalidTarget extends Error {},
};
