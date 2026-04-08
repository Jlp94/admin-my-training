import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFacade } from '../../application/dashboard.facade';

@Component({
  selector: 'app-cardio-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cardio-analytics.component.html',
  styleUrl: './cardio-analytics.component.scss'
})
export class CardioAnalyticsComponent {
  public readonly facade = inject(DashboardFacade);
}
