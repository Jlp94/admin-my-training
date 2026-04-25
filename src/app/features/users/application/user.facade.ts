import { Injectable, inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, finalize, Observable, map } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../data/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../domain/user.model';
import { UiService } from '../../../shared/services/ui.service';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly uiService = inject(UiService);

  private readonly usersResource = rxResource({
    stream: () => this.userService.findAll()
  });
  readonly activeClients = computed(() =>
    this.usersResource.value()?.filter((u: User) =>
      u.getRole === 'user' && u.getIsActive) ?? []);
  readonly inactiveClients = computed(() =>
    this.usersResource.value()?.filter((u: User) =>
      u.getRole === 'user' && !u.getIsActive) ?? []);
  readonly admins = computed(() =>
    this.usersResource.value()?.filter((u: User) =>
    u.getRole === 'admin') ?? []);
  readonly loading = this.usersResource.isLoading;

  isCurrentUser(userId: string): boolean {
    return this.auth.currentUserId() === userId;
  }


  loadUsers() {
    this.usersResource.reload();
  }

  save(formVal: any, existingUser?: User): Observable<User> | void {
    const payload = User.preparePayload(formVal, existingUser);
    
    if (existingUser) {
      return this.userService.update(existingUser.getId, payload).pipe(
        map(user => {
            this.uiService.showSuccess('Usuario actualizado correctamente');
            this.loadUsers();
            return user;
        })
      );
    } else {
      return this.userService.create(payload).pipe(
        map(user => {
            this.uiService.showSuccess('Usuario creado correctamente');
            this.loadUsers();
            return user;
        })
      );
    }
  }

  delete(user: User) {
    if (this.isCurrentUser(user.getId)) {
      this.uiService.showError('No puedes eliminar tu propio usuario mientras estás conectado.');
      return;
    }

    this.uiService.confirmDelete(user.getEmail, () => {
      this.userService.remove(user.getId).subscribe({
        next: () => {
          this.uiService.showSuccess('Usuario eliminado');
          this.loadUsers();
        },
        error: () => this.uiService.showError('No se pudo eliminar al usuario')
      });
    });
  }

  toggleActive(user: User) {
    if (this.isCurrentUser(user.getId)) {
      this.uiService.showError('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }

    const nuevoEstado = !user.getIsActive;
    const nombre = user.getFullName() || user.getEmail;

    this.uiService.confirmDialog({
      header: nuevoEstado ? 'Confirmar Activación' : 'Confirmar Desactivación',
      message: nuevoEstado 
        ? `¿Estás seguro de que deseas activar la cuenta de "${nombre}"?`
        : `¿Estás seguro de que deseas desactivar la cuenta de "${nombre}"? El usuario dejará de tener acceso a la aplicación.`,
      icon: nuevoEstado ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation',
      acceptLabel: nuevoEstado ? 'Sí, Activar' : 'Sí, Desactivar',
      acceptButtonStyleClass: nuevoEstado ? 'p-button-success' : 'p-button-warning',
      onAccept: () => {
        this.userService.update(user.getId, { isActive: nuevoEstado }).subscribe({
          next: () => {
            this.uiService.showSuccess(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
            this.loadUsers();
          },
          error: () => this.uiService.showError('Error al comunicar con el servidor')
        });
      }
    });
  }

}
