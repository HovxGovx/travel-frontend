import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/dashboard/pages/home/home.component';
import { DashboardLayoutComponent } from './features/dashboard/layout/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path:'', component: HomeComponent },
      {
        path: 'activities',
        loadComponent: () =>
          import('./features/dashboard/pages/activities/activities.component')
            .then(m => m.ActivitiesComponent)
      }
    ]
  },
  {
    path: 'dashboard/activities',
    loadComponent: () =>
      import('./features/dashboard/pages/activities/activities.component')
        .then(m => m.ActivitiesComponent)
  }

];