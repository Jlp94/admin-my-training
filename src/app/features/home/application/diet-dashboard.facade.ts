import { Injectable, inject, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DietService } from '../../diet/data/diet.service';
import { FoodService } from '../../diet/data/food.service';
import { Diet } from '../../diet/domain/diet.model';
import { UserDashboardFacade } from './user-dashboard.facade';

@Injectable({ providedIn: 'root' })
export class DietDashboardFacade {
  private readonly dietService = inject(DietService);
  private readonly foodService = inject(FoodService);
  private readonly userFacade = inject(UserDashboardFacade);

  private readonly allFoodsResource = rxResource({
    stream: () => this.foodService.findAll()
  });

  readonly allFoods = computed(() => this.allFoodsResource.value() ?? []);

  readonly selectedDiet = signal<Diet | null>(null);

  readonly selectedDietId = computed(() => this.selectedDiet()?._id ?? '');
  
  readonly getExtraKcal = computed(() => 
    this.selectedDiet()?.extraKcal ?? this.userFacade.selectedUser()?.getExtraKcal ?? 0
  );
  readonly getTargetKcal = computed(() => this.userFacade.selectedUser()?.getTargetKcal ?? 0);
  readonly getProtein = computed(() => this.userFacade.selectedUser()?.getProtein ?? 0);
  readonly getCarbs = computed(() => this.userFacade.selectedUser()?.getCarbs ?? 0);
  readonly getFat = computed(() => this.userFacade.selectedUser()?.getFat ?? 0);

  readonly macroChartData = computed(() => {
    const user = this.userFacade.selectedUser();
    if (!user) return null;

    return {
      labels: ['Proteína', 'Carbohidratos', 'Grasas'],
      datasets: [
        {
          data: [user.getProtein || 0, user.getCarbs || 0, user.getFat || 0],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
          hoverBackgroundColor: ['#059669', '#2563eb', '#d97706'],
        },
      ],
    };
  });

  loadAllFoods() {
    this.allFoodsResource.reload();
  }

  selectDiet(dietId: string) {
    this.dietService.findOne(dietId).subscribe((d) => {
      this.selectedDiet.set(d);
    });
  }

  clear() {
    this.selectedDiet.set(null);
  }
}
