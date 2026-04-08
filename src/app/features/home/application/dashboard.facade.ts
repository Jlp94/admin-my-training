import { Injectable, inject, signal, computed } from '@angular/core';
import { UserDashboardFacade } from './user-dashboard.facade';
import { DietDashboardFacade } from './diet-dashboard.facade';
import { TrainingDashboardFacade } from './training-dashboard.facade';
import { User } from '../../users/domain/user.model';
import { PeriodType, StatCard } from '../domain/dashboard.types';
import { DashboardService } from '../infrastructure/dashboard.service';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly userFacade = inject(UserDashboardFacade);
  private readonly dietFacade = inject(DietDashboardFacade);
  private readonly trainingFacade = inject(TrainingDashboardFacade);
  public readonly dashboardService = inject(DashboardService);

  // ── ESTADO COMPARTIDO / AGREGADO ──
  readonly users = this.userFacade.users;
  readonly selectedUser = this.userFacade.selectedUser;
  readonly loading = this.userFacade.loading;
  readonly period = this.userFacade.period;
  readonly weightChartData = this.userFacade.weightChartData;
  readonly stepsChartData = this.userFacade.stepsChartData;
  
  readonly allFoods = this.dietFacade.allFoods;
  readonly selectedDiet = this.dietFacade.selectedDiet;
  readonly selectedDietId = this.dietFacade.selectedDietId;
  readonly macroChartData = this.dietFacade.macroChartData;
  readonly getExtraKcal = this.dietFacade.getExtraKcal;
  readonly getTargetKcal = this.dietFacade.getTargetKcal;
  readonly getProtein = this.dietFacade.getProtein;
  readonly getCarbs = this.dietFacade.getCarbs;
  readonly getFat = this.dietFacade.getFat;

  readonly selectedRoutine = this.trainingFacade.selectedRoutine;
  readonly activeSessionIndex = this.trainingFacade.activeSessionIndex;
  readonly weekOffset = this.trainingFacade.weekOffset;
  readonly sessionExerciseCharts = this.trainingFacade.sessionExerciseCharts;
  readonly exerciseProgression = this.trainingFacade.exerciseProgression;
  readonly selectedExerciseId = this.trainingFacade.selectedExerciseId;
  readonly loadingExercise = this.trainingFacade.loadingExercise;
  readonly weekSummary = this.trainingFacade.weekSummary;
  readonly currentWeekLogs = this.trainingFacade.currentWeekLogs;
  readonly exerciseList = this.trainingFacade.exerciseList;
  readonly exerciseChartData = this.trainingFacade.exerciseChartData;

  readonly activeTab = signal<string>('training');

  // ── CONFIGURACIÓN ──
  readonly periodOptions = [
    { label: 'Semanal', value: 'week' as PeriodType },
    { label: 'Mensual', value: 'month' as PeriodType },
    { label: 'Trimestral', value: 'quarter' as PeriodType },
    { label: 'Historial', value: 'all' as PeriodType },
  ];

  // ── CÓMPUTOS DINÁMICOS (Cross-Facade) ──
  
  readonly lastWeight = this.userFacade.lastWeight;
  readonly lastSteps = this.userFacade.lastSteps;

  readonly periodLabel = computed(() => {
    const p = this.period();
    if (p === 'week') return 'Semana';
    if (p === 'month') return 'Mes';
    return 'Trimestre';
  });

  readonly statsCards = computed<StatCard[]>(() => {
    const user = this.selectedUser();
    const routine = this.selectedRoutine();
    if (!user) return [];

    const sessionsPerWeek = routine?.sessions?.length ?? 0;
    const workoutValue = sessionsPerWeek > 0 ? sessionsPerWeek : '—';
    const workoutUnit = sessionsPerWeek > 0 ? 'días' : undefined;

    return [
      {
        label: 'Último Peso',
        value: this.lastWeight() ?? '—',
        unit: 'kg',
        icon: 'fa-solid fa-weight-scale',
        colorClass: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
        valueColorClass: 'text-emerald-600 dark:text-emerald-400',
        type: 'standard',
      },
      {
        label: 'Últimos Pasos',
        value: this.lastSteps() ?? '—',
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
  });

  // ── ACCIONES ──

  init() {
    this.dietFacade.loadAllFoods();
    this.userFacade.loadAllUsers((clients) => {
      if (clients.length > 0) {
        this.selectUser(clients[0]);
      }
    });
  }

  selectUser(user: User) {
    this.userFacade.select(user);
    
    // Al cambiar de usuario, reseteamos y cargamos sus planes específicos
    this.trainingFacade.clear();
    this.dietFacade.clear();

    const rid = user.getCurrentRoutineId;
    if (rid) this.trainingFacade.selectRoutine(rid);

    const did = user.getCurrentDietId;
    if (did) this.dietFacade.selectDiet(did);
  }

  selectExercise(exerciseId: string, userId?: string) {
    this.trainingFacade.selectExercise(exerciseId, userId);
  }

  setPeriod(p: PeriodType) {
    this.userFacade.setPeriod(p);
    this.trainingFacade.loadSessionProgressions();
  }

  setTab(t: string | number | undefined) {
    if (t !== undefined) {
      this.activeTab.set(String(t));
    }
  }

  setSession(idx: string | number | undefined) {
    if (idx !== undefined) {
      this.trainingFacade.setSession(Number(idx));
    }
  }

  changeWeek(delta: number) {
    this.trainingFacade.changeWeek(delta);
  }
}
