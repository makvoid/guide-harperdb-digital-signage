import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { LoginRoutingModule } from './login-routing.module'
import { SharedModule } from '../shared/shared.module'
import { LoginFormComponent } from './login-form/login-form.component'

@NgModule({
  declarations: [LoginFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    LoginRoutingModule,
    FontAwesomeModule
  ]
})
export class LoginModule { }
