import { Component } from '@angular/core'
import { Router } from '@angular/router'

import NavLink from 'src/app/shared/nav-link'
import { AuthStoreService } from '../auth-store.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  // Navigation links to display in the header
  navLinks: NavLink[] = [
    { title: 'Dashboard', link: '/' },
    { title: 'Devices', link: '/devices' }
  ]

  constructor (
    public authStore: AuthStoreService,
    private router: Router
  ) { }

  /**
   * Logs the user out and resets the session
   */
  logout () {
    this.authStore.reset()
    this.router.navigate(['/login'])
  }

  /**
   * Check if a link is currently active (being viewed)
   *
   * @param link NavLink to check if active
   * @returns boolean
   */
  linkActive (link: NavLink) {
    if (!link.link) return false
    // If this is the dashboard (home) route, check the deployed URL as well
    // as HDB hosts our Frontend at /api/static
    if (link.link === '/') return [link.link, '/api/static/'].includes(window.location.pathname)
    return window.location.pathname.includes(link.link)
  }
}
