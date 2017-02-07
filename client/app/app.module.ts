import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent }  from './app.component';
import { BatchListComponent } from './batch-list.component';
import { BatchDetailComponent } from './batch-detail.component';
import { LoginComponent } from './login.component';

import { MssqlService } from './mssql.service';
import { AuthService } from './auth.service';
import { LoginActivatorService } from './login-route-activator';

import { appRoutes } from './routes';

@NgModule({
  imports: [ BrowserModule, HttpModule, FormsModule, ReactiveFormsModule, RouterModule.forRoot(appRoutes) ],
  declarations: [ AppComponent, BatchListComponent, BatchDetailComponent, LoginComponent ],
  providers: [ MssqlService, AuthService, LoginActivatorService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
