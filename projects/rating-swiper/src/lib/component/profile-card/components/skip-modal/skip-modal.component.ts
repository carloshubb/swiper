import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-skip-modal',
  standalone: false,
  templateUrl: './skip-modal.component.html',
  styleUrls: ['./skip-modal.component.scss']
})
export class SkipModalComponent {
  @Input() showSkipModal: boolean = false;
  @Input() agreeToSkip: boolean = false;
  @Output() closeSkipModal = new EventEmitter<void>();
  @Output() skipAnyway = new EventEmitter<void>();
  @Output() agreeToSkipChange = new EventEmitter<boolean>();

  onCloseSkipModal(): void {
    this.closeSkipModal.emit();
  }

  onSkipAnyway(): void {
    this.skipAnyway.emit();
  }

  onCheckboxChange(): void {
    this.agreeToSkipChange.emit(!this.agreeToSkip);
  }
}
