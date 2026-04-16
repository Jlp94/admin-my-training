import { Component, inject, computed, DestroyRef } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { DietService } from '../../data/diet.service';
import { UserService } from '../../../users/data/user.service';
import { Diet } from '../../domain/diet.model';
import { UiService } from '../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-diet-list',
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, RouterLink, SpinnerComponent
  ],
  providers: [],
  templateUrl: './diet-list.html',
  styleUrl: './diet-list.scss',
})
export class DietList {
  private readonly dietService = inject(DietService);
  private readonly userService = inject(UserService);
  private readonly uiService = inject(UiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly dietsResource = rxResource({
    stream: () => this.dietService.findAll()
  });

  private readonly usersResource = rxResource({
    stream: () => this.userService.findAll()
  });

  protected readonly diets = computed(() => this.dietsResource.value() ?? []);
  
  private readonly usersMap = computed(() => {
    const mapping: Record<string, string> = {};
    const users = this.usersResource.value() ?? [];
    users.forEach(u => mapping[u.getId] = u.getFullName());
    return mapping;
  });

  protected readonly loading = computed(() => this.dietsResource.isLoading() || this.usersResource.isLoading());

  getUserName(userId: string): string {
    return this.usersMap()[userId] || 'Usuario desconocido';
  }

  loadDiets() {
    this.dietsResource.reload();
  }

  deleteDiet(diet: Diet) {
    this.uiService.confirmDelete(diet.name, () => {
      this.dietService.remove(diet._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uiService.showSuccess('Dieta eliminada correctamente');
          this.loadDiets();
        },
        error: () => this.uiService.showError('No se pudo eliminar la dieta')
      });
    });
  }
}
