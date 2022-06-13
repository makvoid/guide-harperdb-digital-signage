import { Injectable } from '@angular/core'
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs'

import { HarperDBUser } from 'src/app/shared/harperdb'
import { AuthService } from './auth.service'

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
  /** User */
  private readonly _user = new BehaviorSubject<HarperDBUser>({})
  readonly user$ = this._user.asObservable()

  /**
     * Obtain the User state
     */
  get user (): HarperDBUser {
    return this._user.getValue()
  }

  /**
     * Set the User state
     */
  set user (val: HarperDBUser) {
    this._user.next(val)
  }

  /**
     * Return a Subject of the User object
     *
     * @returns Subject<HarperDBUser> user object
     */
  getUserSubject (): Subject<HarperDBUser> {
    return this._user
  }

  /** Loading */
  private readonly _loading = new BehaviorSubject<boolean>(false)
  readonly loading$ = this._loading.asObservable()

  /**
     * Obtain the loading state
     */
  get loading (): boolean {
    return this._loading.getValue()
  }

  /**
     * Set the loading state
     */
  set loading (val: boolean) {
    this._loading.next(val)
  }

  /** Authenticated */
  private readonly _authenticated = new BehaviorSubject<boolean>(false)
  readonly authenticated$ = this._authenticated.asObservable()

  /**
     * Get the authenticated state
     */
  get authenticated (): boolean {
    return this._authenticated.getValue()
  }

  /**
     * Set the authenticated state
     */
  set authenticated (val: boolean) {
    this._authenticated.next(val)
  }

  /** Last Location request */
  private readonly _lastLocation = new BehaviorSubject<string>('')
  readonly lastLocation$ = this._lastLocation.asObservable()

  /**
     * Obtain the last location state
     */
  get lastLocation (): string {
    return this._lastLocation.getValue()
  }

  /**
     * Set the last location state
     */
  set lastLocation (val: string) {
    this._lastLocation.next(val)
  }

  constructor (private authService: AuthService) {
    this.fetchAll()
  }

  /**
     * Clear and reset any authentication state
     */
  reset () {
    this.authService.clearCookie()
    this.authenticated = false
    this.user = {}
  }

  /**
     * Fetch all state for the User
     */
  async fetchAll () {
    this.loading = true
    try {
      this.user = await firstValueFrom(this.authService.getUserInformation())
    } catch (e) {
      console.error(e)
      this.authService.clearCookie()
    }
    if (this.user.username) {
      this.authenticated = true
    } else {
      this.authenticated = false
    }
    this.loading = false
  }
}
