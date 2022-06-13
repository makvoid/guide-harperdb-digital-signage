import { Component, OnInit } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { Title } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { faSignHanging } from '@fortawesome/free-solid-svg-icons'
import { firstValueFrom } from 'rxjs'

import { HarperDBUser } from 'src/app/shared/harperdb'
import { environment } from 'src/environments/environment'
import { AuthStoreService } from '../../shared/auth-store.service'
import { AuthService } from '../../shared/auth.service'

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnInit {
  logoIcon = faSignHanging
  loginError = false

  // Login form
  form = this.formBuilder.group({
    username: [null, [Validators.required, Validators.minLength(3)]],
    password: [null, [Validators.required, Validators.minLength(3)]]
  })

  constructor (
    private title: Title,
    private router: Router,
    private authService: AuthService,
    private authStore: AuthStoreService,
    private formBuilder: FormBuilder
  ) { }

  /**
   * Checks if a control has been modified and is invalid
   *
   * @param controlName string name of control to check
   * @returns boolean
   */
  isControlInvalid (controlName: string) {
    const control = this.form.get(controlName)
    return control?.invalid &&
      control?.errors &&
      (control?.dirty || control?.touched)
  }

  ngOnInit () {
    this.title.setTitle('Login' + environment.pageTag)

    // If the User is already authenticated, skip this page
    if (this.authStore.authenticated) {
      this.router.navigate([
        this.authStore.lastLocation !== '' ? this.authStore.lastLocation : '/'
      ])
    }
  }

  /**
   * Set the Users token and attempt to fetch the User's state
   * to determine if the credentials are valid. If  valid, redirect
   * to the last location requested if applicable or the dashboard
   */
  async submitForm () {
    // Set Cookie to attempt to authenticate
    this.authService.setCookie(this.form.value)

    // Re-fetch auth state
    let result: HarperDBUser | boolean
    try {
      result = await firstValueFrom(this.authService.getUserInformation())
    } catch (_e) {
      result = false
    }

    // Update state
    if (result) {
      this.authStore.user = result
      this.authStore.authenticated = true
    } else {
      this.authStore.authenticated = false
    }

    // Once complete, check if we are authenticated
    if (this.authStore.authenticated) {
      this.router.navigate([
        this.authStore.lastLocation !== '' ? this.authStore.lastLocation : '/'
      ])
    } else {
      this.loginError = true
    }
  }
}
