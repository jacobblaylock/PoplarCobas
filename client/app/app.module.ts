import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent }  from './app.component';
import { BatchListComponent } from './batch-list.component';
import { BatchDetailComponent } from './batch-detail.component';

import { MssqlService } from './mssql.service';

@NgModule({
  imports:      [ BrowserModule, HttpModule, FormsModule ],
  declarations: [ AppComponent, BatchListComponent, BatchDetailComponent ],
  providers: [ MssqlService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
