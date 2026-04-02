export enum CardioType {
  CINTA = 'cinta',
  ELIPTICA = 'elíptica',
  BICI = 'bici',
  ESCALERAS = 'escaleras',
  REMO = 'remo',
  TABATA = 'tábata',
  HIIT = 'HIIT',
}

export interface CardioInstruction {
  label: string;
  valor: string;
}

export interface Cardio {
  _id: string;
  type: string;
  label: string;
  kcalMin: number;
  instrucciones: CardioInstruction[];
  createdAt?: string;
  updatedAt?: string;
}
