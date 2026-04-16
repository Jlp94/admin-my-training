import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiService } from '../../shared/services/ui.service';

/**
 * Interceptor para capturar errores HTTP de forma global y mostrar notificaciones al usuario.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const uiService = inject(UiService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      // Status 0: El servidor no está arrancado o hay problemas de red (CORS, DNS, etc.)
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica que el backend esté en ejecución.';
        uiService.showError(errorMessage, 'Conexión Fallida');
      } 
      // Errores de servidor (500, 503, etc.)
      else if (error.status >= 500) {
        errorMessage = 'El servidor ha experimentado un error interno. Inténtalo de nuevo más tarde.';
        uiService.showError(errorMessage, 'Error de Servidor');
      }
      // Otros errores (400, 404, etc.) que no sean 401 (que ya maneja el AuthInterceptor)
      else if (error.status !== 401) {
        errorMessage = error.error?.message || error.message || errorMessage;
        // Solo mostramos error si no es una excepción controlada que ya maneja el componente
        // uiService.showError(errorMessage); 
      }

      console.error(`[HTTP Error ${error.status}]:`, error);
      
      return throwError(() => error);
    })
  );
};
