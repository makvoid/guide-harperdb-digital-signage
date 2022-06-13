import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap'
import { NgPipesModule } from 'ngx-pipes'

import { DashboardRoutingModule } from './dashboard-routing.module'
import { SharedModule } from '../shared/shared.module'
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component'
import { DashboardService } from './dashboard.service'
import { DashboardStoreService } from './dashboard-store.service'
import { AlertTableComponent } from './components/alert-table/alert-table.component'

@NgModule({
  declarations: [
    DashboardHomeComponent,
    AlertTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    DashboardRoutingModule,
    FontAwesomeModule,
    NgbPaginationModule,
    NgPipesModule
  ],
  providers: [DashboardService, DashboardStoreService]
})
export class DashboardModule { }
