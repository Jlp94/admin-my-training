import { User } from '../../users/domain/user.model';
import { PeriodType, StatCard } from './dashboard.types';

export const DASHBOARD_PERIOD_OPTIONS = [
  { label: 'Semanal', value: 'week' as PeriodType },
  { label: 'Mensual', value: 'month' as PeriodType },
  { label: 'Trimestral', value: 'quarter' as PeriodType },
  { label: 'Historial', value: 'all' as PeriodType },
];

export function buildStatCards(
  user: User,
  lastWeight: any,
  lastSteps: any,
  sessionsPerWeek: number
): StatCard[] {
  const workoutValue = sessionsPerWeek > 0 ? sessionsPerWeek : '—';
  const workoutUnit = sessionsPerWeek > 0 ? 'días' : undefined;

  return [
    {
      label: 'Último Peso',
      value: lastWeight ?? '—',
      unit: 'kg',
      icon: 'fa-solid fa-weight-scale',
      colorClass: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
      valueColorClass: 'text-emerald-600 dark:text-emerald-400',
      type: 'standard',
    },
    {
      label: 'Últimos Pasos',
      value: lastSteps ?? '—',
      icon: 'fa-solid fa-shoe-prints',
      colorClass: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500',
      valueColorClass: 'text-indigo-600 dark:text-indigo-400',
      type: 'standard',
    },
    {
      label: 'Objetivo Kcal',
      value: user.getTargetKcal || '—',
      unit: 'kcal',
      icon: 'fa-solid fa-fire-flame-curved',
      colorClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
      valueColorClass: 'text-amber-600 dark:text-amber-400',
      type: 'standard',
    },
    {
      label: 'Macros (g)',
      value: {
        p: user.getProtein || '—',
        c: user.getCarbs || '—',
        f: user.getFat || '—',
      },
      icon: 'fa-solid fa-chart-pie',
      colorClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
      type: 'macros',
    },
    {
      label: 'Entrenamientos',
      value: workoutValue,
      unit: workoutUnit,
      icon: 'fa-solid fa-dumbbell',
      colorClass: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
      valueColorClass: 'text-purple-600 dark:text-purple-400',
      type: 'standard',
    },
  ];
}
