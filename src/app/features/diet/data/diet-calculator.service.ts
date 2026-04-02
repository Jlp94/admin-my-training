import { Injectable } from '@angular/core';
import { Food } from '../domain/food.model';
import { Meal, DietMacros } from '../domain/diet.model';

@Injectable({ providedIn: 'root' })
export class DietCalculatorService {
  /**
   * Calcula las calorías y macros de una cantidad específica de un alimento
   * Los valores en el modelo Food suelen ser por cada 100g
   */
  calculateNutrients(food: Food, quantity: number): DietMacros & { kcal: number } {
    const factor = quantity / 100;
    return {
      kcal: Number((food.kcal * factor).toFixed(2)),
      protein: Number((food.protein * factor).toFixed(2)),
      carbs: Number((food.carbs * factor).toFixed(2)),
      fat: Number((food.fat * factor).toFixed(2))
    };
  }

  /**
   * Calcula los totales de una comida basándose en la lista de alimentos cargados
   */
  calculateMealTotals(mealFoods: { food: Food, quantity: number }[]): DietMacros & { kcal: number } {
    return mealFoods.reduce((acc, item) => {
      const nutrients = this.calculateNutrients(item.food, item.quantity);
      return {
        kcal: Number((acc.kcal + nutrients.kcal).toFixed(2)),
        protein: Number((acc.protein + (nutrients.protein || 0)).toFixed(2)),
        carbs: Number((acc.carbs + (nutrients.carbs || 0)).toFixed(2)),
        fat: Number((acc.fat + (nutrients.fat || 0)).toFixed(2))
      };
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  }

  /**
   * Calcula los totales globales de la dieta
   */
  calculateDietTotals(mealsWithData: { foods: { food: Food, quantity: number }[] }[]): DietMacros & { kcal: number } {
    return mealsWithData.reduce((acc, meal) => {
      const mealTotals = this.calculateMealTotals(meal.foods);
      return {
        kcal: Number((acc.kcal + mealTotals.kcal).toFixed(2)),
        protein: Number((acc.protein + (mealTotals.protein || 0)).toFixed(2)),
        carbs: Number((acc.carbs + (mealTotals.carbs || 0)).toFixed(2)),
        fat: Number((acc.fat + (mealTotals.fat || 0)).toFixed(2))
      };
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  }
}
