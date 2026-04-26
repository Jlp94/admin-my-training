import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardFacade } from '../../application/dashboard.facade';
import { UserService } from '../../../users/data/user.service';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-cardio-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, ButtonModule, TooltipModule],
  templateUrl: './cardio-analytics.component.html',
  styleUrl: './cardio-analytics.component.scss'
})
export class CardioAnalyticsComponent {
  public readonly facade = inject(DashboardFacade);
  private readonly userService = inject(UserService);
  private readonly uiService = inject(UiService);

  isEditingGoal = signal(false);
  cardioKcalGoal = signal<number | null>(null);
  savingGoal = signal(false);

  constructor() {
    effect(() => {
      const user = this.facade.selectedUser();
      if (user) {
        this.cardioKcalGoal.set(user.getCardioKcalGoal);
      }
    });
  }

  toggleEdit() {
    this.isEditingGoal.set(!this.isEditingGoal());
  }

  saveGoal() {
    const user = this.facade.selectedUser();
    const goal = this.cardioKcalGoal();
    if (!user || goal === null) return;

    this.savingGoal.set(true);

    this.userService.update(user.getId, { cardioKcalGoal: goal } as any).subscribe({
      next: (updatedUser: any) => {
        this.facade.updateSelectedUser(updatedUser);
        this.uiService.showSuccess(`Objetivo de cardio actualizado para ${user.getFullName()}`);
        this.savingGoal.set(false);
        this.isEditingGoal.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Error al guardar el objetivo de cardio';
        this.uiService.showError(typeof msg === 'string' ? msg : msg[0]);
        this.savingGoal.set(false);
      }
    });
  }
}
