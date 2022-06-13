import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'

import { environment } from 'src/environments/environment'
import { HarperDBUser } from 'src/app/shared/harperdb'

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor (
        private http: HttpClient,
        private cookieService: CookieService
  ) {}

  /**
     * Pulls the currently authenticated User's information from HarperDB
     * (also ensures the credentials provided were valid)
     *
     * @returns HarperDBUser User object
     */
  getUserInformation () {
    const opts = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.cookieService.get('token')}`
      }

    }
    const payload = { operation: 'user_info' }
    return this.http.post<HarperDBUser>(environment.apiUrl + 'passthrough', payload, opts)
  }

  /**
     * Set the authentication token using the provided credentials for future use
     *
     * @param form { username: string, password: string } User credentials
     */
  setCookie (form: { username: string, password: string }) {
    this.cookieService.set('token', btoa(`${form.username}:${form.password}`))
  }

  /**
     * Remove the token used for authentication
     */
  clearCookie () {
    this.cookieService.delete('token')
  }
}
