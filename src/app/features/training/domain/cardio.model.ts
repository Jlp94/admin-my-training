export enum CardioType {
  CINTA = 'cinta',
  ELIPTICA = 'elíptica',
  BICI = 'bici',
  ESCALERAS = 'escaleras',
  REMO = 'remo',
  TABATA = 'tábata',
  HIIT = 'HIIT',
}

export interface ICardioInstruction {
  label: string;
  valor: string;
}

export interface ICardio {
  _id: string;
  type: string;
  label: string;
  kcalMin: number;
  instrucciones: ICardioInstruction[];
  createdAt?: string;
  updatedAt?: string;
}

export class Cardio implements ICardio {
  _id: string;
  type: string;
  label: string;
  kcalMin: number;
  instrucciones: ICardioInstruction[];
  createdAt?: string;
  updatedAt?: string;

  constructor(data: ICardio) {
    this._id = data._id;
    this.type = data.type;
    this.label = data.label;
    this.kcalMin = data.kcalMin;
    this.instrucciones = data.instrucciones || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
