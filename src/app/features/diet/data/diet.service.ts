import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Diet } from '../domain/diet.model';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DietService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/diets`;

  findAll(): Observable<Diet[]> {
    return this.http.get<ApiResponse<Diet[]>>(this.base).pipe(
      map(response => response.data)
    );
  }

  findOne(id: string): Observable<Diet> {
    return this.http.get<ApiResponse<Diet>>(`${this.base}/${id}`).pipe(
      map(response => response.data)
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  create(diet: Partial<Diet>): Observable<Diet> {
    return this.http.post<ApiResponse<Diet>>(this.base, diet).pipe(
      map(response => response.data)
    );
  }

  update(id: string, diet: Partial<Diet>): Observable<Diet> {
    return this.http.patch<ApiResponse<Diet>>(`${this.base}/${id}`, diet).pipe(
      map(response => response.data)
    );
  }
}
