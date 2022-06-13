import { Injectable } from '@angular/core'
import { map } from 'rxjs'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { AuthStoreService } from '../modules/shared/auth-store.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (private authStore: AuthStoreService, private router: Router) {}

  /**
   * Obtain the User's authenticate from the store and see if they are authenticated
   *
   * @param _route ActivateRouteSnapshot route snapshot
   * @param _state RouterStateSnapshot router state snapshot
   * @returns Observable<boolean> user authenticate state observable
   */
  canActivate (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    return this.authStore.getUserSubject().pipe(
      map(user => {
        // If they have a username, their authentication is valid
        if (user.username) return true

        // Or else, it is not valid (or they just haven't logged in yet)
        this.authStore.lastLocation = window.location.pathname
        this.router.navigate(['/login'])
        return false
      })
    )
  }
}
