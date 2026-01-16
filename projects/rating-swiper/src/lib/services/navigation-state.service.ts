import { Injectable, signal } from '@angular/core';
import { IProfileCardState } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class NavigationStateService {
  // Public signals that components can directly access
  hasCompletedLoop = signal<boolean>(false);
  lastSwipedCardIndex = signal<number>(0);
  profileCardState = signal<IProfileCardState | null>(null);
  isBackNavigation = signal<boolean>(false);

  // Reset all state when needed
  resetState(): void {
    this.hasCompletedLoop.set(false);
    this.lastSwipedCardIndex.set(0);
    this.profileCardState.set(null);
    this.isBackNavigation.set(false);
  }
}
