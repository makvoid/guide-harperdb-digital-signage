import { Injectable } from '@angular/core'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { ToastrService } from 'ngx-toastr'

import { DeviceService } from './device.service'
import Logger from 'src/app/shared/logger'
import { Device } from './models/device.model'
import { Router } from '@angular/router'

@Injectable({ providedIn: 'root' })
export class DeviceStoreService {
  // Refresh timer
  private readonly refreshTimer: ReturnType<typeof setInterval> | null = null
  private readonly refreshTimerMs = 10000 // 10 seconds

  // Device list information
  private readonly _devices = new BehaviorSubject<Device[]>([])
  readonly devices$ = this._devices.asObservable()

  // Device detail information
  private readonly _device = new BehaviorSubject<Device|null>(null)
  readonly device$ = this._device.asObservable()

  // Loading state
  private readonly _loading = new BehaviorSubject<boolean>(false)
  readonly loading$ = this._loading.asObservable()

  constructor (
        private deviceService: DeviceService,
        private router: Router,
        private toastr: ToastrService
  ) {
    this.fetchAll()

    // Setup a timer to keep the devices updated
    this.refreshTimer = setInterval(() => {
      this.fetchAll(false)
    }, this.refreshTimerMs)
  }

  /**
     * Obtain the current devices state
     */
  get devices (): Device[] {
    return this._devices.getValue()
  }

  /**
     * Set the current devices state
     */
  set devices (val: Device[]) {
    this._devices.next(val)
  }

  /**
     * Obtain the current device state
     */
  get device (): Device | null {
    return this._device.getValue()
  }

  /**
     * Set the current device state
     */
  set device (val: Device | null) {
    this._device.next(val)
  }

  /**
     * Obtain the current device loading state
     */
  get loading (): boolean {
    return this._loading.getValue()
  }

  /**
     * Set the current device loading state
     */
  set loading (val: boolean) {
    this._loading.next(val)
  }

  /**
     * Obtain a fresh copy of the dashboard state information
     *
     * @param showSpinner boolean whether or not to show the loading spinner if applicable
     * @returns Promise<void>
     */
  async fetchAll (showSpinner = true) {
    if (showSpinner) this.loading = true
    try {
      this.devices = await firstValueFrom(this.deviceService.getDevices())
    } catch (e) {
      const errorString = 'Unable to load devices'
      Logger.error(e, errorString)
      this.toastr.error(errorString)
      return
    }
    if (showSpinner) this.loading = false
  }

  /**
     * Obtain the latest state of the Device from the DB
     *
     * @param deviceId string uuid of Device to fetch information for
     * @param showSpinner boolean whether or not to show the loading spinner if applicable
     * @returns Promise<void>
     */
  async fetch (deviceId: string, showSpinner = true) {
    if (showSpinner) this.loading = true
    try {
      const response = await firstValueFrom(this.deviceService.getDevice(deviceId))
      if (response.message) {
        throw new Error(response.message)
      }
      this.device = response
    } catch (e) {
      const errorString = 'Unable to load device'
      Logger.error(e, errorString)
      this.toastr.error(errorString)
      this.router.navigate(['devices'])
      this.fetchAll()
      return
    }
    if (showSpinner) this.loading = false
  }
}
