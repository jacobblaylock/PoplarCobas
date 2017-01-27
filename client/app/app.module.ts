import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent }  from './app.component';
import { BatchListComponent } from './batch-list.component';
import { BatchDetailComponent } from './batch-detail.component';
import { LoginComponent } from './login.component';

import { MssqlService } from './mssql.service';
import { AuthService } from './auth.service';

@NgModule({
  imports: [ BrowserModule, HttpModule, FormsModule ],
  declarations: [ AppComponent, BatchListComponent, BatchDetailComponent, LoginComponent ],
  providers: [ MssqlService, AuthService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
