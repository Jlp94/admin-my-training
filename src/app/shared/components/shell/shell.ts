import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;      // PrimeIcon or FontAwesome class
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule, AvatarModule],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);
  
  readonly currentYear = new Date().getFullYear();
  readonly collapsed = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', route: '/dashboard', exact: true },
    { label: 'Usuarios', icon: 'fa-solid fa-users', route: '/users', exact: true },
    { label: 'Alimentos', icon: 'fa-solid fa-carrot', route: '/diet/foods', exact: true },
    { label: 'Dietas', icon: 'fa-solid fa-utensils', route: '/diet', exact: true },
    { label: 'Ejercicios', icon: 'fa-solid fa-dumbbell', route: '/training/exercises', exact: true },
    { label: 'Cardio', icon: 'fa-solid fa-heart-pulse', route: '/training/cardio', exact: true },
    { label: 'Rutinas', icon: 'fa-solid fa-copy', route: '/training/routines', exact: true },
  ];

  toggleSidebar() {
    this.collapsed.update(c => !c);
  }

  logout() {
    this.auth.logout();
  }
}
