import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { 
  NbThemeModule,
  NbLayoutModule,
  NbMenuModule,
  NbSidebarModule,
  NbButtonModule,
  NbIconModule,
  NbStepperModule,
  NbCardModule,
  NbInputModule,
  NbSelectModule,
  NbListModule,
  NbDialogModule,
  NbToastrModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpService } from './providers/http.service';
import { map } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ENV } from 'src/environments/environment-variables.token';
import { AgmCoreModule } from '@agm/core';
import { SurvivorsComponent } from './survivors/survivors.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { Ng2CompleterModule } from '@akveo/ng2-completer';
import { Ng2FileInputModule } from 'ng2-file-input';
import { NgxEchartsModule } from "ngx-echarts";
import * as echarts from 'echarts';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ReportsComponent,
    InventoryComponent,
    SurvivorsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbMenuModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    NbButtonModule,
    NbStepperModule,
    NbCardModule,
    NbInputModule,
    NbSelectModule,
    NbListModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SmartTableModule,
		Ng2CompleterModule,
    Ng2FileInputModule,
    NgxEchartsModule.forRoot({
      echarts: { init: echarts.init }
    }),  
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCNQKO-Dw1ffAMf3rE3JSf_9nC1ml29BIE'
    })
  ],
  providers: [HttpService, { provide: ENV, useValue: environment }],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
