import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends TokenPairDto {
  user: UserResponseDto;
}
