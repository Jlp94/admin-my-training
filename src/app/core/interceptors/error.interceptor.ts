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
        errorMessage = 'No se pudo conectar con el servidor. Es probable que esté "durmiendo" (Render Cold Start).';
        uiService.showInfo('Estamos despertando el servidor. Por favor, espera unos 30 segundos y recarga la página.', 'Servidor despertando');
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
