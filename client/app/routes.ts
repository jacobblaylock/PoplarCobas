import { Routes } from '@angular/router';
import { BatchListComponent } from './batch-list.component';
import { LoginComponent } from './login.component';

import { LoginActivatorService } from './login-route-activator';

export const appRoutes:Routes = [
    {path: 'login', component: LoginComponent },
    {path: 'batch', component: BatchListComponent, canActivate: [LoginActivatorService] },
    {path: '', redirectTo: '/login', pathMatch: 'full'}
]