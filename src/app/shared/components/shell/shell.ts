import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
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
export class Shell implements OnInit {
  public readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly currentYear = new Date().getFullYear();
  readonly collapsed = signal(true);
  readonly currentUser = this.auth.currentUser;

  ngOnInit() {
    // Si al cargar el Shell no estamos autenticados (token inválido/expirado), fuera
    if (!this.auth.isAuthenticated()) {
      this.auth.logout();
    }
  }

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
