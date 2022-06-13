import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Subscription } from 'rxjs'

import { environment } from 'src/environments/environment'
import { DeviceStoreService } from '../../device-store.service'
import { Device } from '../../models/device.model'

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html'
})
export class DeviceListComponent implements OnInit, OnDestroy {
  // Subscriptions set up for the component
  subscriptions: Subscription[] = []
  // Paginated devices
  paginatedDevices: Device[] = []
  // Used for filtering the devices
  queryInput: string = ''

  // Icons for our buttons
  icons = {
    view: faEye,
    add: faPlus
  }

  // Pagination settings
  page = 1
  pageSize = 25

  constructor (
    private titleService: Title,
    private router: Router,
    public deviceStore: DeviceStoreService
  ) { }

  /**
   * Truncate a string after a certain length
   *
   * @param value string value to truncate
   * @param length number length at which to cut the string
   * @returns string truncated string
   */
  truncateString (value: string, length: number) {
    if (!value) return 'N/A'
    if (value.length < length) return value
    return `${value.slice(0, length)}...`
  }

  /**
   * Navigate to the add a new Device page
   */
  addNewDevice () {
    this.router.navigate(['devices', 'new'])
  }

  /**
   * Based on the page, pageSize and query change the visible results
   */
  refreshDevices () {
    // Filter the results available based on the query provided
    const filteredDevices = this.deviceStore.devices.filter(device => {
      // Match on the id, name, and description fields
      const matches = [device.id, device.name, device.description]
        .map(field => field?.toLowerCase().includes(this.queryInput.toLowerCase()))
      return matches.some(v => v) ? device : null
    })

    // Update the slice of devices depending on which page we are on
    this.paginatedDevices = filteredDevices
      .map(device => {
        // Create a vanilla Date object using the createdTime for pipe usage in the template
        device.createdTime = new Date(device.__createdtime__!)
        return device
      })
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      )
  }

  /**
   * Trigger the router to navigate to the device detail page
   *
   * @param device Device device of interest
   */
  openDevice (device: Device) {
    this.router.navigate(['devices', device.id])
  }

  ngOnDestroy () {
    // Whenever the component is destroyed, remove any subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  async ngOnInit () {
    this.titleService.setTitle('Device List' + environment.pageTag)

    // Wait for DeviceStore to load before refreshing table initially
    while (this.deviceStore.loading) {
      await this.sleep(50)
    }

    // Subscribe to any device list changes to keep the list updated
    this.subscriptions.push(
      this.deviceStore.devices$.subscribe(() => this.refreshDevices())
    )

    // Refresh table state
    this.refreshDevices()
  }

  /**
   * Sleep for a certain amount of time
   *
   * @param ms number amount in ms to wait for
   * @returns Promise
   */
  sleep (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
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
    return this.refreshDevices()
  }
}
