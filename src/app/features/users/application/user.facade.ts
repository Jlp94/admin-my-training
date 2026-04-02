import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, finalize, Observable, map } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../data/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../domain/user.model';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Estado reactivo (Signals)
  private readonly _clients = signal<User[]>([]);
  private readonly _admins = signal<User[]>([]);
  private readonly _loading = signal(false);

  // Getters públicos (de solo lectura)
  readonly clients = this._clients.asReadonly();
  readonly admins = this._admins.asReadonly();
  readonly loading = this._loading.asReadonly();

  // Verifica si el ID proporcionado coincide con el del usuario logueado
  isCurrentUser(userId: string): boolean {
    return this.auth.currentUserId() === userId;
  }

  // Carga todos los usuarios y los clasifica por rol
  loadUsers() {
    this._loading.set(true);
    
    forkJoin({
      all: this.userService.findAll()
    }).pipe(
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: ({ all }) => {
        this._clients.set(all.filter(user => user.getRole === 'user'));
        this._admins.set(all.filter(user => user.getRole === 'admin'));
      },
      error: () => this.showError('No se pudieron cargar los usuarios')
    });
  }

  // Guarda un usuario (creación o edición)
  save(formVal: any, existingUser?: User): Observable<User> | void {
    const payload = User.preparePayload(formVal, existingUser);
    
    if (existingUser) {
      // EDICIÓN
      return this.userService.update(existingUser.getId, payload).pipe(
        map(user => {
            this.showSuccess('Usuario actualizado correctamente');
            this.loadUsers();
            return user;
        })
      );
    } else {
      // CREACIÓN
      return this.userService.create(payload).pipe(
        map(user => {
            this.showSuccess('Usuario creado correctamente');
            this.loadUsers();
            return user;
        })
      );
    }
  }

  // Elimina un usuario con confirmación previa
  delete(user: User) {
    if (this.isCurrentUser(user.getId)) {
      this.showError('No puedes eliminar tu propio usuario mientras estás conectado.');
      return;
    }

    this.confirmationService.confirm({
      message: `¿Eliminar al usuario "${user.getEmail}" de la base de datos?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.remove(user.getId).subscribe({
          next: () => {
            this.showSuccess('Usuario eliminado');
            this.loadUsers();
          },
          error: () => this.showError('No se pudo eliminar al usuario')
        });
      }
    });
  }

  // Activa o desactiva la cuenta de un usuario (Alterna el estado actual)
  toggleActive(user: User) {
    if (this.isCurrentUser(user.getId)) {
      this.showError('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }

    // Calculamos el nuevo estado (el opuesto al actual)
    const nuevoEstado = !user.getIsActive;

    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres ${nuevoEstado ? 'ACTIVAR' : 'DESACTIVAR'} a ${user.getProfile?.name || user.getEmail}?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: nuevoEstado ? 'p-button-success' : 'p-button-danger',
      
      accept: () => {
        this.userService.update(user.getId, { isActive: nuevoEstado }).subscribe({
          next: () => {
            this.showSuccess('Usuario actualizado correctamente');
            user.setIsActive = nuevoEstado; // Actualización optimista del objeto local
          },
          error: () => {
            this.showError('Error al comunicar con el servidor');
          }
        });
      }
    });
  }

  private showSuccess(detail: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail });
  }

  private showError(detail: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
