import { AbstractControl, FormArray } from '@angular/forms';

export function getControlArray(parent: AbstractControl, path: string): FormArray {
  return parent.get(path) as FormArray;
}

export function removeLastItem(array: FormArray, minLength: number = 0): void {
  if (array.length > minLength) {
    array.removeAt(array.length - 1);
  }
}
