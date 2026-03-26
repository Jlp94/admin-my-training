import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

import { ExerciseService } from '../../data/exercise.service';
import { Exercise, EquipmentType, MuscleGroup, MovementType } from '../../domain/exercise.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, TextareaModule, MultiSelectModule,
    SelectModule, ToastModule, ConfirmDialogModule, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './exercise-list.html'
})
export class ExerciseList implements OnInit {
  private readonly exerciseService = inject(ExerciseService); 
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly exercises = signal<Exercise[]>([]);
  readonly loading = signal(false);
  
  readonly showDialog = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);

  exerciseForm: FormGroup;
  currentExerciseId?: string;

  readonly equipmentOptions = Object.values(EquipmentType).map(e => ({ label: e, value: e }));
  readonly muscleGroupOptions = Object.values(MuscleGroup).map(m => ({ label: m, value: m }));
  readonly movementTypeOptions = Object.values(MovementType).map(m => ({ label: m, value: m }));

  constructor() {
    this.exerciseForm = this.fb.group({
      name: ['', Validators.required],
      equipment: [null, Validators.required],
      movementTypes: [[], Validators.required],
      categories: [[], Validators.required],
      description: ['', Validators.required],
      videoUrl: ['']
    });
  }

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.loading.set(true);
    console.log('[ExerciseList] Pidiendo ejercicios a:', this.exerciseService['base']);
    this.exerciseService.findAll().subscribe({
      next: (data) => {
        console.log('[ExerciseList] Respuesta exitosa del API. Datos recibidos:', data);
        this.exercises.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ExerciseList] Error del API al pedir ejercicios:', err);
        this.messageService.add({ severity: 'error', summary: 'Error de Red/API', detail: 'Fallo al cargar ejercicios desde el servidor.' });
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.currentExerciseId = undefined;
    this.isEditing.set(false);
    this.exerciseForm.reset();
    this.showDialog.set(true);
  }

  editExercise(exercise: Exercise) {
    this.currentExerciseId = exercise._id;
    this.isEditing.set(true);
    this.exerciseForm.patchValue({
      name: exercise.name,
      equipment: exercise.equipment,
      movementTypes: exercise.movementTypes,
      categories: exercise.categories,
      description: exercise.description,
      videoUrl: exercise.videoUrl
    });
    this.showDialog.set(true);
  }

  saveExercise() {
    if (this.exerciseForm.invalid) {
      this.exerciseForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.exerciseForm.value;

    if (this.isEditing() && this.currentExerciseId) {
      this.exerciseService.update(this.currentExerciseId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ejercicio actualizado correctamente' });
          this.loadExercises();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    } else {
      this.exerciseService.create(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ejercicio creado correctamente' });
          this.loadExercises();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    }
  }

  deleteExercise(exercise: Exercise) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el ejercicio "${exercise.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.exerciseService.remove(exercise._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ejercicio eliminado' });
            this.loadExercises();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }

  closeDialog() {
    this.showDialog.set(false);
    this.saving.set(false);
    this.exerciseForm.reset();
  }

  private handleError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un problema en el servidor' });
    this.saving.set(false);
  }

  getSeverity(category: string):'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined | null{
    const map: Record<string, any> = {
      'core': 'warning',
      'pectoral': 'danger',
      'espalda': 'info',
      'cuádriceps': 'success',
      'femoral': 'success',
      'glúteo': 'success',
      'hombro': 'warning'
    };
    return map[category] || 'secondary';
  }
}
