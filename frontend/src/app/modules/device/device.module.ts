import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgPipesModule } from 'ngx-pipes'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NgbPaginationModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { DeviceService } from './device.service'
import { DeviceRoutingModule } from './device-routing.module'
import { SharedModule } from '../shared/shared.module'
import { DeviceListComponent } from './components/device-list/device-list.component'
import { DeviceDetailComponent } from './components/device-detail/device-detail.component'
import { DeviceStoreService } from './device-store.service'

@NgModule({
  declarations: [DeviceListComponent, DeviceDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DeviceRoutingModule,
    NgPipesModule,
    NgbPaginationModule,
    NgbPopoverModule,
    FontAwesomeModule
  ],
  providers: [DeviceService, DeviceStoreService]
})
export class DeviceModule { }
