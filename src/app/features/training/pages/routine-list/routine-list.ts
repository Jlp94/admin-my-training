import { Component, inject, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RoutineService } from '../../data/routine.service';
import { Routine } from '../../domain/routine.model';
import { User } from '../../../users/domain/user.model';
import { UserInterface } from '../../../users/domain/user.interface';
import { UiService } from '../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-routine-list',
  imports: [
    TableModule, 
    ButtonModule, 
    TagModule, 
    TooltipModule, 
    RouterLink,
    CommonModule,
    SpinnerComponent
  ],
  providers: [],
  templateUrl: './routine-list.html',
  styleUrl: './routine-list.scss',
})
export class RoutineList {
  private readonly routineService = inject(RoutineService);
  private readonly uiService = inject(UiService);

  private readonly routinesResource = rxResource({
    stream: () => this.routineService.findAll()
  });

  protected readonly routines = computed(() => this.routinesResource.value() ?? []);
  protected readonly loading = this.routinesResource.isLoading;
  
  // Mapa para cachear los usuarios asignados a cada rutina expandida
  protected readonly assignedUsersMap = signal<Record<string, User[]>>({ });
  protected readonly loadingUsers = signal<Record<string, boolean>>({ });

  loadRoutines() {
    this.routinesResource.reload();
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

  deleteRoutine(routine: Routine) {
    this.uiService.confirmDelete(routine.name, () => {
        this.routineService.remove(routine._id).subscribe({
          next: () => {
            this.uiService.showSuccess('Rutina eliminada correctamente');
            this.loadRoutines();
          },
          error: () => {
            this.uiService.showError('No se pudo eliminar la rutina');
          }
        });
    });
  }

  getRoutineMainType(routine: Routine): string {
    if (!routine.sessions || routine.sessions.length === 0) return 'Personalizada';
    return routine.sessions[0].routineType;
  }
}
