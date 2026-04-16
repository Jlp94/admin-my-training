import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  private cache = new Map<string, HttpResponse<any>>();

  /**
   * Obtiene una respuesta cacheada
   */
  get(url: string): HttpResponse<any> | undefined {
    return this.cache.get(url);
  }

  /**
   * Almacena una respuesta en el caché
   */
  put(url: string, response: HttpResponse<any>): void {
    this.cache.set(url, response);
  }

  /**
   * Limpia todo el caché (utilizado tras POST/PUT/DELETE)
   */
  clear(): void {
    this.cache.clear();
  }
}
