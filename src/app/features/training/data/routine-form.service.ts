import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { DayOfWeek, ExecutionMode } from '../domain/routine.model';
import { getControlArray, removeLastItem } from '../../../shared/utils/form.utils';
import { 
  DAY_OPTIONS, 
  EXECUTION_OPTIONS, 
  MUSCLE_GROUPS, 
  ROUTINE_TYPE_OPTIONS, 
  getCategoryOptions 
} from '../domain/routine-form.data';

@Injectable({ providedIn: 'root' })
export class RoutineFormService {
  private readonly fb = inject(FormBuilder);

  readonly dayOptions = DAY_OPTIONS;
  readonly executionOptions = EXECUTION_OPTIONS;
  readonly routineTypeOptions = ROUTINE_TYPE_OPTIONS;
  readonly muscleGroups = MUSCLE_GROUPS;

  getCategoryOptions = getCategoryOptions;

  initForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      isActive: [true],
      userIds: [[]],
      sessions: this.fb.array([]),
    });
  }

  createSessionGroup(data?: any): FormGroup {
    return this.fb.group({
      routineType: [data?.routineType || '', Validators.required],
      category: [data?.category || '', Validators.required],
      routineDayOfWeek: [data?.routineDayOfWeek ?? DayOfWeek.LUNES, Validators.required],
      observations: [data?.observations || ''],
      exercises: this.fb.array([]),
    });
  }

  createExerciseGroup(data?: any): FormGroup {
    return this.fb.group({
      exerciseId: [data?.exerciseId || '', Validators.required],
      muscleGroup: [null],
      rest: [data?.rest || 120, [Validators.required, Validators.min(0)]],
      executionType: [data?.executionType || ExecutionMode.NORMAL],
      observations: [data?.observations || ''],
      tempo: this.fb.group({
        eccentric: [data?.tempo?.eccentric || 3],
        isometric: [data?.tempo?.isometric || 0],
        concentric: [data?.tempo?.concentric || 1],
      }),
      sets: this.fb.array([]),
    });
  }

  createSetGroup(data?: any): FormGroup {
    return this.fb.group({
      kg: [data?.kg || 0, [Validators.required, Validators.min(0)]],
      reps: [data?.reps || 10, [Validators.required, Validators.min(1)]],
      rir: [data?.rir || 0, [Validators.required, Validators.min(0), Validators.max(5)]],
    });
  }

  getControlArray(parent: AbstractControl, path: string): FormArray {
    return getControlArray(parent, path);
  }

  removeLastItem(array: FormArray, minLength: number = 1): void {
    removeLastItem(array, minLength);
  }
}
