import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Food } from '../domain/food.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class FoodService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/foods`;

  findAll(): Observable<Food[]> {
    return this.http.get<ApiResponse<Food[]>>(this.base).pipe(
      map(response => response.data)
    );
  }

  create(payload: Partial<Food>): Observable<Food> {
    return this.http.post<ApiResponse<Food>>(this.base, payload).pipe(
      map(response => response.data)
    );
  }

  update(id: string, payload: Partial<Food>): Observable<Food> {
    return this.http.patch<ApiResponse<Food>>(`${this.base}/${id}`, payload).pipe(
      map(response => response.data)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
