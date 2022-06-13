import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { environment } from 'src/environments/environment'
import { Device } from './models/device.model'
import {
  HarperDBDeletionRequest,
  HarperDBInsertRequest,
  HarperDBUpdateRequest
} from 'src/app/shared/harperdb'

@Injectable({ providedIn: 'root' })
export class DeviceService {
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
     * Return a list of active Devices setup
     *
     * @returns Observable<Device[]> list of active Devices
     */
  getDevices () {
    return this.http.get<Device[]>(
      environment.apiUrl + 'signs/device', this.baseOptions
    )
  }

  /**
     * Load a specific Device
     *
     * @param deviceId string Device ID of interest
     * @returns Observable<Device> device object
     */
  getDevice (deviceId: string) {
    return this.http.get<Device>(
      environment.apiUrl + `signs/device/${deviceId}`, this.baseOptions
    )
  }

  /**
     * Create a new Device
     *
     * @param device Device updated Device state object
     * @returns Observable<HarperDBInsertRequest> Result of insert request
     */
  createDevice (device: Device) {
    return this.http.post<HarperDBInsertRequest>(
      environment.apiUrl + 'signs/device', device, this.baseOptions
    )
  }

  /**
     * Save a Device's new state to the database to update the sign
     *
     * @param deviceId string Subject device ID
     * @param device Device updated Device state object
     * @returns Observable<HarperDBUpdateRequest> Result of update request
     */
  saveDevice (deviceId: string, device: Device) {
    return this.http.post<HarperDBUpdateRequest>(
      environment.apiUrl + `signs/device/${deviceId}`, device, this.baseOptions
    )
  }

  /**
     * Removes a specific Device from the DB
     *
     * @param deviceId string Device ID to remove
     * @returns Observable<HarperDBDeletionRequest> Result of deletion request
     */
  removeDevice (deviceId: string) {
    return this.http.delete<HarperDBDeletionRequest>(
      environment.apiUrl + `signs/device/${deviceId}`, this.baseOptions
    )
  }
}
