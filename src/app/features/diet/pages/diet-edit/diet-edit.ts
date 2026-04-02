import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';

// Services & Models
import { DietService } from '../../data/diet.service';
import { FoodService } from '../../data/food.service';
import { UserService } from '../../../users/data/user.service';
import { DietFormService } from '../../data/diet-form.service';
import { DietCalculatorService } from '../../data/diet-calculator.service';
import { Food } from '../../domain/food.model';
import { User } from '../../../users/domain/user.model';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-diet-edit',
  imports: [
    ReactiveFormsModule,
    ButtonModule, InputTextModule, TextareaModule, InputNumberModule,
    SelectModule, CardModule, AccordionModule,
    ToastModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './diet-edit.html',
  styleUrl: './diet-edit.scss'
})
export class DietEdit implements OnInit {
  private readonly dietService = inject(DietService);
  private readonly foodService = inject(FoodService);
  private readonly userService = inject(UserService);
  readonly dietFormService = inject(DietFormService);
  private readonly calculatorService = inject(DietCalculatorService);
  private readonly uiService = inject(UiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // States
  readonly dietId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  
  // Data Lists
  readonly foods = signal<Food[]>([]);
  readonly users = signal<User[]>([]);
  
  // Form
  readonly dietForm: FormGroup = this.dietFormService.initForm();

  // Computeds
  readonly isEditing = computed(() => !!this.dietId());
  
  private readonly formTotals = signal({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  readonly totals = this.formTotals.asReadonly();

  // Getters
  get meals() { return this.dietFormService.getControlArray(this.dietForm, 'meals'); }

  getFoodName(id: string): string {
    return this.foods().find(f => f._id === id)?.name || 'Alimento';
  }

  ngOnInit() {
    this.loadInitialData();
    
    // Observar ID de ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.dietId.set(params['id']);
        this.loadDiet(params['id']);
      } else {
        // Nueva dieta: empezar con una comida por defecto
        if (this.meals.length === 0) this.addMeal();
      }
    });

    // Suscribirse a cambios para recalcular macros/kcal
    this.dietForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  private loadInitialData() {
    this.foodService.findAll().subscribe(foods => this.foods.set(foods));
    this.userService.findAll().subscribe(users => {
      // Cliente (rol 'user')
      this.users.set(users.filter(u => u.getRole === 'user'));
    });
  }

  private loadDiet(id: string) {
    this.loading.set(true);
    this.dietService.findOne(id).subscribe({
      next: (diet) => {
        this.dietForm.patchValue({
          userId: diet.userId,
          name: diet.name,
          isActive: diet.isActive,
          notes: diet.notes
        });

        // Limpiar y cargar comidas
        this.meals.clear();
        diet.meals?.forEach((m, mIndex) => {
          this.addMeal(m);
          m.foods?.forEach(f => this.addFoodToMeal(mIndex, f));
        });

        this.loading.set(false);
        this.calculateTotals();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la dieta' });
        this.router.navigate(['/diet']);
      }
    });
  }

  // --- GESTIÓN DE FORMULARIO ---

  addMeal(data?: any): FormGroup {
    const meal = this.dietFormService.createMealGroup(data);
    this.meals.push(meal);
    
    if (!data) {
      const index = this.meals.length - 1;
      this.uiService.scrollToAndHighlight(`meal-${index}`, { block: 'start' });
    }
    return meal;
  }

  removeMeal(index: number) {
    this.meals.removeAt(index);
  }

  getFoods(mealIndex: number) {
    return this.dietFormService.getControlArray(this.meals.at(mealIndex), 'foods');
  }

  getFoodsByType(type: string): Food[] {
    if (!type) return [];
    return this.foods().filter(f => f.nutritionalType === type).sort((a, b) => a.name.localeCompare(b.name));
  }

  addFoodToMeal(mealIndex: number, data?: any) {
    const meal = this.meals.at(mealIndex) as FormGroup;
    const foodsArray = this.dietFormService.getControlArray(meal, 'foods');

    // Si cargamos una dieta existente, intentamos inferir el nutritionalType del alimento
    let nutritionalType = data?.nutritionalType || '';
    if (data?.foodId && !nutritionalType) {
      const food = this.foods().find(f => f._id === data.foodId);
      if (food) nutritionalType = food.nutritionalType;
    }

    const foodGroup = this.dietFormService.createFoodGroup({ ...data, nutritionalType });
    foodsArray.push(foodGroup);
  }

  getFoodMetrics(foodId: string, quantity: number) {
    if (!foodId || !quantity) return null;
    const food = this.foods().find(f => f._id === foodId);
    if (!food) return null;
    return this.calculatorService.calculateNutrients(food, quantity);
  }

  removeFoodFromMeal(mealIndex: number, foodIndex: number) {
    this.getFoods(mealIndex).removeAt(foodIndex);
  }

  // --- CÁLCULOS ---

  private calculateTotals() {
    const formValue = this.dietForm.getRawValue();
    const mealsWithData = formValue.meals.map((m: any) => ({
      foods: m.foods.map((mf: any) => {
        const foodData = this.foods().find(f => f._id === mf.foodId);
        return { food: foodData, quantity: mf.quantity };
      }).filter((mf: any) => !!mf.food)
    }));

    const totals = this.calculatorService.calculateDietTotals(mealsWithData);
    this.formTotals.set({
      kcal: totals.kcal,
      protein: totals.protein || 0,
      carbs: totals.carbs || 0,
      fat: totals.fat || 0
    });
    
    // Actualizar campos sin disparar bucle infinito (emitEvent: false)
    this.dietForm.get('totalKcal')?.setValue(totals.kcal, { emitEvent: false });
    this.dietForm.get('totalMacros')?.patchValue(totals, { emitEvent: false });
  }

  // --- PERSISTENCIA ---

  save() {
    if (this.dietForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, rellena todos los campos obligatorios' });
      return;
    }

    this.saving.set(true);
    const dietData = this.dietForm.getRawValue();
    
    const obs = this.dietId() 
      ? this.dietService.update(this.dietId()!, dietData)
      : this.dietService.create(dietData);

    obs.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dieta guardada correctamente' });
        setTimeout(() => this.router.navigate(['/diet']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la dieta' });
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/diet']);
  }
}
