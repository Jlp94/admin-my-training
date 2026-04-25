import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Diet } from '../domain/diet.model';
import { NutritionalType } from '../domain/food.model';
import { getControlArray, removeLastItem } from '../../../shared/utils/form.utils';

@Injectable({ providedIn: 'root' })
export class DietFormService {
  private readonly fb = inject(FormBuilder);

  readonly nutritionalTypes = Object.values(NutritionalType);


  initForm(): FormGroup {
    return this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      isActive: [true],
      notes: [''],
      meals: this.fb.array([]),
      extraKcal: [0],
      totalKcal: [0],
      totalMacros: this.fb.group({
        protein: [0],
        carbs: [0],
        fat: [0]
      })
    });
  }

  
  createMealGroup(data?: any): FormGroup {
    return this.fb.group({
      name: [data?.name || '', Validators.required],
      foods: this.fb.array([])
    });
  }


  createFoodGroup(data?: any): FormGroup {
    return this.fb.group({
      nutritionalType: [data?.nutritionalType || ''], // Campo para filtrar
      foodId: [data?.foodId || '', Validators.required],
      quantity: [data?.quantity || 100, [Validators.required, Validators.min(1)]]
    });
  }


  getControlArray(parent: AbstractControl, path: string): FormArray {
    return getControlArray(parent, path);
  }
  removeLastItem(array: FormArray, minLength: number = 0): void {
    removeLastItem(array, minLength);
  }
}

