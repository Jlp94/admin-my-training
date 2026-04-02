import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { FoodService } from '../../data/food.service';
import { Food, FoodGroup, NutritionalType } from '../../domain/food.model';

@Component({
  selector: 'app-food-list',
  imports: [
    ReactiveFormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule,
    SelectModule, ToastModule, ConfirmDialogModule, TagModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './food-list.html'
})
export class FoodList implements OnInit {
  private readonly foodService = inject(FoodService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly foods = signal<Food[]>([]);
  readonly loading = signal(false);
  
  readonly showDialog = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);

  foodForm: FormGroup;
  currentFoodId?: string;

  readonly categoryOptions = Object.values(FoodGroup).map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }));
  readonly typeOptions = Object.values(NutritionalType).map(t => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }));

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

  ngOnInit() {
    this.loadFoods();
  }

  loadFoods() {
    this.loading.set(true);
    this.foodService.findAll().subscribe({
      next: (data) => {
        this.foods.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los alimentos' });
        this.loading.set(false);
      }
    });
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

    if (this.isEditing() && this.currentFoodId) {
      this.foodService.update(this.currentFoodId, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimento actualizado' });
          this.loadFoods();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    } else {
      this.foodService.create(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimento creado' });
          this.loadFoods();
          this.closeDialog();
        },
        error: () => this.handleError()
      });
    }
  }

  deleteFood(food: Food) {
    this.confirmationService.confirm({
      message: `¿Eliminar "${food.name}" de la base de datos?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.foodService.remove(food._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alimento eliminado' });
            this.loadFoods();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }

  closeDialog() {
    this.showDialog.set(false);
    this.saving.set(false);
  }

  private handleError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El alimento ya existe o hay un error de red' });
    this.saving.set(false);
  }
}
