import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  /**
   * Diálogo de confirmación genérico altamente personalizable
   */
  confirmDialog(options: {
    header: string;
    message: string;
    icon?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptButtonStyleClass?: string;
    onAccept: () => void;
  }) {
    this.confirmationService.confirm({
      header: options.header,
      message: options.message,
      icon: options.icon || 'fa-solid fa-circle-question',
      acceptLabel: options.acceptLabel || 'Confirmar',
      rejectLabel: options.rejectLabel || 'Cancelar',
      acceptButtonStyleClass: options.acceptButtonStyleClass || 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: options.onAccept
    });
  }

  /**
   * Diálogo específico para eliminaciones (peligro)
   */
  confirmDelete(itemName: string, onAccept: () => void) {
    this.confirmDialog({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptLabel: 'Sí, Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      onAccept
    });
  }

  showSuccess(detail: string, summary: string = 'Éxito') {
    this.messageService.add({ severity: 'success', summary, detail, life: 3000 });
  }

  showError(detail: string, summary: string = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail, life: 5000 });
  }

  /**
   * Desplaza la vista a un elemento y aplica un efecto de resaltado temporal
   * @param elementId ID del elemento en el DOM
   * @param options Configuración de scroll y selector de resaltado
   */
  scrollToAndHighlight(
    elementId: string, 
    options: { 
      block?: ScrollLogicalPosition, 
      highlightSelector?: string, 
      highlightDuration?: number 
    } = {}
  ): void {
    const { 
      block = 'center', 
      highlightSelector = '', 
      highlightDuration = 1500 
    } = options;

    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (!element) return;

      // Realizar scroll
      element.scrollIntoView({ behavior: 'smooth', block });

      // Aplicar resaltado si se solicita
      const target = highlightSelector 
        ? element.querySelector(highlightSelector) as HTMLElement 
        : element;

      if (target) {
        this.applyHighlight(target, highlightDuration);
      }
    }, 100);
  }

  private applyHighlight(element: HTMLElement, duration: number): void {
    const classes = ['ring-2', 'ring-indigo-500', 'ring-opacity-50'];
    element.classList.add(...classes);
    setTimeout(() => element.classList.remove(...classes), duration);
  }
}
