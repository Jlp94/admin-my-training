import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Food, FoodGroup, NutritionalType } from '../../domain/food.model';
import { FoodService } from '../../data/food.service';
import { UiService } from '../../../../shared/services/ui.service';

@Component({
  selector: 'app-food-list',
  imports: [
    ReactiveFormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule,
    SelectModule, TagModule, TooltipModule
  ],
  providers: [],
  templateUrl: './food-list.html'
})
export class FoodList {
  private readonly foodService = inject(FoodService);
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly foodsResource = rxResource({
    stream: () => this.foodService.findAll()
  });

  protected readonly foods = computed(() => this.foodsResource.value() ?? []);
  protected readonly loading = this.foodsResource.isLoading;
  
  protected readonly showDialog = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly saving = signal(false);

  protected foodForm: FormGroup;
  protected currentFoodId?: string;

  protected readonly categoryOptions = Object.values(FoodGroup).map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }));
  protected readonly typeOptions = Object.values(NutritionalType).map(t => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

  constructor() {
    this.foodForm = this.fb.group({
      name: ['', Validators.required],
      brand: [''],
      category: [null, Validators.required],
      nutritionalType: [null, Validators.required],
      carbs: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      fat: [0, [Validators.required, Validators.min(0)]],
      kcal: [0, [Validators.required, Validators.min(0)]],
    });
  }

  loadFoods() {
    this.foodsResource.reload();
  }

  openNew() {
    this.currentFoodId = undefined;
    this.isEditing.set(false);
    this.foodForm.reset({ carbs: 0, protein: 0, fat: 0, kcal: 0 });
    this.showDialog.set(true);
  }

  editFood(food: Food) {
    this.currentFoodId = food._id;
    this.isEditing.set(true);
    
    this.foodForm.patchValue({
      name: food.name,
      brand: food.brand,
      category: food.category,
      nutritionalType: food.nutritionalType,
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat,
      kcal: food.kcal
    });
    
    this.showDialog.set(true);
  }

  saveFood() {
    if (this.foodForm.invalid) {
      this.foodForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.foodForm.value;

    const op = this.isEditing() && this.currentFoodId
      ? this.foodService.update(this.currentFoodId, payload)
      : this.foodService.create(payload);

    op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.uiService.showSuccess('Operación completada con éxito');
        this.loadFoods();
        this.closeDialog();
      },
      error: () => this.handleError()
    });
  }

  deleteFood(food: Food) {
    this.uiService.confirmDelete(food.name, () => {
      this.foodService.remove(food._id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.uiService.showSuccess('Alimento eliminado');
              this.loadFoods();
            },
            error: () => this.uiService.showError('No se pudo eliminar el alimento')
          });
    });
  }

  closeDialog() {
    this.showDialog.set(false);
    this.saving.set(false);
  }

  private handleError() {
    this.uiService.showError('El alimento ya existe o hay un error de red');
    this.saving.set(false);
  }
}
