import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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

import { DietService } from '../../data/diet.service';
import { FoodService } from '../../data/food.service';
import { UserService } from '../../../users/data/user.service';
import { DietFormService } from '../../data/diet-form.service';
import { DietCalculatorService } from '../../data/diet-calculator.service';
import { Food } from '../../domain/food.model';
import { User } from '../../../users/domain/user.model';
import { UiService } from '../../../../shared/services/ui.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-diet-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule, InputTextModule, TextareaModule, InputNumberModule,
    SelectModule, CardModule, AccordionModule,
    ToastModule, TooltipModule, RouterLink,
    SpinnerComponent
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
  private readonly destroyRef = inject(DestroyRef);

  readonly dietId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  
  readonly foods = signal<Food[]>([]);
  readonly users = signal<User[]>([]);
  
  readonly dietForm: FormGroup = this.dietFormService.initForm();

  readonly isEditing = computed(() => !!this.dietId());
  
  private readonly formTotals = signal({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  readonly totals = this.formTotals.asReadonly();

  readonly selectedUserMacros = signal<any>(null);

  private setupUserMacrosListener() {
    this.dietForm.get('userId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(userId => {
        if (!userId) { this.selectedUserMacros.set(null); return; }
        const user = this.users().find(u => u.getId === userId);
        const macros = user?.getMacros;
        this.selectedUserMacros.set(macros?.targetKcal ? macros : null);
      });
  }

  get meals() { return this.dietFormService.getControlArray(this.dietForm, 'meals'); }

  getFoodName(id: string): string {
    return this.foods().find(f => f._id === id)?.name || 'Alimento';
  }

  ngOnInit() {
    this.loadInitialData();
    this.handleRouteParams();
    this.listenToFormChanges();
    this.setupUserMacrosListener();
  }

  private handleRouteParams() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (params['id']) {
          this.dietId.set(params['id']);
          this.loadDiet(params['id']);
        } else {
          if (this.meals.length === 0) this.addMeal();
        }
      });
  }

  private listenToFormChanges() {
    this.dietForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.calculateTotals();
      });
  }

  private loadInitialData() {
    this.foodService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(foods => this.foods.set(foods));
      
    this.userService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(users => {
      this.users.set(users.filter(u => u.getRole === 'user'));
    });
  }

  private loadDiet(id: string) {
    this.loading.set(true);
    this.dietService.findOne(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (diet) => {
        this.dietForm.patchValue({
          userId: diet.userId,
          name: diet.name,
          isActive: diet.isActive,
          notes: diet.notes,
          extraKcal: diet.extraKcal || 0
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

  removeLastFoodFromMeal(mealIndex: number) {
    const foods = this.getFoods(mealIndex);
    if (foods.length > 0) {
      foods.removeAt(foods.length - 1);
    }
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
    const extraKcal = formValue.extraKcal || 0;

    this.formTotals.set({
      kcal: totals.kcal + extraKcal,
      protein: totals.protein || 0,
      carbs: totals.carbs || 0,
      fat: totals.fat || 0
    });
    
    // Actualizar campos sin disparar bucle infinito (emitEvent: false)
    this.dietForm.get('totalKcal')?.setValue(totals.kcal + extraKcal, { emitEvent: false });
    this.dietForm.get('totalMacros')?.patchValue(totals, { emitEvent: false });
  }

  // --- PERSISTENCIA ---

  save() {
    if (this.dietForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, rellena todos los campos obligatorios' });
      return;
    }

    this.saving.set(true);
    const raw = this.dietForm.getRawValue();
    const dietData = {
      ...raw,
      meals: raw.meals.map((m: any) => ({
        ...m,
        foods: m.foods.map((f: any) => {
          const { nutritionalType, ...rest } = f;
          return rest;
        })
      }))
    };
    
    const obs = this.dietId() 
      ? this.dietService.update(this.dietId()!, dietData)
      : this.dietService.create(dietData);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
}
