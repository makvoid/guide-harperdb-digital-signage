import { Injectable } from '@angular/core'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { ToastrService } from 'ngx-toastr'

import { DashboardService } from './dashboard.service'
import DashboardInformation from './models/dashboard.model'
import Logger from 'src/app/shared/logger'

@Injectable({ providedIn: 'root' })
export class DashboardStoreService {
  // Refresh timer
  private readonly refreshTimer: ReturnType<typeof setInterval> | null = null
  private readonly refreshTimerMs = 10000 // 10 seconds

  // Dashboard Information
  private readonly defaultState = {
    widgets: {
      devices: { online: 0, total: 0 },
      recentAlerts: 0
    },
    logs: []
  }

  private readonly _info = new BehaviorSubject<DashboardInformation>(this.defaultState)
  readonly info$ = this._info.asObservable()

  // Loading state
  private readonly _loading = new BehaviorSubject<boolean>(false)
  readonly loading$ = this._loading.asObservable()

  constructor (private dashboardService: DashboardService, private toastr: ToastrService) {
    this.fetchAll()

    // Setup a timer to keep the dashboard updated
    this.refreshTimer = setInterval(() => {
      this.fetchAll(false)
    }, this.refreshTimerMs)
  }

  /**
     * Obtain the current dashboard information state
     */
  get info (): DashboardInformation {
    return this._info.getValue()
  }

  /**
     * Set the current dashboard information state
     */
  set info (val: DashboardInformation) {
    this._info.next(val)
  }

  /**
     * Obtain the current dashboard loading state
     */
  get loading (): boolean {
    return this._loading.getValue()
  }

  /**
     * Set the current dashboard loading state
     */
  set loading (val: boolean) {
    this._loading.next(val)
  }

  /**
     * Obtain a fresh copy of the dashboard state information
     *
     * @param showSpinner boolean to show the spinner or not
     * @returns Promise<void>
     */
  async fetchAll (showSpinner = true) {
    if (showSpinner) this.loading = true
    try {
      this.info = await firstValueFrom(this.dashboardService.getDashboard())
    } catch (e) {
      const errorString = 'Unable to load dashboard state'
      Logger.error(e, errorString)
      this.toastr.error(errorString)
      return
    }
    if (showSpinner) this.loading = false
  }
}
