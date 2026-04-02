export enum FoodGroup {
  CARNES = 'carnes',
  PESCADOS = 'pescados',
  LACTEOS = 'lácteos',
  CEREALES = 'cereales',
  LEGUMBRES = 'legumbres',
  FRUTAS = 'frutas',
  VERDURAS = 'verduras',
  ACEITES = 'aceites',
  SUPLEMENTOS = 'suplementos',
  HUEVOS = 'huevos',
  FRUTOS_SECOS = 'frutos secos',
}

export enum NutritionalType {
  PROTEINA_MAGRA = 'proteína magra',
  PROTEINA_GRASA = 'proteína grasa',
  CARB_COMPLEJO = 'carbohidrato complejo',
  CARB_SIMPLE = 'carbohidrato simple',
  GRASA = 'grasa',
  VEGETAL_FIBRA = 'vegetal fibra',
}

export interface Food {
  _id: string;
  name: string;
  brand?: string;
  category: FoodGroup;
  nutritionalType: NutritionalType;
  carbs: number;
  protein: number;
  fat: number;
  kcal: number;
  createdAt?: string;
  updatedAt?: string;
}
