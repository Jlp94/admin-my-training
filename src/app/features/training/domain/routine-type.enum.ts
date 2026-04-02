export enum RoutineType {
  FULLBODY = 'FullBody',
  TORSO_PIERNA = 'Torso-Pierna',
  PUSH_PULL_LEG = 'Push-Pull-Leg',
  WEIDER = 'Weider'
}

export const RoutineTypeOptions = Object.entries(RoutineType).map(([key, value]) => ({
  label: value,
  value: value
}));
