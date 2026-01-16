import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-skip-button',
  standalone: false,
  templateUrl: './skip-button.component.html',
  styleUrls: ['./skip-button.component.scss']
})
export class SkipButtonComponent {
  @Input() currentCardIndex: number = 0;
  @Input() totalCards: number = 0;
  @Output() skip = new EventEmitter<void>();

  onSkip(): void {
    this.skip.emit();
  }
}
