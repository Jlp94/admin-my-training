import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private isValidToken(): boolean {
    const t = localStorage.getItem('admin_token');
    return !!t && t !== 'undefined' && t !== 'null';
  }

  readonly isAuthenticated = signal(this.isValidToken());

  login(email: string, password: string) {
    return this.http.post<ApiResponse<{ access_token: string }>>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res.data && res.data.access_token) {
          localStorage.setItem('admin_token', res.data.access_token);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('admin_token');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isValidToken()) {
      localStorage.removeItem('admin_token');
      return null;
    }
    return localStorage.getItem('admin_token');
  }
}
