/** Shared response shape fragments from docs/ADMIN_API_CONTRACT.md ("Types"). */

export interface KpiDto {
  value: number;
  previousValue: number;
  deltaPct: number | null;
}

export interface SeriesPointDto {
  date: string;
  value: number;
}
