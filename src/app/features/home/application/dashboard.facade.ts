import { Injectable, inject, signal, computed } from '@angular/core';
import { UserDashboardFacade } from './user-dashboard.facade';
import { DietDashboardFacade } from './diet-dashboard.facade';
import { TrainingDashboardFacade } from './training-dashboard.facade';
import { User } from '../../users/domain/user.model';
import { PeriodType, StatCard } from '../domain/dashboard.types';
import { DashboardService } from '../infrastructure/dashboard.service';
import { buildStatCards, DASHBOARD_PERIOD_OPTIONS } from '../domain/dashboard.data';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly userFacade = inject(UserDashboardFacade);
  private readonly dietFacade = inject(DietDashboardFacade);
  private readonly trainingFacade = inject(TrainingDashboardFacade);
  public readonly dashboardService = inject(DashboardService);

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
  readonly exercisePeriod = this.trainingFacade.exercisePeriod;

  setExercisePeriod(p: 'quarter' | 'all') {
    this.trainingFacade.setExercisePeriod(p);
  }

  readonly activeTab = signal<string>('training');
  readonly periodOptions = DASHBOARD_PERIOD_OPTIONS;

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
    
    return buildStatCards(
      user, 
      this.lastWeight(), 
      this.lastSteps(), 
      sessionsPerWeek
    );
  });

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

  updateSelectedUser(user: User) {
    this.userFacade.updateSelectedUser(user);
  }
}
