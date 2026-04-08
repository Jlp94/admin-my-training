import { Injectable, inject, signal, computed } from '@angular/core';
import { UserService } from '../../users/data/user.service';
import { User } from '../../users/domain/user.model';
import { DashboardService } from '../infrastructure/dashboard.service';
import { PeriodType } from '../domain/dashboard.types';

@Injectable({ providedIn: 'root' })
export class UserDashboardFacade {
  private readonly userService = inject(UserService);
  private readonly dashboardService = inject(DashboardService);

  // ── ESTADO (Signals) ──
  readonly users = signal<User[]>([]);
  readonly selectedUser = signal<User | null>(null);
  readonly loading = signal(false);
  readonly period = signal<PeriodType>('month');

  // ── CÓMPUTOS ──
  readonly lastWeight = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    const logs = user.getNeatLogs || [];
    const last = [...logs].reverse().find((l) => l.weight != null);
    return last?.weight ?? null;
  });

  readonly lastSteps = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    const logs = user.getNeatLogs || [];
    const last = [...logs].reverse().find((l) => l.steps != null);
    return last?.steps ?? null;
  });

  readonly weightChartData = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    return this.dashboardService.buildWeightChart(user.getNeatLogs || [], this.period());
  });

  readonly stepsChartData = computed(() => {
    const user = this.selectedUser();
    if (!user) return null;
    return this.dashboardService.buildStepsChart(user.getNeatLogs || [], this.period());
  });

  // ── ACCIONES ──
  loadAllUsers(onSuccess?: (clients: User[]) => void) {
    this.loading.set(true);
    this.userService.findAll().subscribe({
      next: (allUsers: User[]) => {
        const clients = allUsers.filter(
          (client: User) => client.getRole === 'user' && client.getIsActive,
        );
        this.users.set(clients);
        if (onSuccess) onSuccess(clients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  select(user: User) {
    this.selectedUser.set(user);
  }

  setPeriod(p: PeriodType) {
    this.period.set(p);
  }
}
