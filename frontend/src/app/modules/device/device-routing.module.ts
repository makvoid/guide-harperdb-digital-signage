import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { DeviceDetailComponent } from './components/device-detail/device-detail.component'
import { DeviceListComponent } from './components/device-list/device-list.component'

const routes: Routes = [
  // Device List
  { path: '', component: DeviceListComponent },

  // Device Detail
  { path: ':deviceId', component: DeviceDetailComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceRoutingModule { }
