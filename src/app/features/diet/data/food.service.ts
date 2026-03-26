import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IFood, Food } from '../domain/food.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class FoodService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/foods`;

  findAll(): Observable<Food[]> {
    return this.http.get<ApiResponse<IFood[]>>(this.base).pipe(
      map(res => res.data.map(f => new Food(f)))
    );
  }

  create(payload: Partial<IFood>): Observable<Food> {
    return this.http.post<ApiResponse<IFood>>(this.base, payload).pipe(
      map(res => new Food(res.data))
    );
  }

  update(id: string, payload: Partial<IFood>): Observable<Food> {
    return this.http.patch<ApiResponse<IFood>>(`${this.base}/${id}`, payload).pipe(
      map(res => new Food(res.data))
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
