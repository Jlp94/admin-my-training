import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardFacade } from '../../application/dashboard.facade';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-diet-analytics',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, TagModule, TooltipModule, RouterLink, Toast],
  templateUrl: './diet-analytics.component.html',
  styleUrl: './diet-analytics.component.scss'
})
export class DietAnalyticsComponent {
  public readonly facade = inject(DashboardFacade);

  readonly macroChartOptions: any = {
    plugins: {
      legend: { display: false }
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 }
  };

  readonly mealSummaries = computed(() => {
    const diet = this.facade.selectedDiet();
    const foods = this.facade.allFoods();
    if (!diet || !foods.length) return [];

    return diet.meals.map(meal => {
      let totalP = 0, totalC = 0, totalF = 0, totalKcal = 0;

      const processedFoods = (meal.foods || []).map(mf => {
        const food = foods.find(f => f._id === mf.foodId);
        
        const factor = mf.quantity / 100;
        const p = (food?.protein || 0) * factor;
        const c = (food?.carbs || 0) * factor;
        const f = (food?.fat || 0) * factor;
        const k = (food?.kcal || 0) * factor;

        totalP += p; totalC += c; totalF += f; totalKcal += k;

        return {
          name: food?.name || 'Alimento desconocido',
          quantity: mf.quantity,
          protein: p,
          carbs: c,
          fat: f,
          kcal: k
        };
      });

      return {
        name: meal.name,
        foods: processedFoods,
        totals: { p: totalP, c: totalC, f: totalF, kcal: totalKcal },
        chartData: {
          labels: ['Proteína', 'Carbohidratos', 'Grasas'],
          datasets: [{
            data: [totalP, totalC, totalF],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
            borderWidth: 0
          }]
        }
      };
    });
  });

}
