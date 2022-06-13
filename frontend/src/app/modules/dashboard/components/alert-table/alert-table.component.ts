import { Component, Input, OnInit, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges, ElementRef, TemplateRef } from '@angular/core'
import { Router } from '@angular/router'
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons'

import { ModalComponent } from 'src/app/modules/shared/modal/modal.component'
import DeviceException from 'src/app/shared/device-exception'

@Component({
  selector: 'app-alert-table',
  templateUrl: './alert-table.component.html',
  styleUrls: ['./alert-table.component.css']
})
export class AlertTableComponent implements OnInit, OnChanges {
  // Active alert being viewed (to fill the modal details)
  activeAlert: DeviceException | null = null
  // Paginated alerts
  paginatedAlerts: DeviceException[] = []
  // Raw alerts from the state (used to feed paginatedAlerts)
  @Input() alerts: DeviceException[] = []
  // Used for detecting when we removed an alert (to update our state/send removal request to API)
  @Output() removedAlertEvent = new EventEmitter<DeviceException>()
  // Used for opening modals
  @ViewChild('modal', { static: false }) modalChild!: ModalComponent

  // Icons for the template to use
  icons = {
    view: faEye,
    dismiss: faTrash
  }

  // Pagination settings
  page = 1
  pageSize = 25

  constructor (private router: Router) { }

  /**
   * Trigger the router to navigate to the device detail page
   *
   * @param deviceId string Device ID to view
   */
  viewDevice (deviceId: string) {
    this.modalChild.close()
    this.router.navigate(['devices', deviceId])
  }

  /**
   * Set which alert is active (to fill the template details) and open the modal
   *
   * @param alert DeviceException alert of interest to load
   * @param content TemplateRef<ElementRef> Template reference to use as the modal content
   */
  openAlert (alert: DeviceException, content: TemplateRef<ElementRef>) {
    this.activeAlert = alert
    this.modalChild.open(content)
  }

  /**
   * Emit a removal event to the parent component (DashboardHome) to remove the alert
   *
   * @param alert DeviceException alert of interest to dismiss
   */
  dismissAlert (alert: DeviceException) {
    this.removedAlertEvent.emit(alert)
    this.modalChild.close()
  }

  /**
   * Based on the page/pageSize settings, set the current page of results
   */
  refreshAlerts () {
    // Update the slice of alerts depending on which page we are on
    this.paginatedAlerts = this.alerts
      .map(alert => {
        // Create a vanilla Date object using the createdTime for pipe usage in the template
        alert.createdTime = new Date(alert.__createdtime__)
        return alert
      })
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      )
  }

  ngOnInit () {
    // Upon init, paginate our results
    this.refreshAlerts()
  }

  /**
   * Since we make a copy of the state to paginatedDevices
   * we need to manually refresh the devices after any changes.
   * (this is triggered by Angular after any changes)
   * https://angular.io/api/core/OnChanges
   *
   * @param _changes SimpleChanges SimpleChanges object
   * @returns void
   */
  ngOnChanges (_changes: SimpleChanges) {
    this.refreshAlerts()
  }
}
