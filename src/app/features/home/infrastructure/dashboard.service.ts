import { Injectable } from '@angular/core';
import { WorkoutLogInterface, UserNeatInterface } from '../../users/domain/user.interface';
import { PeriodType, ChartDataset, ExerciseOption } from '../domain/dashboard.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private getCutoffDate(period: PeriodType): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (period) {
      case 'week': {
        const day = now.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        return monday;
      }
      case 'month':   return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:        return new Date(0);
    }
  }

  getWeekRange(offset: number = 0): { start: Date; end: Date } {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const day = now.getDay();
    const diffToMonday = (day === 0 ? 6 : day - 1);
    
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday + (offset * 7));
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  countWorkoutsInRange(workoutLogs: WorkoutLogInterface[], start: Date, end: Date): number {
    return (workoutLogs || []).filter(log => {
      const date = new Date(log.doneAt);
      return date >= start && date <= end;
    }).length;
  }

  countWorkoutsByPeriod(workoutLogs: WorkoutLogInterface[], period: PeriodType): number {
    const cutoff = this.getCutoffDate(period);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.countWorkoutsInRange(workoutLogs, cutoff, end);
  }

  buildWeightChart(neatLogs: UserNeatInterface[], period: PeriodType): ChartDataset {
    const cutoff = this.getCutoffDate(period);
    const filtered = (neatLogs || [])
      .filter(log => new Date(log.date) >= cutoff && log.weight != null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: filtered.map(l => this.formatDate(l.date)),
      datasets: [
        {
          label: 'Peso (kg)',
          data: filtered.map(l => l.weight!),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          borderWidth: 2.5,
        }
      ]
    };
  }

  buildStepsChart(neatLogs: UserNeatInterface[], period: PeriodType): ChartDataset {
    const cutoff = this.getCutoffDate(period);
    const filtered = (neatLogs || [])
      .filter(log => new Date(log.date) >= cutoff && log.steps != null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: filtered.map(l => this.formatDate(l.date)),
      datasets: [
        {
          label: 'Pasos',
          data: filtered.map(l => l.steps!),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          borderWidth: 2,
        }
      ]
    };
  }

  buildExerciseChart(progressionData: { date: string; stats: { kg: number; reps: number; rir: number } }[], period: PeriodType): ChartDataset {
    const cutoff = this.getCutoffDate(period);
    const filtered = (progressionData || [])
      .filter(item => new Date(item.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: filtered.map(d => this.formatDate(d.date)),
      datasets: [
        {
          label: 'Peso (kg)',
          data: filtered.map(d => d.stats.kg),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.35,
          fill: false,
          yAxisID: 'y',
          pointRadius: 5,
          borderWidth: 2.5,
        },
        {
          label: 'Reps',
          data: filtered.map(d => d.stats.reps),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.35,
          fill: false,
          yAxisID: 'y1',
          pointRadius: 4,
          borderWidth: 2,
        }
      ]
    };
  }

  extractExercises(workoutLogs: WorkoutLogInterface[]): ExerciseOption[] {
    const map = new Map<string, { name: string; count: number }>();

    (workoutLogs || []).forEach(wl => {
      (wl.exerciseLogs || []).forEach(el => {
        const existing = map.get(el.exerciseId);
        if (existing) {
          existing.count++;
        } else {
          map.set(el.exerciseId, { name: el.name, count: 1 });
        }
      });
    });

    return Array.from(map.entries())
      .map(([id, v]) => ({ id, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}
