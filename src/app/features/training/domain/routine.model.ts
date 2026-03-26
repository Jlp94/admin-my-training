export interface IRoutine {
  _id: string;
  userId: string;
  name: string;
  days: number;
  createdAt: string;
}

export class Routine implements IRoutine {
  _id: string;
  userId: string;
  name: string;
  days: number;
  createdAt: string;

  constructor(data: IRoutine) {
    this._id = data._id;
    this.userId = data.userId;
    this.name = data.name;
    this.days = data.days;
    this.createdAt = data.createdAt;
  }

  get daysLabel(): string {
    return `${this.days} día${this.days !== 1 ? 's' : ''}`;
  }
}
