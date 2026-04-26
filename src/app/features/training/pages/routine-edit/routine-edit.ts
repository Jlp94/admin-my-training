import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
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
import { Exercise } from '../../domain/exercise.model';
import { User } from '../../../users/domain/user.model';
import { FloatLabelModule } from 'primeng/floatlabel';
import { UiService } from '../../../../shared/services/ui.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-routine-edit',
  imports: [
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
    RouterLink,
    SpinnerComponent
  ],
  providers: [MessageService],
  templateUrl: './routine-edit.html',
  styleUrl: './routine-edit.scss',
})
export class RoutineEdit implements OnInit {
  private readonly routineService = inject(RoutineService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly userService = inject(UserService);
  readonly routineFormService = inject(RoutineFormService);
  private readonly uiService = inject(UiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEditing = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly routineId = signal<string | null>(null);

  getCategoryOptions(sessionIndex: number) {
    const session = this.sessions.at(sessionIndex);
    const type = session.get('routineType')?.value;
    return this.routineFormService.getCategoryOptions(type);
  }

  readonly users = signal<User[]>([]);
  readonly clientOptions = computed(() =>
    this.users()
      .filter((u) => u.getRole === 'user')
      .map((u) => ({ label: u.getFullName(), value: u.getId })),
  );

  readonly exercisesByGroup = signal<Record<string, Exercise[]>>({});

  routineForm: FormGroup;

  constructor() {
    this.routineForm = this.routineFormService.initForm();
  }

  get sessions() {
    return this.routineFormService.getControlArray(this.routineForm, 'sessions');
  }

  ngOnInit() {
    this.loadUsers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.routineId.set(id);
      this.loadRoutine(id);
    } else {
      this.addSession();
    }
  }

  loadRoutine(id: string) {
    this.loading.set(true);
    this.routineService.findOne(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  addSession(data?: any): FormGroup {
    const session = this.routineFormService.createSessionGroup(data);

    if (!data) {
      this.addExerciseToSession(session, undefined, true);
      const sessionIndex = this.sessions.length; // Próximo índice
      this.uiService.scrollToAndHighlight(`session-${sessionIndex}`, { 
        block: 'start', 
        highlightSelector: '.p-card-header div',
        highlightDuration: 2000 
  });
    }

    this.sessions.push(session);
    return session;
  }

  removeSession(index: number) {
    this.sessions.removeAt(index);
  }

  getExercises(sessionIndex: number) {
    return this.routineFormService.getControlArray(this.sessions.at(sessionIndex), 'exercises');
  }

  addExerciseToSession(session: FormGroup, data?: any, skipScroll = false) {
    const exercises = session.get('exercises') as FormArray;
    const exerciseGroup = this.routineFormService.createExerciseGroup(data);

    if (data?.sets && data.sets.length > 0) {
      data.sets.forEach((s: any) => this.addSetToExercise(exerciseGroup, s));
    } else {
      this.addSetToExercise(exerciseGroup);
    }

    exercises.push(exerciseGroup);

    exerciseGroup.get('muscleGroup')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((group) => {
      if (group) this.loadExercisesByGroup(group);
    });

    if (!data && !skipScroll) {
      const sessionIndex = this.sessions.controls.indexOf(session);
      const exerciseIndex = exercises.length - 1;
      this.uiService.scrollToAndHighlight(`exercise-${sessionIndex}-${exerciseIndex}`);
    }
  }

  removeExerciseFromSession(sessionIndex: number, exerciseIndex: number) {
    this.getExercises(sessionIndex).removeAt(exerciseIndex);
  }

  getSets(exercise: FormGroup) {
    return this.routineFormService.getControlArray(exercise, 'sets');
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
    this.routineFormService.removeLastItem(sets);
  }

  loadExercisesByGroup(group: string) {
    if (this.exercisesByGroup()[group]) return;

    this.exerciseService.findAll(group)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
      this.exercisesByGroup.update((prev) => ({ ...prev, [group]: data }));
    });
  }

  loadUsers() {
    this.userService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
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
    const raw = this.routineForm.value;
    const payload = {
      ...raw,
      sessions: raw.sessions.map((s: any) => ({
        ...s,
        exercises: s.exercises.map((ex: any) => {
          const { muscleGroup, ...rest } = ex;
          return rest;
        })
      }))
    };

    if (this.isEditing() && this.routineId()) {
      this.routineService.update(this.routineId()!, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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
      this.routineService.create(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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
}
