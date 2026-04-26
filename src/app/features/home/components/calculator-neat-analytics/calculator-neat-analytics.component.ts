import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DashboardFacade } from '../../application/dashboard.facade';
import { UserService } from '../../../users/data/user.service';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-calculator-neat-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, InputNumberModule, ButtonModule],
  templateUrl: './calculator-neat-analytics.component.html',
  styleUrl: './calculator-neat-analytics.component.scss',
})
export class CalculatorNeatAnalyticsComponent {
  public readonly facade = inject(DashboardFacade);
  private readonly userService = inject(UserService);
  private readonly uiService = inject(UiService);

  gender = signal<string>('male');
  activityLevel = signal<number>(1.55);
  weight = signal<number | null>(null);
  height = signal<number | null>(null);
  age = signal<number | null>(null);
  
  // Porcentajes editables
  pProtein = signal<number>(25);
  pCarbs = signal<number>(50);
  pFat = signal<number>(25);
  
  saving = signal(false);

  readonly genderOptions = [
    { label: 'Hombre', value: 'male' },
    { label: 'Mujer', value: 'female' },
  ];

  readonly activityOptions = [
    { label: 'Sedentario (poco/sin ejercicio)', value: 1.2 },
    { label: 'Ligero (1-3 días/semana)', value: 1.375 },
    { label: 'Moderado (3-5 días/semana)', value: 1.55 },
    { label: 'Muy activo (6-7 días/semana)', value: 1.725 },
  ];

  readonly currentWeight = computed(() => {
    const user = this.facade.selectedUser();
    if (!user) return null;
    const last = user.getLastWeight();
    return typeof last === 'number' ? last : null;
  });

  readonly baseWeight = computed(() => this.facade.selectedUser()?.getWeight ?? null);
  readonly baseHeight = computed(() => this.facade.selectedUser()?.getHeight ?? null);

  constructor() {
    effect(() => {
      const user = this.facade.selectedUser();
      if (user) {
        this.weight.set(user.getWeight ?? null);
        this.height.set(user.getHeight ?? null);
        
        // Si el usuario ya tiene macros, cargamos sus porcentajes
        const m = user.getMacros;
        if (m && m.pProtein) {
          this.pProtein.set(m.pProtein);
          this.pCarbs.set(m.pCarbs || 0);
          this.pFat.set(m.pFat || 0);
        }
      }
    });
  }

  readonly tmb = computed(() => {
    const w = this.weight();
    const h = this.height();
    const a = this.age();
    if (!w || !h || !a) return null;

    if (this.gender() === 'male') {
      return Math.round(88.362 + 13.397 * w + 4.799 * h - 5.677 * a);
    } else {
      return Math.round(447.593 + 9.247 * w + 3.098 * h - 4.33 * a);
    }
  });

  readonly tdee = computed(() => {
    const t = this.tmb();
    if (!t) return null;
    return Math.round(t * this.activityLevel());
  });

  readonly macros = computed(() => {
    const total = this.tdee();
    const pp = this.pProtein();
    const pc = this.pCarbs();
    const pf = this.pFat();
    if (!total) return null;
    
    const w = this.currentWeight() || this.weight() || 1;
    
    return {
      protein: Math.round((total * (pp / 100)) / 4),
      carbs: Math.round((total * (pc / 100)) / 4),
      fat: Math.round((total * (pf / 100)) / 9),
      pProtein: pp,
      pCarbs: pc,
      pFat: pf,
      proteinPerKg: Number(((total * (pp / 100)) / 4 / w).toFixed(2)),
      fatPerKg: Number(((total * (pf / 100)) / 9 / w).toFixed(2)),
    };
  });

  readonly totalPercentage = computed(() => this.pProtein() + this.pCarbs() + this.pFat());

  applyMacros() {
    const user = this.facade.selectedUser();
    const tdee = this.tdee();
    const m = this.macros();
    if (!user || !tdee || !m) return;

    if (this.totalPercentage() !== 100) {
      this.uiService.showError('La suma de los porcentajes debe ser exactamente 100%');
      return;
    }

    this.saving.set(true);

    const payload = {
      targetKcal: tdee,
      pProtein: m.pProtein,
      pCarbs: m.pCarbs,
      pFat: m.pFat,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat
    };

    this.userService.updateMacros(user.getId, payload).subscribe({
      next: (updatedUser: any) => {
        this.facade.updateSelectedUser(updatedUser);
        this.uiService.showSuccess(`Macros aplicados a ${user.getFullName()}: ${tdee} kcal/día`);
        this.saving.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Error al guardar los macros';
        this.uiService.showError(typeof msg === 'string' ? msg : msg[0]);
        this.saving.set(false);
      },
    });
  }
}
