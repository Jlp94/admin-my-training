import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DayOfWeek, ExecutionMode } from '../domain/routine.model';
import { MuscleGroup } from '../domain/exercise.model';
import { RoutineType, RoutineTypeOptions } from '../domain/routine-type.enum';

@Injectable({ providedIn: 'root' })
export class RoutineFormService {
  private readonly fb = inject(FormBuilder);

  // Opciones estáticas
  readonly dayOptions = [
    { label: 'Lunes', value: DayOfWeek.LUNES },
    { label: 'Martes', value: DayOfWeek.MARTES },
    { label: 'Miércoles', value: DayOfWeek.MIERCOLES },
    { label: 'Jueves', value: DayOfWeek.JUEVES },
    { label: 'Viernes', value: DayOfWeek.VIERNES },
    { label: 'Sábado', value: DayOfWeek.SABADO },
    { label: 'Domingo', value: DayOfWeek.DOMINGO },
  ];

  readonly executionOptions = [
    { label: 'Normal', value: ExecutionMode.NORMAL },
    { label: 'SuperSet', value: ExecutionMode.SUPER_SET },
    { label: 'Rest-Pause', value: ExecutionMode.REST_PAUSE },
    { label: 'Drop-Set', value: ExecutionMode.DROP_SET },
  ];

  readonly routineTypeOptions = RoutineTypeOptions;
  readonly muscleGroups = Object.values(MuscleGroup).map(m => ({ label: m.toUpperCase(), value: m }));

  /**
   * Inicializa el formulario principal de una rutina
   */
  initForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      isActive: [true],
      userIds: [[]],
      sessions: this.fb.array([])
    });
  }

  /**
   * Crea un grupo de formulario para una sesión (día de entrenamiento)
   */
  createSessionGroup(data?: any): FormGroup {
    return this.fb.group({
      routineType: [data?.routineType || '', Validators.required],
      category: [data?.category || '', Validators.required],
      routineDayOfWeek: [data?.routineDayOfWeek ?? DayOfWeek.LUNES, Validators.required],
      observations: [data?.observations || ''],
      exercises: this.fb.array([])
    });
  }

  /**
   * Crea un grupo de formulario para un ejercicio dentro de una sesión
   */
  createExerciseGroup(data?: any): FormGroup {
    return this.fb.group({
      exerciseId: [data?.exerciseId || '', Validators.required],
      muscleGroup: [null], // Campo auxiliar para filtrar
      rest: [data?.rest || 120, [Validators.required, Validators.min(0)]],
      executionType: [data?.executionType || ExecutionMode.NORMAL],
      observations: [data?.observations || ''],
      tempo: this.fb.group({
        eccentric: [data?.tempo?.eccentric || 3],
        isometric: [data?.tempo?.isometric || 0],
        concentric: [data?.tempo?.concentric || 1]
      }),
      sets: this.fb.array([])
    });
  }

  /**
   * Crea un grupo de formulario para una serie (set)
   */
  createSetGroup(data?: any): FormGroup {
    return this.fb.group({
      kg: [data?.kg || 0, [Validators.required, Validators.min(0)]],
      reps: [data?.reps || 10, [Validators.required, Validators.min(1)]],
      rir: [data?.rir || 0, [Validators.required, Validators.min(0), Validators.max(5)]]
    });
  }

  /**
   * Devuelve las opciones de categoría dinámicamente según el tipo de rutina
   */
  getCategoryOptions(type: RoutineType) {
    switch (type) {
      case RoutineType.FULLBODY:
        return [
          { label: 'Día 1', value: '1' },
          { label: 'Día 2', value: '2' },
          { label: 'Día 3', value: '3' }
        ];
      case RoutineType.TORSO_PIERNA:
        return [
          { label: 'Torso', value: 'Torso' },
          { label: 'Pierna', value: 'Pierna' }
        ];
      case RoutineType.PUSH_PULL_LEG:
        return [
          { label: 'Push (Empuje)', value: 'Push' },
          { label: 'Pull (Tracción)', value: 'Pull' },
          { label: 'Legs (Pierna)', value: 'Legs' }
        ];
      case RoutineType.WEIDER:
        return Object.values(MuscleGroup).map(m => ({ 
          label: m.charAt(0).toUpperCase() + m.slice(1), 
          value: m 
        }));
      default:
        return [];
    }
  }
}
