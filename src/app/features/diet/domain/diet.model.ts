export interface IDiet {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  totalKcal: number;
  notes?: string;
  createdAt: string;
}

export class Diet implements IDiet {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  totalKcal: number;
  notes?: string;
  createdAt: string;

  constructor(data: IDiet) {
    this._id = data._id;
    this.userId = data.userId;
    this.name = data.name;
    this.isActive = data.isActive;
    this.totalKcal = data.totalKcal;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
  }

  get statusLabel(): string {
    return this.isActive ? 'Activa' : 'Inactiva';
  }
}
