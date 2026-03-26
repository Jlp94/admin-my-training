import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { CardioService } from '../../data/cardio.service';
import { Cardio, CardioType } from '../../domain/cardio.model';

@Component({
  selector: 'app-cardio-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule,
    SelectModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cardio-list.html'
})
export class CardioList implements OnInit {
  private readonly cardioService = inject(CardioService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly cardios = signal<Cardio[]>([]);
  readonly loading = signal(false);
  
  readonly showDialog = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);

  cardioForm: FormGroup;
  currentCardioId?: string;

  readonly typeOptions = Object.values(CardioType).map(t => ({ label: t.toUpperCase(), value: t }));

  constructor() {
    this.cardioForm = this.fb.group({
      type: [null, Validators.required],
      label: ['', Validators.required],
      kcalMin: [10, [Validators.required, Validators.min(1)]],
      instrucciones: this.fb.array([])
    });
  }

  get instruccionesFormArray() {
    return this.cardioForm.get('instrucciones') as FormArray;
  }

  addInstruction() {
    this.instruccionesFormArray.push(this.fb.group({
      label: ['', Validators.required],
      valor: ['', Validators.required]
    }));
  }

  removeInstruction(index: number) {
    this.instruccionesFormArray.removeAt(index);
  }

  ngOnInit() {
    this.loadCardios();
  }

  loadCardios() {
    this.loading.set(true);
    this.cardioService.findAll().subscribe({
      next: (data) => {
        this.cardios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las actividades de cardio' });
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.currentCardioId = undefined;
    this.isEditing.set(false);
    this.cardioForm.reset({ kcalMin: 10 });
    this.instruccionesFormArray.clear();
    this.showDialog.set(true);
  }

  editCardio(cardio: Cardio) {
    this.currentCardioId = cardio._id;
    this.isEditing.set(true);
    
    this.instruccionesFormArray.clear();
    cardio.instrucciones?.forEach(inst => {
      this.instruccionesFormArray.push(this.fb.group({
        label: [inst.label, Validators.required],
        valor: [inst.valor, Validators.required]
      }));
    });

    this.cardioForm.patchValue({
      type: cardio.type,
      label: cardio.label,
      kcalMin: cardio.kcalMin
    });
    
    this.showDialog.set(true);
  }

  saveCardio() {
    if (this.cardioForm.invalid) {
      this.cardioForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.cardioForm.value;

    if (this.isEditing() && this.currentCardioId) {
      this.cardioService.update(this.currentCardioId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado correctamente' });
          this.loadCardios();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    } else {
      this.cardioService.create(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Creado correctamente' });
          this.loadCardios();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    }
  }

  deleteCardio(cardio: Cardio) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la actividad "${cardio.label}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cardioService.remove(cardio._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad eliminada' });
            this.loadCardios();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }

  closeDialog() {
    this.showDialog.set(false);
    this.saving.set(false);
  }

  private handleError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Problema en el servidor' });
    this.saving.set(false);
  }
}
