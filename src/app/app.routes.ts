import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Shell } from './shared/components/shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/home/pages/dashboard/dashboard').then(m => m.Dashboard) },
      {
        path: 'users',
        children: [
          { path: '', loadComponent: () => import('./features/users/pages/user-list/user-list').then(m => m.UserList) },
          { path: ':id', loadComponent: () => import('./features/users/pages/user-detail/user-detail').then(m => m.UserDetail) }
        ]
      },
      {
        path: 'diet',
        children: [
          { path: '', loadComponent: () => import('./features/diet/pages/diet-list/diet-list').then(m => m.DietList) },
          { path: 'new', loadComponent: () => import('./features/diet/pages/diet-edit/diet-edit').then(m => m.DietEdit) },
          { path: 'edit/:id', loadComponent: () => import('./features/diet/pages/diet-edit/diet-edit').then(m => m.DietEdit) },
          { path: 'foods', loadComponent: () => import('./features/diet/pages/food-list/food-list').then(m => m.FoodList) }
        ]
      },
      {
        path: 'training',
        children: [
          { path: 'routines', loadComponent: () => import('./features/training/pages/routine-list/routine-list').then(m => m.RoutineList) },
          { path: 'routines/new', loadComponent: () => import('./features/training/pages/routine-edit/routine-edit').then(m => m.RoutineEdit) },
          { path: 'routines/edit/:id', loadComponent: () => import('./features/training/pages/routine-edit/routine-edit').then(m => m.RoutineEdit) },
          { path: 'exercises', loadComponent: () => import('./features/training/pages/exercise-list/exercise-list').then(m => m.ExerciseList) },
          { path: 'cardio', loadComponent: () => import('./features/training/pages/cardio-list/cardio-list').then(m => m.CardioList) }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
