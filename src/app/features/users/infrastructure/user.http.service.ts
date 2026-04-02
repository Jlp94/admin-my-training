import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../domain/user.model';
import { UserInterface } from '../domain/user.interface';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UserHttpService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  findAll(): Observable<User[]> {
    return this.http.get<ApiResponse<UserInterface[]>>(this.base).pipe(
      map(response => response.data.map((u: UserInterface) => new User(u)))
    );
  }

  findOne(id: string): Observable<User> {
    return this.http.get<ApiResponse<UserInterface>>(`${this.base}/${id}`).pipe(
      map(response => new User(response.data))
    );
  }

  create(payload: Partial<UserInterface>): Observable<User> {
    return this.http.post<ApiResponse<UserInterface>>(this.base, payload).pipe(
      map(response => new User(response.data))
    );
  }

  update(id: string, payload: Partial<UserInterface>): Observable<User> {
    return this.http.patch<ApiResponse<UserInterface>>(`${this.base}/${id}`, payload).pipe(
      map(response => new User(response.data))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
