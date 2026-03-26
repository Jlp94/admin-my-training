// Interfaz (capa de dominio — define la forma del dato)
export interface IUser {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  profile?: IUserProfile;
  createdAt: string;
}

export interface IUserProfile {
  name?: string;
  lastName?: string;
  avatarUrl?: string;
  currentDietId?: string;
}

// Clase de dominio (añade comportamiento/getters)
export class User implements IUser {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  profile?: IUserProfile;
  createdAt: string;

  constructor(data: IUser) {
    this._id = data._id;
    this.email = data.email;
    this.role = data.role;
    this.profile = data.profile;
    this.createdAt = data.createdAt;
  }

  get displayName(): string {
    if (this.profile?.name && this.profile?.lastName) {
      return `${this.profile.name} ${this.profile.lastName}`;
    }
    return this.email;
  }

  get initials(): string {
    const name = this.profile?.name?.[0] ?? '';
    const last = this.profile?.lastName?.[0] ?? '';
    return (name + last).toUpperCase() || this.email[0].toUpperCase();
  }
}
