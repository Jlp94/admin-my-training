import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IRoutine, Routine } from '../domain/routine.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/routines`;

  findAll(): Observable<Routine[]> {
    return this.http.get<ApiResponse<IRoutine[]>>(this.base).pipe(
      map(res => res.data.map(r => new Routine(r)))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
