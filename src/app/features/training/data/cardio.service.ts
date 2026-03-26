import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICardio, Cardio } from '../domain/cardio.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CardioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cardio`;

  findAll(): Observable<Cardio[]> {
    return this.http.get<ApiResponse<ICardio[]>>(this.base).pipe(
      map(res => res.data.map(c => new Cardio(c)))
    );
  }

  create(payload: Partial<ICardio>): Observable<Cardio> {
    return this.http.post<ApiResponse<ICardio>>(this.base, payload).pipe(
      map(res => new Cardio(res.data))
    );
  }

  update(id: string, payload: Partial<ICardio>): Observable<Cardio> {
    return this.http.patch<ApiResponse<ICardio>>(`${this.base}/${id}`, payload).pipe(
      map(res => new Cardio(res.data))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
