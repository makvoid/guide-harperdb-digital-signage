import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { environment } from 'src/environments/environment'
import DashboardInformation from './models/dashboard.model'
import DeviceException from 'src/app/shared/device-exception'
import { HarperDBDeletionRequest } from 'src/app/shared/harperdb'

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // Base headers to include with every request
  baseOptions = {
    headers: {
      Authorization: `Basic ${this.cookieService.get('token')}`,
      'Content-Type': 'application/json'
    }
  }

  constructor (
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  /**
     * Request the dashboard information set from the API
     *
     * @returns Observable<DashboardInformation> dashboard information object
     */
  getDashboard () {
    return this.http.get<DashboardInformation>(environment.apiUrl + 'signs/dashboard', this.baseOptions)
  }

  /**
     * Submit a request to remove an alert to the API
     *
     * @param alert DeviceException alert of interest to remove
     * @returns Observable<HarperDBDeletionRequest> result of removal request
     */
  removeAlert (alert: DeviceException) {
    return this.http.delete<HarperDBDeletionRequest>(environment.apiUrl + `signs/log/${alert.id}`, this.baseOptions)
  }
}
