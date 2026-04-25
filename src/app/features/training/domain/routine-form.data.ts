import { DayOfWeek, ExecutionMode } from './routine.model';
import { MuscleGroup } from './exercise.model';
import { RoutineType, RoutineTypeOptions } from './routine-type.enum';

export const DAY_OPTIONS = [
  { label: 'Lunes', value: DayOfWeek.LUNES },
  { label: 'Martes', value: DayOfWeek.MARTES },
  { label: 'Miércoles', value: DayOfWeek.MIERCOLES },
  { label: 'Jueves', value: DayOfWeek.JUEVES },
  { label: 'Viernes', value: DayOfWeek.VIERNES },
  { label: 'Sábado', value: DayOfWeek.SABADO },
  { label: 'Domingo', value: DayOfWeek.DOMINGO },
];

export const EXECUTION_OPTIONS = [
  { label: 'Normal', value: ExecutionMode.NORMAL },
  { label: 'SuperSet', value: ExecutionMode.SUPER_SET },
  { label: 'Rest-Pause', value: ExecutionMode.REST_PAUSE },
  { label: 'Drop-Set', value: ExecutionMode.DROP_SET },
];

export const ROUTINE_TYPE_OPTIONS = RoutineTypeOptions;

export const MUSCLE_GROUPS = Object.values(MuscleGroup).map(m => ({ 
  label: m.toUpperCase(), 
  value: m 
}));

export function getCategoryOptions(type: RoutineType) {
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
