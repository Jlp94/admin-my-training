import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { UserFacade } from '../../application/user.facade';
import { User } from '../../domain/user.model';

@Component({
  selector: 'app-user-list',

  imports: [
    ReactiveFormsModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule,
    SelectModule, ToggleSwitchModule, ToastModule, ConfirmDialogModule, TagModule, TooltipModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  protected readonly facade = inject(UserFacade);
  private readonly fb = inject(FormBuilder);

  readonly showDialog = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);

  currentUser?: User; 

  readonly roleOptions = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Cliente (Usuario)', value: 'user' }
  ];

  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]], // Se validará dinámicamente
    role: ['user', Validators.required],
    isActive: [true],
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    height: [null],
    weight: [null]
  });


  ngOnInit() {
    this.facade.loadUsers();
  }

  openNew() {
    this.currentUser = undefined;
    this.isEditing.set(false);
    this.userForm.reset({ role: 'user', isActive: true });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog.set(true);
  }

  editUser(user: User) {
    this.currentUser = user;
    this.isEditing.set(false); // Esta linea estaba mal en el archivo? Ah no, era true.
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
        error: () => this.saving.set(false)
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
