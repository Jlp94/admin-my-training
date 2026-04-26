export interface UserInterface {
  _id: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  profile: UserProfileInterface;
}

export interface UserProfileInterface {
  name: string;
  lastName: string;
  year?: number;
  avatarUrl?: string;
  height?: number;
  weight?: number;
  notifications: boolean;
  macros?: UserMacrosInterface;
  neatLogs: UserNeatInterface[];
  currentRoutineId?: string;
  currentDietId?: string;
  cardioKcalGoal?: number;
  dietLogs?: DietLogInterface[];
  favoriteFoods?: string[];
  workoutLogs: WorkoutLogInterface[];
}

export interface UserMacrosInterface {
  targetKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  pProtein?: number;
  pCarbs?: number;
  pFat?: number;
  extraKcal?: number;
}

export interface UserNeatInterface {
  date: string;
  weight?: number;
  steps?: number;
}

export interface DietLogInterface {
  startDate: string;
  macros?: UserMacrosInterface;
  notes?: string;
}

export interface ExerciseLogInterface {
  exerciseId: string;
  name: string;
  target: string[];
  sets: { kg: number; reps: number; rir: number }[];
}

export interface WorkoutLogInterface {
  doneAt: string;
  routineId: string;
  notes?: string;
  exerciseLogs: ExerciseLogInterface[];
}
