import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cardio } from '../domain/cardio.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CardioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cardio`;

  findAll(): Observable<Cardio[]> {
    return this.http.get<ApiResponse<Cardio[]>>(this.base).pipe(
      map(response => response.data)
    );
  }

  create(payload: Partial<Cardio>): Observable<Cardio> {
    return this.http.post<ApiResponse<Cardio>>(this.base, payload).pipe(
      map(response => response.data)
    );
  }

  update(id: string, payload: Partial<Cardio>): Observable<Cardio> {
    return this.http.patch<ApiResponse<Cardio>>(`${this.base}/${id}`, payload).pipe(
      map(response => response.data)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
