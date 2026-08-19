export interface MuscleBalanceGroupDto {
  volume: number;
  percentage: number;
}

export interface MuscleBalanceResponseDto {
  push: MuscleBalanceGroupDto;
  pull: MuscleBalanceGroupDto;
  legs: MuscleBalanceGroupDto;
  core: MuscleBalanceGroupDto;
}
