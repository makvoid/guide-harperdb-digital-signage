import { Component, ElementRef, TemplateRef } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  constructor (private modalService: NgbModal) {}

  /**
   * Load a specific element as a modal's content and display it
   *
   * @param content TemplateRef<ElementRef> content to load into modal template
   */
  open (content: TemplateRef<ElementRef>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-title' })
  }

  /**
   * Close any modals currently open
   */
  close () {
    this.modalService.dismissAll()
  }
}
