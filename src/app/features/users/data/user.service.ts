import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUser, User } from '../domain/user.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  findAll(): Observable<User[]> {
    return this.http.get<ApiResponse<IUser[]>>(this.base).pipe(
      map(res => res.data.map(u => new User(u)))
    );
  }

  findOne(id: string): Observable<User> {
    return this.http.get<ApiResponse<IUser>>(`${this.base}/${id}`).pipe(
      map(res => new User(res.data))
    );
  }

  update(id: string, payload: Partial<IUser>): Observable<User> {
    return this.http.patch<ApiResponse<IUser>>(`${this.base}/${id}`, payload).pipe(
      map(res => new User(res.data))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
