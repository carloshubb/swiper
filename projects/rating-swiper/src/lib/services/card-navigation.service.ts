import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ICardData, ICardPair, IProfileCardState } from '../interfaces';
import { NavigationStateService } from './navigation-state.service';

@Injectable({
  providedIn: 'root'
})
export class CardNavigationService {
  currentPairIndex = signal(0);
  heartedLists: ICardData[] = [];
  hasCompletedLoop = false;
  isHistoryMode = false;
  isBackNavigation = false;

  private historyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private navigationState: NavigationStateService
  ) { }

  currentPair = computed((): ICardPair | null => {
    const pairs = this.getPairs();
    const index = this.currentPairIndex();
    return index < pairs.length ? pairs[index] : null;
  });

  hasPairs = computed(() => {
    return this.currentPairIndex() < this.getPairs().length;
  });

  public getCards(): ICardData[] {
    return [
      {
        id: 1,
        imageUrls: ['/assets/profileImage1-1.jpg', '/assets/profileImage1-2.jpg', '/assets/profileImage1-3.jpg', '/assets/profileImage1-4.jpg', '/assets/profileImage1.jpg'],
        name: 'Angelina',
        age: 21,
        tags: ['Vivvaya', 'Skincare', 'Baking', 'Hiking'],
      },
      {
        id: 2,
        imageUrls: ['/assets/profileImage2-1.jpg', '/assets/profileImage2-2.jpg', '/assets/profileImage2-3.jpg', '/assets/profileImage2-4.jpg', '/assets/profileImage2.jpg'],
        name: 'Sofia',
        age: 24,
        tags: ['Photography', 'Travel', 'Yoga', 'Coffee'],
      },
      {
        id: 3,
        imageUrls: ['/assets/profileImage3-1.jpg', '/assets/profileImage3-2.jpg', '/assets/profileImage3-3.jpg', '/assets/profileImage3-4.jpg', '/assets/profileImage3.jpg'],
        name: 'Emma',
        age: 22,
        tags: ['Music', 'Dancing', 'Art', 'Reading'],
      },
      {
        id: 4,
        imageUrls: ['/assets/profileImage4-1.jpg', '/assets/profileImage4-2.jpg', '/assets/profileImage4-3.jpg', '/assets/profileImage4-4.jpg', '/assets/profileImage4.jpg'],
        name: 'Isabella',
        age: 26,
        tags: ['Fitness', 'Cooking', 'Movies', 'Gaming'],
      },
      {
        id: 5,
        imageUrls: ['/assets/profileImage5-1.jpg', '/assets/profileImage5-2.jpg', '/assets/profileImage5-3.jpg', '/assets/profileImage5-4.jpg', '/assets/profileImage5.jpg'],
        name: 'Mia',
        age: 23,
        tags: ['Nature', 'Writing', 'Tennis', 'Fashion'],
      }
    ];
  }

  public getPairs(): ICardPair[] {
    let cards: ICardData[] = this.getCards();
    let pairs: ICardPair[] = [];
    let pairIndexes: [number, number][] = [];
    let indexes: number[] = [];
    let count = 0;
    // combine automatically
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        pairIndexes = [...pairIndexes, [
          i, j
        ]];
        indexes = [...indexes, count++]
      }
    }
    let shuffledArrays = this.shuffleArrays(indexes);
    for (let k = 0; k < shuffledArrays.length; k++) {
      pairs = [...pairs, {
        left: cards[pairIndexes[shuffledArrays[k]][0]],
        right: cards[pairIndexes[shuffledArrays[k]][1]]
      }]
    }
    return pairs;
  }

  shuffleArrays(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  nextPair(): boolean {
    this.clearHistoryTimer();

    const completedPairIndex = this.currentPairIndex();
    const pairs = this.getPairs();

    // Boundary check
    if (completedPairIndex < 0 || completedPairIndex >= pairs.length) {
      this.currentPairIndex.set(Math.max(0, Math.min(completedPairIndex, pairs.length - 1)));
      return false;
    }

    this.currentPairIndex.update((index: number) => index + 1);

    // Navigate to home when all cards are completed
    if (this.currentPairIndex() >= pairs.length) {
      this.hasCompletedLoop = true;
      this.navigationState.hasCompletedLoop.set(true);

      const currentState = {
        currentPairIndex: completedPairIndex,
        hasCompletedLoop: true,
        heartedLists: [...this.heartedLists],
        isHistoryMode: true
      };
      this.navigationState.profileCardState.set(currentState);
      this.navigationState.lastSwipedCardIndex.set(completedPairIndex);
      this.router.navigate(['/']);
      return true;
    }

    // Additional boundary check after increment
    if (this.currentPairIndex() >= pairs.length) {
      this.currentPairIndex.set(pairs.length - 1);
    }

    // Save current state
    this.saveCurrentState();
    return false;
  }

  goBack(): { wasSkipped: boolean } {
    this.clearHistoryTimer();

    // If no scored cards, navigate back to start-swiping
    if (this.heartedLists.length === 0) {
      this.router.navigate(['/']);
      return { wasSkipped: true };
    }

    // Get the last scored card before removing it
    const lastHeartedCard = this.heartedLists[this.heartedLists.length - 1];
    const targetPairIndex = this.currentPairIndex() - 1;

    // Remove the last scored card and decrement index
    this.heartedLists.pop();
    this.currentPairIndex.update((index: number) => index - 1);

    // Boundary check: if we've gone past the first card
    if (this.currentPairIndex() < 0) {
      this.heartedLists.push(lastHeartedCard);
      this.router.navigate(['/']);
      return { wasSkipped: true };
    }

    // Boundary check: ensure currentCardIndex doesn't exceed available cards
    const pairs = this.getPairs();
    if (this.currentPairIndex() >= pairs.length) {
      this.currentPairIndex.set(pairs.length - 1);
    }

    // Find the score for the card we're actually going back to
    const currentPair = this.currentPair();
    if (currentPair) {
      const heartedStatus = this.heartedLists.find(hearted => hearted.id === currentPair.left.id || hearted.id === currentPair.right.id);
      if (heartedStatus) {
        const wasSkipped = !heartedStatus;
        return { wasSkipped };
      }
    }
    return { wasSkipped: false }
  }

  initializeFromSavedState(): { isHistoryMode: boolean } {
    const isBackNavigation = this.navigationState.isBackNavigation();
    const savedState = this.navigationState.profileCardState();
    const hasCompletedLoop = this.navigationState.hasCompletedLoop();

    if (isBackNavigation && savedState && hasCompletedLoop) {
      // Restore state from navigation
      let restoredIndex = savedState.currentPairIndex;
      const cards = this.getPairs();

      if (restoredIndex < 0 || restoredIndex >= cards.length) {
        restoredIndex = Math.max(0, Math.min(restoredIndex, cards.length - 1));
      }

      this.currentPairIndex.set(restoredIndex);
      this.heartedLists = [...savedState.heartedLists];
      this.hasCompletedLoop = savedState.hasCompletedLoop;
      this.isHistoryMode = savedState.isHistoryMode;
      this.isBackNavigation = true;
      return {
        isHistoryMode: true
      };
    } else {
      // Fresh navigation - start from beginning
      this.clearSavedState();
      this.currentPairIndex.set(0);
      this.heartedLists = [];
      this.hasCompletedLoop = false;
      this.isHistoryMode = false;
      this.isBackNavigation = false;
    }

    return {
      isHistoryMode: false
    };
  }

  heartCurrentCard(dir: "left" | "right") {
    const currentPair = this.currentPair();
    if (!currentPair) return;

    const hearted: ICardData = currentPair[dir];

    this.heartedLists.push(hearted);
  }

  setupHistoryTimer(callback: () => void) {
    this.historyTimer = setTimeout(() => {
      this.isHistoryMode = false;
      callback();
      this.historyTimer = null;
    }, 3000);
  }

  private saveCurrentState(): void {
    const currentState = {
      currentPairIndex: this.currentPairIndex(),
      heartedLists: [...this.heartedLists],
      hasCompletedLoop: this.hasCompletedLoop,
      isHistoryMode: this.isHistoryMode,
    };
    this.navigationState.profileCardState.set(currentState);
    this.navigationState.lastSwipedCardIndex.set(this.currentPairIndex());
  }

  private clearSavedState(): void {
    this.navigationState.profileCardState.set(null);
  }

  private clearHistoryTimer(): void {
    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
    }
  }

  resetAll() {
    this.clearHistoryTimer();
    this.currentPairIndex.set(0);
    this.heartedLists = [];
    this.hasCompletedLoop = false;
    this.isHistoryMode = false;
  }
}
