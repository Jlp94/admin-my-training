import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { HttpCacheService } from '../services/http-cache.service';

/**
 * Interceptor encargado de cachear peticiones GET e invalidar el caché en escrituras.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(HttpCacheService);

  // 1. Si no es una petición GET, invalidamos todo el caché y dejamos pasar la petición
  if (req.method !== 'GET') {
    cacheService.clear();
    return next(req);
  }

  // 2. Intentamos recuperar la respuesta del caché
  const cachedResponse = cacheService.get(req.urlWithParams);
  if (cachedResponse) {
    // console.log(`[Cache Hit]: ${req.urlWithParams}`);
    return of(cachedResponse);
  }

  // 3. Si no está en caché, hacemos la petición y guardamos el resultado
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        // console.log(`[Cache Store]: ${req.urlWithParams}`);
        cacheService.put(req.urlWithParams, event);
      }
    })
  );
};
