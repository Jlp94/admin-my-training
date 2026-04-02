import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';

import { RoutineService } from '../../data/routine.service';
import { ExerciseService } from '../../data/exercise.service';
import { UserService } from '../../../users/data/user.service';
import { RoutineFormService } from '../../data/routine-form.service';
import { Routine, DayOfWeek, ExecutionMode } from '../../domain/routine.model';
import { Exercise, MuscleGroup } from '../../domain/exercise.model';
import { User } from '../../../users/domain/user.model';
import { RoutineType } from '../../domain/routine-type.enum';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-routine-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelect,
    CardModule,
    ToastModule,
    TooltipModule,
    TextareaModule,
    FloatLabelModule,
  ],
  providers: [MessageService],
  templateUrl: './routine-edit.html',
  styleUrl: './routine-edit.scss',
})
export class RoutineEdit implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly routineService = inject(RoutineService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly userService = inject(UserService);
  readonly routineFormService = inject(RoutineFormService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly isEditing = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly routineId = signal<string | null>(null);

  getCategoryOptions(sessionIndex: number) {
    const session = this.sessions.at(sessionIndex);
    const type = session.get('routineType')?.value;
    return this.routineFormService.getCategoryOptions(type);
  }

  // Usuarios
  readonly users = signal<User[]>([]);
  readonly clientOptions = computed(() =>
    this.users()
      .filter((u) => u.getRole === 'user')
      .map((u) => ({ label: u.getFullName(), value: u.getId })),
  );

  // Cache de ejercicios por grupo muscular
  readonly exercisesByGroup = signal<Record<string, Exercise[]>>({});

  routineForm: FormGroup;

  constructor() {
    this.routineForm = this.routineFormService.initForm();
  }

  get sessions() {
    return this.routineForm.get('sessions') as FormArray;
  }

  ngOnInit() {
    this.loadUsers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.routineId.set(id);
      this.loadRoutine(id);
    } else {
      // Si es nueva, empezamos con una sesión
      this.addSession();
    }
  }

  loadRoutine(id: string) {
    this.loading.set(true);
    this.routineService.findOne(id).subscribe({
      next: (routine) => {
        this.routineForm.patchValue({
          name: routine.name,
          isActive: routine.isActive,
          userIds: routine.userIds,
        });

        routine.sessions.forEach((session) => {
          const sessionGroup = this.addSession(session);
          session.exercises.forEach((ex) => {
            this.addExerciseToSession(sessionGroup, ex);
          });
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la rutina',
        });
        this.router.navigate(['/training/routines']);
      },
    });
  }

  // --- MÉTODOS DE FORMULARIO DINÁMICO ---

  addSession(data?: any): FormGroup {
    const session = this.routineFormService.createSessionGroup(data);

    // Si es una sesión nueva (creación manual), añadir un ejercicio por defecto para mejorar la UX
    if (!data) {
      // Pasamos true para indicar que viene de una sesión nueva y no queremos doble scroll
      this.addExerciseToSession(session, undefined, true);
      const sessionIndex = this.sessions.length; // Será el próximo índice tras el push
      this.scrollToSession(sessionIndex);
    }

    this.sessions.push(session);
    return session;
  }

  private scrollToSession(index: number) {
    setTimeout(() => {
      const elementId = `session-${index}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Resaltar la cabecera (primera capa de la card)
        const header = element.querySelector('.p-card-header div');
        if (header) {
          header.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
          setTimeout(() => header.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50'), 2000);
        }
      }
    }, 100);
  }

  removeSession(index: number) {
    this.sessions.removeAt(index);
  }

  getExercises(sessionIndex: number) {
    return this.sessions.at(sessionIndex).get('exercises') as FormArray;
  }

  addExerciseToSession(session: FormGroup, data?: any, skipScroll = false) {
    const exercises = session.get('exercises') as FormArray;
    const exerciseGroup = this.routineFormService.createExerciseGroup(data);

    // Si tiene datos de sets, cargarlos. Si no, añadir un set por defecto.
    if (data?.sets && data.sets.length > 0) {
      data.sets.forEach((s: any) => this.addSetToExercise(exerciseGroup, s));
    } else {
      this.addSetToExercise(exerciseGroup);
    }

    exercises.push(exerciseGroup);

    // Escuchar cambios en muscleGroup para cargar ejercicios
    exerciseGroup.get('muscleGroup')?.valueChanges.subscribe((group) => {
      if (group) this.loadExercisesByGroup(group);
    });

    // Scroll al nuevo ejercicio si es una creación manual y no se ha pedido omitirlo
    if (!data && !skipScroll) {
      const sessionIndex = this.sessions.controls.indexOf(session);
      const exerciseIndex = exercises.length - 1;
      this.scrollToExercise(sessionIndex, exerciseIndex);
    }
  }

  private scrollToExercise(sessionIndex: number, exerciseIndex: number) {
    setTimeout(() => {
      const elementId = `exercise-${sessionIndex}-${exerciseIndex}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Efecto visual momentáneo
        element.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
        setTimeout(() => element.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50'), 1500);
      }
    }, 100);
  }

  removeExerciseFromSession(sessionIndex: number, exerciseIndex: number) {
    this.getExercises(sessionIndex).removeAt(exerciseIndex);
  }

  getSets(exercise: FormGroup) {
    return exercise.get('sets') as FormArray;
  }

  addSetToExercise(exercise: FormGroup, data?: any) {
    const sets = exercise.get('sets') as FormArray;
    sets.push(this.routineFormService.createSetGroup(data));
  }

  removeSetFromExercise(exercise: FormGroup, setIndex: number) {
    this.getSets(exercise).removeAt(setIndex);
  }

  removeLastSet(exercise: FormGroup) {
    const sets = this.getSets(exercise);
    if (sets.length > 1) {
      sets.removeAt(sets.length - 1);
    }
  }

  // --- LÓGICA DE NEGOCIO ---

  loadExercisesByGroup(group: string) {
    if (this.exercisesByGroup()[group]) return;

    this.exerciseService.findAll(group).subscribe((data) => {
      this.exercisesByGroup.update((prev) => ({ ...prev, [group]: data }));
    });
  }

  loadUsers() {
    this.userService.findAll().subscribe((users) => {
      this.users.set(users);
    });
  }

  getExercisesForGroup(group: string) {
    return this.exercisesByGroup()[group] || [];
  }

  save() {
    if (this.routineForm.invalid) {
      this.routineForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Revisa los campos obligatorios',
      });
      return;
    }

    this.saving.set(true);
    const payload = this.routineForm.value;

    if (this.isEditing() && this.routineId()) {
      this.routineService.update(this.routineId()!, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Rutina guardada correctamente',
          });
          setTimeout(() => this.router.navigate(['/training/routines']), 1500);
        },
        error: () => this.handleError(),
      });
    } else {
      this.routineService.create(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Rutina creada correctamente',
          });
          setTimeout(() => this.router.navigate(['/training/routines']), 1500);
        },
        error: () => this.handleError(),
      });
    }
  }

  private handleError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al conectar con el servidor',
    });
    this.saving.set(false);
  }

  goBack() {
    this.router.navigate(['/training/routines']);
  }
}
