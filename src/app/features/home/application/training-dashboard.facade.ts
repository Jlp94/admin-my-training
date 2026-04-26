import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RoutineService } from '../../training/data/routine.service';
import { DashboardService } from '../infrastructure/dashboard.service';
import { Routine } from '../../training/domain/routine.model';
import { PeriodType, ExerciseOption } from '../domain/dashboard.types';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { forkJoin, map as rxMap, catchError, of } from 'rxjs';
import { UserDashboardFacade } from './user-dashboard.facade';

@Injectable({ providedIn: 'root' })
export class TrainingDashboardFacade {
  private readonly routineService = inject(RoutineService);
  private readonly dashboardService = inject(DashboardService);
  private readonly userFacade = inject(UserDashboardFacade);
  private readonly http = inject(HttpClient);

  readonly selectedRoutine = signal<Routine | null>(null);
  readonly activeSessionIndex = signal<number>(0);
  readonly weekOffset = signal<number>(0);
  readonly sessionExerciseCharts = signal<Record<string, any>>({});
  readonly exerciseProgression = signal<{ date: string; stats: { kg: number; reps: number; rir: number } }[]>([]);
  readonly selectedExerciseId = signal<string | null>(null);
  readonly loadingExercise = signal(false);
  readonly exercisePeriod = signal<'quarter' | 'all'>('quarter');

  readonly weekSummary = computed(() => {
    const user = this.userFacade.selectedUser();
    const offset = this.weekOffset();
    if (!user) return null;

    const range = this.dashboardService.getWeekRange(offset);
    const actual = this.dashboardService.countWorkoutsInRange(
      user.getWorkoutLogs,
      range.start,
      range.end,
    );
    const scheduledPerWeek = this.selectedRoutine()?.sessions?.length ?? 0;

    return {
      start: this.dashboardService.formatDate(range.start),
      end: this.dashboardService.formatDate(range.end),
      actual,
      scheduled: scheduledPerWeek,
    };
  });

  readonly currentWeekLogs = computed(() => {
    const user = this.userFacade.selectedUser();
    const offset = this.weekOffset();
    if (!user) return [];

    const range = this.dashboardService.getWeekRange(offset);
    return (user.getWorkoutLogs || [])
      .filter((log) => {
        const d = new Date(log.doneAt);
        return d >= range.start && d <= range.end;
      })
      .sort((a, b) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime());
  });

  readonly exerciseList = computed<ExerciseOption[]>(() => {
    const user = this.userFacade.selectedUser();
    if (!user) return [];
    return this.dashboardService.extractExercises(user.getWorkoutLogs || []);
  });

  readonly exerciseChartData = computed(() => {
    const data = this.exerciseProgression();
    const period = this.exercisePeriod();
    if (!data.length) return null;
    return this.dashboardService.buildExerciseChart(data, period as any);
  });

  selectRoutine(id: string) {
    this.routineService.findOne(id).subscribe((r) => {
      this.selectedRoutine.set(r);
      this.activeSessionIndex.set(0);
      this.loadSessionProgressions();
    });
  }

  selectExercise(exerciseId: string, userId?: string) {
    this.selectedExerciseId.set(exerciseId);
    const uid = userId || this.userFacade.selectedUser()?.getId;
    if (!uid) return;

    this.loadingExercise.set(true);
    this.http
      .get<ApiResponse<any[]>>(`${environment.apiUrl}/users/${uid}/exercise-log/${exerciseId}`)
      .subscribe({
        next: (res) => {
          this.exerciseProgression.set(res.data || []);
          this.loadingExercise.set(false);
        },
        error: () => {
          this.exerciseProgression.set([]);
          this.loadingExercise.set(false);
        },
      });
  }

  setSession(idx: number) {
    this.activeSessionIndex.set(idx);
    this.loadSessionProgressions();
  }

  setPeriod(p: PeriodType) {
    this.userFacade.setPeriod(p);
    this.loadSessionProgressions();
  }

  changeWeek(delta: number) {
    this.weekOffset.update((v) => v + delta);
    this.loadSessionProgressions();
  }

  setExercisePeriod(p: 'quarter' | 'all') {
    this.exercisePeriod.set(p);
    this.loadSessionProgressions();
  }

  clear() {
    this.selectedRoutine.set(null);
    this.sessionExerciseCharts.set({});
    this.exerciseProgression.set([]);
  }

  loadSessionProgressions() {
    const user = this.userFacade.selectedUser();
    const routine = this.selectedRoutine();
    const sIdx = this.activeSessionIndex();

    if (!user || !routine || !routine.sessions?.[sIdx]) {
      this.sessionExerciseCharts.set({});
      return;
    }

    const session = routine.sessions[sIdx];
    const exercises = session.exercises || [];

    if (exercises.length === 0) {
      this.sessionExerciseCharts.set({});
      return;
    }

    this.loadingExercise.set(true);
    const requests = exercises.map((ex) =>
      this.http
        .get<ApiResponse<any[]>>(`${environment.apiUrl}/users/${user.getId}/exercise-log/${ex.exerciseId}`)
        .pipe(
          rxMap((res) => ({ id: ex.exerciseId, name: ex.name, data: res.data || [] })),
          catchError(() => of({ id: ex.exerciseId, name: ex.name, data: [] }))
        )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const charts: Record<string, any> = {};
        results.forEach((res) => {
          if (res.data.length > 0) {
            charts[res.id] = {
              name: res.name,
              data: this.dashboardService.buildExerciseChart(res.data, this.exercisePeriod() as any),
            };
          }
        });
        this.sessionExerciseCharts.set(charts);
        this.loadingExercise.set(false);
      },
      error: () => {
        this.sessionExerciseCharts.set({});
        this.loadingExercise.set(false);
      },
    });
  }
}
