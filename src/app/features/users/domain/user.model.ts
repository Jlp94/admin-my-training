import { UserInterface, UserProfileInterface } from './user.interface';

export class User {
  private _id: string;
  private email: string;
  private role: 'admin' | 'user';
  private isActive: boolean;
  private profile: UserProfileInterface;

  constructor(user: UserInterface) {
    this._id = user._id;
    this.email = user.email;
    this.role = user.role;
    this.isActive = user.isActive;
    this.profile = user.profile;
  }

  getFullName(): string {
    return `${this.profile?.name || ''} ${this.profile?.lastName || ''}`.trim() || 'Usuario sin nombre';
  }

  get getId(): string {
    return this._id;
  }

  get getEmail(): string {
    return this.email;
  }

  get getRole(): 'admin' | 'user' {
    return this.role;
  }

  get getIsActive(): boolean {
    return this.isActive;
  }

  set setIsActive(value: boolean) {
    this.isActive = value;
  }

  get getProfile(): UserProfileInterface {
    return this.profile;
  }

  /**
   * Genera el objeto de datos que se enviará a la API (payload).
   * Si hay un usuario existente (EDICIÓN), devuelve un objeto "plano" para el UpdateUserDto de la API.
   * Si el usuario es nuevo (CREACIÓN), devuelve un objeto anidado para el CreateUserDto de la API.
   */
  static preparePayload(formVal: any, existingUser?: User): any {
    // Si estamos editando (PATCH), la API espera campos planos
    if (existingUser) {
      const payload: any = {
        email: formVal.email,
        role: formVal.role,
        isActive: formVal.isActive,
        name: formVal.name,
        lastName: formVal.lastName,
        height: formVal.height,
        weight: formVal.weight
      };

      // Solo incluimos el password si se ha rellenado (mínimo 6 caracteres)
      if (formVal.password && formVal.password.length >= 6) {
        payload.password = formVal.password;
      }

      return payload;
    }

    // SI ES NUEVO (POST), la API espera estructura anidada en 'profile'
    const profileBase = {
      name: formVal.name,
      lastName: formVal.lastName,
      height: formVal.height,
      weight: formVal.weight,
      notifications: true, 
      neatLogs: [], 
      workoutLogs: [],
      dietLogs: [],
      favoriteFoods: []
    };

    return {
      email: formVal.email,
      password: formVal.password,
      role: formVal.role,
      isActive: formVal.isActive,
      profile: profileBase
    };
  }

  // Obtiene las iniciales del usuario para el avatar
  getInitials(): string {
    const name = this.profile?.name?.[0] || '';
    const last = this.profile?.lastName?.[0] || '';
    return (name + last).toUpperCase() || this.email[0].toUpperCase();
  }

  // Obtiene el último peso registrado del log NEAT
  getLastWeight(): number | string {
    const lastLog = this.profile?.neatLogs?.at(-1);    
    return lastLog?.weight ?? '—';
  }
}
