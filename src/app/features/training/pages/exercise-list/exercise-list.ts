import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ExerciseService } from '../../data/exercise.service';
import { Exercise, EquipmentType, MuscleGroup, MovementType } from '../../domain/exercise.model';
import { UiService } from '../../../../shared/services/ui.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-exercise-list',
  imports: [
    ReactiveFormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, TextareaModule, MultiSelectModule,
    SelectModule, TagModule, TooltipModule, SpinnerComponent
  ],
  providers: [],
  templateUrl: './exercise-list.html'
})
export class ExerciseList {
  private readonly exerciseService = inject(ExerciseService); 
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly exercisesResource = rxResource({
    stream: () => this.exerciseService.findAll()
  });

  protected readonly exercises = computed(() => this.exercisesResource.value() ?? []);
  protected readonly loading = this.exercisesResource.isLoading;
  
  protected readonly showDialog = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly saving = signal(false);

  protected exerciseForm: FormGroup;
  protected currentExerciseId?: string;

  protected readonly equipmentOptions = Object.values(EquipmentType).map(e => ({ label: e, value: e }));
  protected readonly muscleGroupOptions = Object.values(MuscleGroup).map(m => ({ label: m, value: m }));
  protected readonly movementTypeOptions = Object.values(MovementType).map(m => ({ label: m, value: m }));

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

  loadExercises() {
    this.exercisesResource.reload();
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
    
    const formVal = this.exerciseForm.value;
    const payload = {
      ...formVal,
      tags: [],
      videoUrl: formVal.videoUrl || 'https://youtube.com'
    };

    if (this.isEditing() && this.currentExerciseId) {
      this.exerciseService.update(this.currentExerciseId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uiService.showSuccess('Ejercicio actualizado correctamente');
          this.loadExercises();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    } else {
      this.exerciseService.create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uiService.showSuccess('Ejercicio creado correctamente');
          this.loadExercises();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    }
  }

  deleteExercise(exercise: Exercise) {
    this.uiService.confirmDelete(exercise.name, () => {
        this.exerciseService.remove(exercise._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.uiService.showSuccess('Ejercicio eliminado');
            this.loadExercises();
          },
          error: () => this.uiService.showError('No se pudo eliminar el ejercicio')
        });
    });
  }

  closeDialog() {
    this.showDialog.set(false);
    this.saving.set(false);
    this.exerciseForm.reset();
  }

  private handleError() {
    this.uiService.showError('Ha ocurrido un problema en el servidor');
    this.saving.set(false);
  }

  getSeverity(category: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'core': 'warn',
      'pectoral': 'danger',
      'espalda': 'info',
      'cuádriceps': 'success',
      'femoral': 'success',
      'glúteo': 'success',
      'hombro': 'warn'
    };
    return severityMap[category] ?? 'secondary';
  }
}
