import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
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
