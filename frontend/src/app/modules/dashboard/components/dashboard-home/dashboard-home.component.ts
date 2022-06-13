import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { faTv, faSignHanging, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { firstValueFrom } from 'rxjs'
import { ToastrService } from 'ngx-toastr'

import { cloneable } from 'src/app/shared/cloneable'
import DeviceException from 'src/app/shared/device-exception'
import Logger from 'src/app/shared/logger'
import { environment } from 'src/environments/environment'
import { DashboardStoreService } from '../../dashboard-store.service'
import { DashboardService } from '../../dashboard.service'

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  // Icons for the template to use
  icons = {
    devices: faTv,
    signs: faSignHanging,
    alerts: faExclamationTriangle
  }

  constructor (
    private title: Title,
    public dashboardStore: DashboardStoreService,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) { }

  /**
   * Handle updating the state after an alert is dismissed
   * and submitting the removal request via the service
   *
   * @param alert DeviceException alert of interest to remove
   * @returns Promise<void>
   */
  async onAlertRemoval (alert: DeviceException) {
    // Create a copy of the state and remove the alert
    const newState = cloneable.deepCopy(this.dashboardStore.info)
    newState.logs = newState.logs.filter(log => log.id !== alert.id)

    // Update the state (and our components)
    this.dashboardStore.info = newState

    // Send removal request to the API
    let response
    try {
      response = await firstValueFrom(this.dashboardService.removeAlert(alert))
    } catch (e) {
      Logger.error(e, `Error removing alert: ${alert.id}`)
      this.toastr.error('Unable to submit removal request for alert', 'Deletion Error')
      return
    }

    // Ensure the alert was deleted
    if (response.deleted_hashes.length !== 1) {
      Logger.error(new Error(response.message), 'Unable to remove alert from database')
      this.toastr.error('Unable to remove alert from database', 'Deletion Error')
    }
  }

  ngOnInit () {
    // On init, set the page title
    this.title.setTitle('Dashboard' + environment.pageTag)
  }
}
