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

interface InteractionDetailsDto {
  uid: string;
  prompt: string;
  clientId: string | null;
  clientName: string | null;
}

interface RedirectDto {
  redirectTo: string;
}

/**
 * JSON API the frontend's consent page (`/oauth/consent/:uid`) drives to
 * complete an oidc-provider "interaction" — the login/consent steps
 * Claude/ChatGPT's OAuth flow pauses on. Thin wrapper: real state lives in
 * oidc-provider's own interaction cookie (set when it redirected the
 * browser here), read via `provider.interactionDetails(req, res)`.
 *
 * POST endpoints use `interactionResult` (not `interactionFinished`) —
 * it computes the next redirect URL without sending an HTTP redirect
 * itself, so we can return it as JSON and let the frontend perform a real
 * `window.location` navigation. A raw HTTP redirect response here would
 * just be followed by `fetch()` internally and silently discarded, never
 * reaching the browser — this flow can bounce through oidc-provider more
 * than once (login, then consent) before finally leaving to the client's
 * own redirect_uri, so a real navigation is required.
 *
 * `GET` needs no NutriAI session — it only reads the (unrelated) oidc
 * interaction cookie, so an anonymous visitor can still see what a client
 * is asking for. `POST` endpoints require a valid NutriAI JWT since they
 * decide access to *that* user's own data.
 */
@Controller('mcp-oauth/interaction')
export class McpOauthInteractionController {
  constructor(private readonly oidcProviderService: OidcProviderService) {}

  @Get(':uid')
  async details(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<InteractionDetailsDto> {
    const provider = this.oidcProviderService.provider;
    const interaction = await provider.interactionDetails(req, res);
    const clientId =
      typeof interaction.params.client_id === 'string'
        ? interaction.params.client_id
        : null;
    const client = clientId ? await provider.Client.find(clientId) : undefined;

    return {
      uid: interaction.uid,
      prompt: interaction.prompt.name,
      clientId,
      clientName: client?.clientName ?? clientId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/login')
  async login(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RedirectDto> {
    const provider = this.oidcProviderService.provider;
    await this.loadOwnInteraction(req, res, uid);

    const redirectTo = await provider.interactionResult(
      req,
      res,
      { login: { accountId: user.id } },
      { mergeWithLastSubmission: true },
    );
    return { redirectTo };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/confirm')
  async confirm(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RedirectDto> {
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
    return { redirectTo };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':uid/deny')
  async deny(
    @Param('uid') uid: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RedirectDto> {
    const provider = this.oidcProviderService.provider;
    await this.loadOwnInteraction(req, res, uid);

    const redirectTo = await provider.interactionResult(req, res, {
      error: 'access_denied',
      error_description: 'The user denied the request',
    });
    return { redirectTo };
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
