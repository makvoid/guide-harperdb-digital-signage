import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CookieService } from 'ngx-cookie-service'

import { HeaderComponent } from './header/header.component'
import { ModalComponent } from './modal/modal.component'
import { SpinnerComponent } from './spinner/spinner.component'

@NgModule({
  declarations: [
    HeaderComponent,
    SpinnerComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    HeaderComponent,
    SpinnerComponent,
    ModalComponent
  ],
  providers: [CookieService]
})
export class SharedModule { }
