import { Component } from '@angular/core'

import { AuthStoreService } from './modules/shared/auth-store.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor (public authStore: AuthStoreService) { }
}
