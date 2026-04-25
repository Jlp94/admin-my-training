import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiService } from '../../shared/services/ui.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const uiService = inject(UiService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica que el backend esté en ejecución.';
        uiService.showError(errorMessage, 'Conexión Fallida');
      } 
      else if (error.status >= 500) {
        errorMessage = 'El servidor ha experimentado un error interno. Inténtalo de nuevo más tarde.';
        uiService.showError(errorMessage, 'Error de Servidor');
      }
      else if (error.status !== 401) {
        errorMessage = error.error?.message || error.message || errorMessage;
      }

      console.error(`[HTTP Error ${error.status}]:`, error);
      
      return throwError(() => error);
    })
  );
};
