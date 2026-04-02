import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Routine } from '../domain/routine.model';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { UserInterface } from '../../users/domain/user.interface';
import { User } from '../../users/domain/user.model';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/routines`;

  findAll(userId?: string): Observable<Routine[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    
    return this.http.get<ApiResponse<Routine[]>>(this.base, { params }).pipe(
      map(response => response.data)
    );
  }

  findOne(id: string): Observable<Routine> {
    return this.http.get<ApiResponse<Routine>>(`${this.base}/${id}`).pipe(
      map(response => response.data)
    );
  }

  create(routine: Partial<Routine>): Observable<Routine> {
    return this.http.post<ApiResponse<Routine>>(this.base, routine).pipe(
      map(response => response.data)
    );
  }

  update(id: string, routine: Partial<Routine>): Observable<Routine> {
    return this.http.patch<ApiResponse<Routine>>(`${this.base}/${id}`, routine).pipe(
      map(response => response.data)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getAssignedUsers(id: string): Observable<UserInterface[]> {
    return this.http.get<ApiResponse<UserInterface[]>>(`${this.base}/${id}/users`).pipe(
      map(response => response.data)
    );
  }
}
