import { UserInterface, UserProfileInterface, UserMacrosInterface, UserNeatInterface, WorkoutLogInterface, DietLogInterface } from './user.interface';

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

  get getProfile(): UserProfileInterface {
    return this.profile;
  }

  // ── GETTERS (Propiedades del Perfil) ──
  get getName(): string {
    return this.profile?.name ?? '';
  }

  get getAvatarUrl(): string | undefined {
    return this.profile?.avatarUrl;
  }

  get getHeight(): number | undefined {
    return this.profile?.height;
  }

  get getWeight(): number | undefined {
    return this.profile?.weight;
  }

  get getCardioKcalGoal(): number {
    return this.profile?.cardioKcalGoal ?? 0;
  }

  get getCurrentDietId(): string | undefined {
    return this.profile?.currentDietId;
  }

  get getCurrentRoutineId(): string | undefined {
    return this.profile?.currentRoutineId;
  }

  get getMacros(): UserMacrosInterface | undefined {
    return this.profile?.macros;
  }

  // Getters específicos de Macros
  get getTargetKcal(): number {
    return this.profile?.macros?.targetKcal ?? 0;
  }

  get getExtraKcal(): number {
    return this.profile?.macros?.extraKcal ?? 0;
  }

  get getProtein(): number {
    return this.profile?.macros?.protein ?? 0;
  }

  get getCarbs(): number {
    return this.profile?.macros?.carbs ?? 0;
  }

  get getFat(): number {
    return this.profile?.macros?.fat ?? 0;
  }

  // Getters de Logs
  get getWorkoutLogs(): WorkoutLogInterface[] {
    return this.profile?.workoutLogs ?? [];
  }

  get getNeatLogs(): UserNeatInterface[] {
    return this.profile?.neatLogs ?? [];
  }

  get getDietLogs(): DietLogInterface[] {
    return this.profile?.dietLogs ?? [];
  }

  set setIsActive(value: boolean) {
    this.isActive = value;
  }

  getFullName(): string {
    return `${this.profile?.name || ''} ${this.profile?.lastName || ''}`.trim() || 'Usuario sin nombre';
  }

  getInitials(): string {
    const name = this.profile?.name?.[0] || '';
    const last = this.profile?.lastName?.[0] || '';
    return (name + last).toUpperCase() || this.email[0].toUpperCase();
  }

  getLastWeight(): number | string {
    const lastLog = this.profile?.neatLogs?.at(-1);    
    return lastLog?.weight ?? '—';
  }

  static preparePayload(formVal: any, existingUser?: User): any {
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

      if (formVal.password && formVal.password.length >= 6) {
        payload.password = formVal.password;
      }

      return payload;
    }

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
}
