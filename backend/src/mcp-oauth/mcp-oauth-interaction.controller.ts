import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MCP_SCOPE, OidcProviderService } from './oidc-provider.service';

/**
 * Drives an oidc-provider "interaction" — the login/consent steps
 * Claude/ChatGPT's OAuth flow pauses on. Real state lives in oidc-provider's
 * own interaction cookie, readable only from THIS origin.
 *
 * Every endpoint here does a real HTTP redirect, never returns JSON — this
 * used to be a fetch()-driven JSON API the frontend consent page called
 * with `credentials: 'include'`, but that cookie is set on this backend's
 * origin while the page lives on the frontend's origin, making every read
 * of it a cross-origin `fetch()`. Modern browsers (Safari ITP, Chrome's
 * third-party cookie phase-out) block that regardless of `SameSite=None` —
 * confirmed in production: real users got "interaction session id cookie
 * not found" while a scripted end-to-end test (no such browser policy)
 * passed clean. A real top-level navigation — a full page redirect, or a
 * `<form method="POST">` submit — is exempt from that restriction the same
 * way it was exempt when oidc-provider first set the cookie during the
 * client's initial `/auth` redirect. So: `view` is the target of
 * oidc-provider's own `interactions.url` (a redirect, always same-origin
 * here first); `login`/`confirm`/`deny` are POST form-submit targets from
 * the frontend page (see JwtFromBodyMiddleware for how the access token —
 * unavailable as a header on a plain form post — still reaches
 * `JwtAuthGuard`). Each hands off to oidc-provider's own `/auth/:uid`
 * continuation, which redirects back through `view` again for the next
 * prompt (e.g. login then consent) or on to the client's own redirect_uri
 * once done.
 */
@Controller('mcp-oauth/interaction')
export class McpOauthInteractionController {
  constructor(private readonly oidcProviderService: OidcProviderService) {}

  @Get(':uid')
  async view(@Req() req: Request, @Res() res: Response): Promise<void> {
    const provider = this.oidcProviderService.provider;
    const frontendUrl = this.oidcProviderService.frontendUrl;

    let interaction;
    try {
      interaction = await provider.interactionDetails(req, res);
    } catch {
      res.redirect(303, `${frontendUrl}/oauth/consent?error=1`);
      return;
    }

    const clientId =
      typeof interaction.params.client_id === 'string'
        ? interaction.params.client_id
        : null;
    const client = clientId ? await provider.Client.find(clientId) : undefined;

    const url = new URL(`${frontendUrl}/oauth/consent/${interaction.uid}`);
    url.searchParams.set('prompt', interaction.prompt.name);
    if (client?.clientName ?? clientId) {
      url.searchParams.set('client', client?.clientName ?? clientId!);
    }
    res.redirect(303, url.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/login')
  async login(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const provider = this.oidcProviderService.provider;
    await this.loadOwnInteraction(req, res, uid);

    const redirectTo = await provider.interactionResult(
      req,
      res,
      { login: { accountId: user.id } },
      { mergeWithLastSubmission: true },
    );
    res.redirect(303, redirectTo);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/confirm')
  async confirm(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const provider = this.oidcProviderService.provider;
    const interaction = await this.loadOwnInteraction(req, res, uid);
    const clientId = interaction.params.client_id;
    if (typeof clientId !== 'string') {
      throw new BadRequestException('Missing client_id on interaction');
    }

    const grant = new provider.Grant({ accountId: user.id, clientId });
    grant.addResourceScope(this.oidcProviderService.resource, MCP_SCOPE);
    const grantId = await grant.save();

    const redirectTo = await provider.interactionResult(
      req,
      res,
      { consent: { grantId } },
      { mergeWithLastSubmission: true },
    );
    res.redirect(303, redirectTo);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/deny')
  async deny(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const provider = this.oidcProviderService.provider;
    await this.loadOwnInteraction(req, res, uid);

    const redirectTo = await provider.interactionResult(req, res, {
      error: 'access_denied',
      error_description: 'The user denied the request',
    });
    res.redirect(303, redirectTo);
  }

  private async loadOwnInteraction(req: Request, res: Response, uid: string) {
    const interaction =
      await this.oidcProviderService.provider.interactionDetails(req, res);
    if (interaction.uid !== uid) {
      throw new BadRequestException('Interaction id mismatch');
    }
    return interaction;
  }
}
