import { AbstractControl, FormArray } from '@angular/forms';

/**
 * Helper genérico para obtener un FormArray de un control padre
 */
export function getControlArray(parent: AbstractControl, path: string): FormArray {
  return parent.get(path) as FormArray;
}

/**
 * Elimina el último elemento de un FormArray respetando un mínimo de elementos
 */
export function removeLastItem(array: FormArray, minLength: number = 0): void {
  if (array.length > minLength) {
    array.removeAt(array.length - 1);
  }
}
