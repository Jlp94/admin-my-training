export interface MealFood {
  foodId: string;
  quantity: number; // en gramos o unidades
}

export interface Meal {
  name: string;
  foods: MealFood[];
}

export interface DietMacros {
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Diet {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  meals: Meal[];
  extraKcal?: number;
  totalKcal: number;
  totalMacros?: DietMacros;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
