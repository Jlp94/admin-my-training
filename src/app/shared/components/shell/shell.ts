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
  readonly collapsed = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', route: '/dashboard' },
    { label: 'Usuarios', icon: 'fa-solid fa-users', route: '/users' },
    { label: 'Alimentos', icon: 'fa-solid fa-carrot', route: '/diet/foods' },
    { label: 'Dietas', icon: 'fa-solid fa-utensils', route: '/diet' },
    { label: 'Ejercicios', icon: 'fa-solid fa-dumbbell', route: '/training/exercises' },
    { label: 'Cardio', icon: 'fa-solid fa-heart-pulse', route: '/training/cardio' },
    { label: 'Rutinas', icon: 'fa-solid fa-copy', route: '/training/routines' },
  ];

  toggleSidebar() {
    this.collapsed.update(c => !c);
  }

  logout() {
    this.auth.logout();
  }
}
