import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

import { UserService } from '../../../users/data/user.service';
import { User } from '../../../users/domain/user.model';
import { DashboardService, PeriodType, ExerciseOption } from '../../data/dashboard.service';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/models/api-response.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    FormsModule, SelectModule, ChartModule, ButtonModule, TooltipModule,
    TagModule, SkeletonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dashboardService = inject(DashboardService);
  private readonly http = inject(HttpClient);

  // State
  readonly users = signal<User[]>([]);
  readonly selectedUser = signal<User | null>(null);
  readonly loading = signal(false);
  readonly loadingExercise = signal(false);
  readonly period = signal<PeriodType>('month');
  readonly activeTab = signal<string>('training');
  readonly selectedExerciseId = signal<string | null>(null);

  // Exercise progression raw data
  readonly exerciseProgression = signal<{ date: string; stats: { kg: number; reps: number; rir: number } }[]>([]);

  // Period options
  readonly periodOptions = [
    { label: 'Semanal', value: 'week' as PeriodType },
    { label: 'Mensual', value: 'month' as PeriodType },
    { label: 'Trimestral', value: 'quarter' as PeriodType },
  ];

  // Computed: last weight and steps from neatLogs
  readonly lastWeight = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    const logs = user.getProfile?.neatLogs || [];
    const last = [...logs].reverse().find(l => l.weight != null);
    return last?.weight ?? null;
  });

  readonly lastSteps = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    const logs = user.getProfile?.neatLogs || [];
    const last = [...logs].reverse().find(l => l.steps != null);
    return last?.steps ?? null;
  });

  readonly currentMacros = computed(() => {
    const user = this.selectedUser();
    return user?.getProfile?.macros ?? null;
  });

  // Computed: list of exercises from workoutLogs
  readonly exerciseList = computed<ExerciseOption[]>(() => {
    const user = this.selectedUser();
    if (!user) return [];
    return this.dashboardService.extractExercises(user.getProfile?.workoutLogs || []);
  });

  // Computed: weight chart data
  readonly weightChartData = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    return this.dashboardService.buildWeightChart(user.getProfile?.neatLogs || [], this.period());
  });

  // Computed: steps chart data
  readonly stepsChartData = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    return this.dashboardService.buildStepsChart(user.getProfile?.neatLogs || [], this.period());
  });

  // Computed: exercise progression chart data
  readonly exerciseChartData = computed(() => {
    const data = this.exerciseProgression();
    if (!data.length) return null;
    return this.dashboardService.buildExerciseChart(data, this.period());
  });

  // Chart options
  readonly lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 16, font: { weight: 'bold', size: 11 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
    }
  };

  readonly exerciseChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 16, font: { weight: 'bold', size: 11 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Kg', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Reps', font: { size: 11 } }, grid: { drawOnChartArea: false } },
    }
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.findAll().subscribe({
      next: (users) => {
        const clients = users.filter(u => u.getRole === 'user' && u.getIsActive);
        this.users.set(clients);
        if (clients.length > 0) {
          this.selectUser(clients[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectUser(user: User) {
    this.selectedUser.set(user);
    this.selectedExerciseId.set(null);
    this.exerciseProgression.set([]);

    // Auto-select first exercise if available
    const exercises = this.dashboardService.extractExercises(user.getProfile?.workoutLogs || []);
    if (exercises.length > 0) {
      this.selectExercise(exercises[0].id, user.getId);
    }
  }

  selectExercise(exerciseId: string, userId?: string) {
    this.selectedExerciseId.set(exerciseId);
    const uid = userId || this.selectedUser()?.getId;
    if (!uid) return;

    this.loadingExercise.set(true);
    this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/users/${uid}/exercise-log/${exerciseId}`)
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

  setPeriod(period: PeriodType) {
    this.period.set(period);
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  // Workout count
  readonly workoutCount = computed(() => {
    const user = this.selectedUser();
    return user?.getProfile?.workoutLogs?.length ?? 0;
  });
}
