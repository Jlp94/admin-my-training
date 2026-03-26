import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IDiet, Diet } from '../domain/diet.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DietService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/diets`;

  findAll(): Observable<Diet[]> {
    return this.http.get<ApiResponse<IDiet[]>>(this.base).pipe(
      map(res => res.data.map(d => new Diet(d)))
    );
  }

  findOne(id: string): Observable<Diet> {
    return this.http.get<ApiResponse<IDiet>>(`${this.base}/${id}`).pipe(
      map(res => new Diet(res.data))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
