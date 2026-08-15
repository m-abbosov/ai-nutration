import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OnboardingDto } from './dto/onboarding.dto';
import { SetAiKeyDto } from './dto/set-ai-key.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.getMe(user.id);
  }

  @Post('onboarding')
  completeOnboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OnboardingDto,
  ): Promise<UserResponseDto> {
    return this.usersService.completeOnboarding(user.id, dto);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateMe(user.id, dto);
  }

  @Post('me/ai-key')
  setAiKey(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetAiKeyDto,
  ): Promise<UserResponseDto> {
    return this.usersService.setAiKey(user.id, dto);
  }

  @Delete('me/ai-key')
  removeAiKey(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.usersService.removeAiKey(user.id);
  }
}
