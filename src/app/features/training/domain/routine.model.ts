export enum DayOfWeek {
  DOMINGO = 0,
  LUNES = 1,
  MARTES = 2,
  MIERCOLES = 3,
  JUEVES = 4,
  VIERNES = 5,
  SABADO = 6,
}

export enum ExecutionMode {
  NORMAL = 'normal',
  SUPER_SET = 'superset',
  REST_PAUSE = 'restpause',
  DROP_SET = 'dropset',
}

export interface Tempo {
  eccentric: number;
  isometric: number;
  concentric: number;
}

export interface ExerciseSet {
  kg: number;
  reps: number;
  rir: number;
}

export interface RoutineExercise {
  exerciseId: string;
  name?: string; // Enriquecido desde el backend
  categories?: string[]; // Enriquecido desde el backend
  rest: number;
  executionType: ExecutionMode;
  observations?: string;
  restPauseSeconds?: number;
  idExSuperSet?: string;
  tempo: Tempo;
  sets: ExerciseSet[];
}

export interface RoutineSession {
  routineType: string;
  category: string;
  routineDayOfWeek: DayOfWeek;
  observations?: string;
  exercises: RoutineExercise[];
}

export interface Routine {
  _id: string;
  userIds: string[];
  name: string;
  isActive: boolean;
  sessions: RoutineSession[];
  createdAt: string;
  updatedAt: string;
}
