import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { UserService } from '../../features/users/data/user.service';
import { User } from '../../features/users/domain/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private isValidToken(): boolean {
    const token = localStorage.getItem('admin_token');
    return !!token && token !== 'undefined' && token !== 'null';
  }

  readonly isAuthenticated = signal(this.isValidToken());
  readonly currentUserId = signal<string | null>(this.getUserIdFromToken());
  readonly currentUser = signal<User | null>(null);

  constructor() {
    if (this.isAuthenticated()) {
      this.loadUserProfile();
    }
  }

  private loadUserProfile() {
    const id = this.getUserIdFromToken();
    if (id) {
      this.userService.findOne(id).subscribe({
        next: (user) => this.currentUser.set(user),
        error: () => this.logout()
      });
    }
  }

  login(email: string, password: string) {
    return this.http.post<ApiResponse<{ access_token: string }>>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res.data && res.data.access_token) {
          localStorage.setItem('admin_token', res.data.access_token);
          this.isAuthenticated.set(true);
          const userId = this.getUserIdFromToken();
          this.currentUserId.set(userId);
          this.loadUserProfile();
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('admin_token');
    this.isAuthenticated.set(false);
    this.currentUserId.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isValidToken()) {
      localStorage.removeItem('admin_token');
      this.currentUserId.set(null);
      return null;
    }
    return localStorage.getItem('admin_token');
  }

  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('admin_token');
    if (!token || token === 'undefined') return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload._id || payload.sub || null;
    } catch (e) {
      return null;
    }
  }
}
