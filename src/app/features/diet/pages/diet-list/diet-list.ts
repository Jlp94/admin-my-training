import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { DietService } from '../../data/diet.service';
import { Diet } from '../../domain/diet.model';

@Component({
  selector: 'app-diet-list',
  imports: [
    TableModule, ButtonModule,
    ToastModule, ConfirmDialogModule, TagModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './diet-list.html',
  styleUrl: './diet-list.scss',
})
export class DietList implements OnInit {
  private readonly dietService = inject(DietService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly diets = signal<Diet[]>([]);
  readonly loading = signal(false);

  ngOnInit() {
    this.loadDiets();
  }

  loadDiets() {
    this.loading.set(true);
    this.dietService.findAll().subscribe({
      next: (data) => {
        this.diets.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las dietas' });
        this.loading.set(false);
      }
    });
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
        this.dietService.remove(diet._id).subscribe({
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
