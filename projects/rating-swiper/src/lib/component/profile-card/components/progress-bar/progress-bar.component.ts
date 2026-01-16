import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: false,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() currentIndex: number = 0;
  @Input() totalCards: number = 0;

  get progressPercentage(): number {
    if (this.totalCards === 0) return 0;
    
    // Ensure currentIndex is within valid range
    const validIndex = Math.max(0, Math.min(this.currentIndex, this.totalCards - 1));
    
    // Progress should reach 100% only after completing all cards
    // Show progress as: 0%, 25%, 50%, 75%, 100% for 5 cards
    const progress = (validIndex / Math.max(1, this.totalCards - 1)) * 100;
    
    // console.log(`Progress Bar Debug: currentIndex=${this.currentIndex}, validIndex=${validIndex}, totalCards=${this.totalCards}, progress=${progress}%`);
    
    return progress;
  }
}
