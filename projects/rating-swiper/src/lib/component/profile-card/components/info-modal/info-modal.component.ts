import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-modal',
  standalone: false,
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onContinue(): void {
    this.continue.emit();
  }
}
