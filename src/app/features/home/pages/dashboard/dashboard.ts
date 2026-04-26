import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TrainingAnalyticsComponent } from '../../components/training-analytics/training-analytics.component';
import { DietAnalyticsComponent } from '../../components/diet-analytics/diet-analytics.component';
import { CardioAnalyticsComponent } from '../../components/cardio-analytics/cardio-analytics.component';
import { CalculatorNeatAnalyticsComponent } from '../../components/calculator-neat-analytics/calculator-neat-analytics.component';

import { DashboardFacade } from '../../application/dashboard.facade';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SelectModule, ChartModule, ButtonModule, TooltipModule,
    TagModule, SkeletonModule, TabsModule,
    TrainingAnalyticsComponent, DietAnalyticsComponent, CardioAnalyticsComponent, CalculatorNeatAnalyticsComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly facade = inject(DashboardFacade);

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

  ngOnInit() {
    this.facade.init();
  }
}
