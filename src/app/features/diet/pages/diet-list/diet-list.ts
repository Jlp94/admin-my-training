import { Component, inject, computed, DestroyRef } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';

import { DietService } from '../../data/diet.service';
import { UserService } from '../../../users/data/user.service';
import { Diet } from '../../domain/diet.model';

@Component({
  selector: 'app-diet-list',
  imports: [
    TableModule, ButtonModule,
    ToastModule, ConfirmDialogModule, TagModule, TooltipModule, RouterLink
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './diet-list.html',
  styleUrl: './diet-list.scss',
})
export class DietList {
  private readonly dietService = inject(DietService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
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
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la dieta "${diet.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.dietService.remove(diet._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dieta eliminada correctamente' });
            this.loadDiets();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la dieta' })
        });
      }
    });
  }
}
