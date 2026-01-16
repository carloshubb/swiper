import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-action-buttons',
  standalone: false,
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent {
  @Output() back = new EventEmitter<void>();
  @Output() onLikeLeft = new EventEmitter<void>();
  @Output() onLikeRight = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  likeLeft(): void {
    this.onLikeLeft.emit();
  }
    
  likeRight(): void {
    this.onLikeRight.emit();
  }

  goToPrev(): void {
    this.back.emit();
  }

  goToNext(): void {
    this.next.emit();
  }

}
