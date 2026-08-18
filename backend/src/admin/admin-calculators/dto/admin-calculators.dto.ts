import { SeriesPointDto } from '../../common/dto-types';

export interface AdminCalculatorOverviewDto {
  totalUsage: number;
  uniqueUsers: number;
  usagePerDay: SeriesPointDto[];
  usagePerCalculator: { calculatorId: string; count: number }[];
}

export interface AdminCalculatorUsageListItemDto {
  id: string;
  createdAt: string;
  calculatorId: string;
  userName: string | null;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
}
