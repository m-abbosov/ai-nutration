export interface RecommendationDto {
  name: string;
  estimatedCalories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  reason: string;
}

export interface RecommendationsResponseDto {
  recommendations: RecommendationDto[];
}
