export enum EquipmentType {
  LIBRE = 'libre',
  MANCUERNAS = 'mancuernas',
  BARRA = 'barra',
  POLEA = 'polea',
  MAQUINA = 'máquina',
  MULTIPOWER = 'multipower',
  KETTLEBELL = 'kettlebell',
  DISCO = 'disco',
}

export enum MuscleGroup {
  CORE = 'core',
  PECTORAL = 'pectoral',
  ESPALDA = 'espalda',
  HOMBRO = 'hombro',
  CUADRICEPS = 'cuádriceps',
  FEMORAL = 'femoral',
  GLUTEO = 'glúteo',
  BICEPS = 'bíceps',
  TRICEPS = 'tríceps',
  GEMELO = 'gemelo',
  ANTEBRAZO = 'antebrazo',
}

export enum MovementType {
  PUSH = 'push',
  PULL = 'pull',
  LEG = 'leg',
}

export interface Exercise {
  _id: string;
  name: string;
  movementTypes: MovementType[];
  categories: MuscleGroup[];
  equipment: EquipmentType;
  description: string;
  tags?: string[];
  videoUrl?: string;
  createdAt?: string;
}
