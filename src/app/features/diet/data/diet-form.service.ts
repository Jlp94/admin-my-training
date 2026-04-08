import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Diet } from '../domain/diet.model';
import { NutritionalType } from '../domain/food.model';
import { getControlArray, removeLastItem } from '../../../shared/utils/form.utils';

@Injectable({ providedIn: 'root' })
export class DietFormService {
  private readonly fb = inject(FormBuilder);

  // Categorías nutricionales para los selectores
  readonly nutritionalTypes = Object.values(NutritionalType);

  /**
   * Inicializa el formulario principal de una dieta
   */
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

  /**
   * Crea un grupo de comida (Meal)
   */
  createMealGroup(data?: any): FormGroup {
    return this.fb.group({
      name: [data?.name || '', Validators.required],
      foods: this.fb.array([])
    });
  }

  /**
   * Crea un grupo de alimento dentro de una comida (MealFood)
   */
  createFoodGroup(data?: any): FormGroup {
    return this.fb.group({
      nutritionalType: [data?.nutritionalType || ''], // Campo para filtrar
      foodId: [data?.foodId || '', Validators.required],
      quantity: [data?.quantity || 100, [Validators.required, Validators.min(1)]]
    });
  }

  /** Delegación a shared/utils/form.utils */
  getControlArray(parent: AbstractControl, path: string): FormArray {
    return getControlArray(parent, path);
  }

  /** Delegación a shared/utils/form.utils */
  removeLastItem(array: FormArray, minLength: number = 0): void {
    removeLastItem(array, minLength);
  }
}

