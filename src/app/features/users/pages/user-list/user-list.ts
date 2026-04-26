import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

import { UserFacade } from '../../application/user.facade';
import { User } from '../../domain/user.model';
import { UiService } from '../../../../shared/services/ui.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule,
    SelectModule, ToggleSwitchModule, TagModule, TooltipModule, SpinnerComponent
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  protected readonly facade = inject(UserFacade);
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);

  protected readonly showDialog = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly saving = signal(false);

  private currentUser?: User; 

  protected readonly roleOptions = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Cliente (Usuario)', value: 'user' }
  ];

  protected userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]], 
    role: ['user', Validators.required],
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    height: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
    weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]]
  });

  constructor() {
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      const height = this.userForm.get('height');
      const weight = this.userForm.get('weight');
      if (role === 'admin') {
        height?.clearValidators();
        weight?.clearValidators();
      } else {
        height?.setValidators([Validators.required, Validators.min(100), Validators.max(250)]);
        weight?.setValidators([Validators.required, Validators.min(30), Validators.max(300)]);
      }
      height?.updateValueAndValidity();
      weight?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.facade.loadUsers();
  }

  openNew() {
    this.currentUser = undefined;
    this.isEditing.set(false);
    this.userForm.reset({ role: 'user' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog.set(true);
  }

  editUser(user: User) {
    this.currentUser = user;
    this.isEditing.set(true);
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.patchValue({
      email: user.getEmail,
      password: '',
      role: user.getRole,
      isActive: user.getIsActive,
      name: user.getProfile?.name || '',
      lastName: user.getProfile?.lastName || '',
      height: user.getProfile?.height || null,
      weight: user.getProfile?.weight || null
    });
    this.showDialog.set(true);
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const result = this.facade.save(this.userForm.value, this.currentUser);
    
    if (result) {
      result.subscribe({
        next: () => this.closeDialog(),
        error: (err: any) => {
          const msg = err?.error?.error?.message || err?.error?.message || 'Error al guardar el usuario';
          this.uiService.showError(typeof msg === 'string' ? msg : msg[0]);
          this.saving.set(false);
        }
      });
    } else {
      this.saving.set(false);
    }
  }

  deleteUser(user: User) {
    this.facade.delete(user);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.saving.set(false);
  }
}
