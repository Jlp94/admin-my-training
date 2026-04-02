import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RoutineService } from '../../data/routine.service';
import { Routine } from '../../domain/routine.model';
import { User } from '../../../users/domain/user.model';
import { UserInterface } from '../../../users/domain/user.interface';

@Component({
  selector: 'app-routine-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    TagModule, 
    TooltipModule, 
    ToastModule, 
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './routine-list.html',
  styleUrl: './routine-list.scss',
})
export class RoutineList implements OnInit {
  private readonly routineService = inject(RoutineService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly routines = signal<Routine[]>([]);
  readonly loading = signal(false);
  
  // Mapa para cachear los usuarios asignados a cada rutina expandida
  readonly assignedUsersMap = signal<Record<string, User[]>>({ });
  readonly loadingUsers = signal<Record<string, boolean>>({ });

  ngOnInit() {
    this.loadRoutines();
  }

  loadRoutines() {
    this.loading.set(true);
    this.routineService.findAll().subscribe({
      next: (data) => {
        this.routines.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'No se pudieron cargar las rutinas' 
        });
        this.loading.set(false);
      }
    });
  }

  onRowExpand(event: any) {
    const routine = event.data as Routine;
    if (this.assignedUsersMap()[routine._id]) return;

    this.loadingUsers.update(prev => ({ ...prev, [routine._id]: true }));
    
    this.routineService.getAssignedUsers(routine._id).subscribe({
      next: (users: UserInterface[]) => {
        const userInstances = users.map(u => new User(u));
        this.assignedUsersMap.update(prev => ({ ...prev, [routine._id]: userInstances }));
        this.loadingUsers.update(prev => ({ ...prev, [routine._id]: false }));
      },
      error: () => {
        this.loadingUsers.update(prev => ({ ...prev, [routine._id]: false }));
      }
    });
  }

  goToNew() {
    this.router.navigate(['/training/routines/new']);
  }

  editRoutine(routine: Routine) {
    this.router.navigate(['/training/routines/edit', routine._id]);
  }

  deleteRoutine(routine: Routine) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.routineService.remove(routine._id).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Rutina eliminada correctamente' 
            });
            this.loadRoutines();
          },
          error: () => {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'No se pudo eliminar la rutina' 
            });
          }
        });
      }
    });
  }

  getRoutineMainType(routine: Routine): string {
    if (!routine.sessions || routine.sessions.length === 0) return 'Personalizada';
    return routine.sessions[0].routineType;
  }
}
