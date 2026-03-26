import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { DietList } from './features/diet/pages/diet-list/diet-list';
import { FoodList } from './features/diet/pages/food-list/food-list';
import { Login } from './features/auth/pages/login/login';
import { Dashboard } from './features/home/pages/dashboard/dashboard';
import { UserList } from './features/users/pages/user-list/user-list';
import { UserDetail } from './features/users/pages/user-detail/user-detail';
import { RoutineList } from './features/training/pages/routine-list/routine-list';
import { ExerciseList } from './features/training/pages/exercise-list/exercise-list';
import { CardioList } from './features/training/pages/cardio-list/cardio-list';
import { Shell } from './shared/components/shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      {
        path: 'users',
        children: [
          { path: '', component: UserList },
          { path: ':id', component: UserDetail }
        ]
      },
      {
        path: 'diet',
        children: [
          { path: '', component: DietList },
          { path: 'foods', component: FoodList }
        ]
      },
      {
        path: 'training',
        children: [
          { path: 'routines', component: RoutineList },
          { path: 'exercises', component: ExerciseList },
          { path: 'cardio', component: CardioList }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
