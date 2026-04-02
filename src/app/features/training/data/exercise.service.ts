import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Exercise } from '../domain/exercise.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/exercises`;

  findAll(category?: string): Observable<Exercise[]> {
    let url = this.base;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    return this.http.get<ApiResponse<Exercise[]>>(url).pipe(
      map(res => res.data)
    );
  }

  create(payload: Partial<Exercise>): Observable<Exercise> {
    return this.http.post<ApiResponse<Exercise>>(this.base, payload).pipe(
      map(res => res.data)
    );
  }

  update(id: string, payload: Partial<Exercise>): Observable<Exercise> {
    return this.http.patch<ApiResponse<Exercise>>(`${this.base}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
