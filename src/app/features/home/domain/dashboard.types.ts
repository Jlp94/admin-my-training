export type PeriodType = 'week' | 'month' | 'quarter';

export interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
    yAxisID?: string;
    pointRadius?: number;
    borderWidth?: number;
  }[];
}

export interface ExerciseOption {
  id: string;
  name: string;
  count: number;
}

export interface StatCard {
  label: string;
  value: any;
  subValue?: string;
  unit?: string;
  icon: string;
  colorClass: string;      // Clases para el icono (ej: bg-emerald-50 text-emerald-500)
  valueColorClass?: string; // Clases para el texto del valor (ej: text-emerald-600)
  type: 'standard' | 'macros';
}
