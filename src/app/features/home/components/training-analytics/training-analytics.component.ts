import { Component, inject } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardFacade } from '../../application/dashboard.facade';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-training-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SelectModule, ChartModule, ButtonModule, 
    TooltipModule, TagModule, SkeletonModule, KeyValuePipe
  ],
  templateUrl: './training-analytics.component.html',
  styleUrl: './training-analytics.component.scss'
})
export class TrainingAnalyticsComponent {
  public readonly facade = inject(DashboardFacade);

  readonly exerciseChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Kg', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Reps', font: { size: 11 } }, grid: { drawOnChartArea: false } },
    }
  };

  readonly miniChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { display: false },
      y: { ticks: { font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.03)' } }
    }
  };
}
