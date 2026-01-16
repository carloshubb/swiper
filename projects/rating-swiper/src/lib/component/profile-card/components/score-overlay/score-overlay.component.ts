import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-score-overlay',
  standalone: false,
  templateUrl: './score-overlay.component.html',
  styleUrls: ['./score-overlay.component.scss'],
})
export class ScoreOverlayComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() showScore: boolean = false;
  @Input() currentScore: number = 1;
  @Input() isHistoryMode: boolean = false;

  @ViewChild('morphText1', { static: false }) morphText1!: ElementRef;
  @ViewChild('morphText2', { static: false }) morphText2!: ElementRef;
  @ViewChild('morphText3', { static: false }) morphText3!: ElementRef;

  previousScore: number = 1;
  morphFraction: number = 1; // 1 = finished, 0 = just started
  isMorphing: boolean = false;
  morphTime: number = 0.6;
  morphStart: number = 0;

  private lastUpdateTime: number = 0;
  private throttleDelay: number = 100; // milliseconds

  private hasViewInit = false;
  private morphTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() { }

  ngAfterViewInit() {
    this.hasViewInit = true;
    // Reset morphing state and initialize text content
    this.isMorphing = false;
    this.morphFraction = 1;
    this.previousScore = this.currentScore;
    this.initializeMorphText();
  }

  ngOnDestroy() {
    if (this.morphTimeout) {
      clearTimeout(this.morphTimeout);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Always update currentScore immediately when it changes
    if (changes['currentScore']) {
      this.currentScore = changes['currentScore'].currentValue;
    }

    if (
      this.hasViewInit &&
      changes['currentScore'] &&
      changes['currentScore'].currentValue !== changes['currentScore'].previousValue
    ) {
      const newScore = changes['currentScore'].currentValue;
      const oldScore = changes['currentScore'].previousValue;

      // Normal morphing for score changes during dragging - with throttling
      if (Math.abs(newScore - oldScore) > 0) {
        this.throttledMorphTo(newScore);
      }
      this.updateAllTextElements(newScore);
    }
  }

  private updateAllTextElements(score: number) {
    const scoreText = score.toString();
    console.log('Updating all text elements to:', scoreText);

    // Directly update all text elements
    if (this.morphText1) {
      this.morphText1.nativeElement.textContent = scoreText;
      this.morphText1.nativeElement.style.opacity = '0%';
    }
    if (this.morphText2) {
      this.morphText2.nativeElement.textContent = scoreText;
      this.morphText2.nativeElement.style.opacity = '100%';
      this.morphText2.nativeElement.style.filter = '';
    }
    if (this.morphText3) {
      this.morphText3.nativeElement.textContent = scoreText;
    }

    this.isMorphing = false;
    this.morphFraction = 1;
  }

  private morphToScore(targetScore: number): void {
    if (targetScore === this.currentScore) return;
    if (this.isMorphing) return;
    if (!this.morphText1 || !this.morphText2 || !this.morphText3) return;

    this.isMorphing = true;

    // Set up the morph
    this.morphText1.nativeElement.textContent = this.currentScore.toString();
    this.morphText2.nativeElement.textContent = targetScore.toString();
    this.morphText3.nativeElement.textContent = targetScore.toString();

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const fraction = Math.min(elapsed / this.morphTime, 1);
      this.setMorph(fraction);

      if (fraction < 1) {
        requestAnimationFrame(tick);
      } else {
        this.finishMorph();
        this.currentScore = targetScore;
        this.morphText1.nativeElement.textContent = targetScore.toString();
        this.morphText2.nativeElement.textContent = targetScore.toString();
        this.morphText3.nativeElement.textContent = targetScore.toString();
        this.isMorphing = false;
      }
    };

    requestAnimationFrame(tick);
  }

  private setMorph(fraction: number): void {
    if (!this.morphText1 || !this.morphText2) return;

    const f = this.clamp(fraction, 1e-4, 0.9999);

    // Animate text2 (incoming)
    this.morphText2.nativeElement.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`;
    this.morphText2.nativeElement.style.opacity = `${Math.pow(f, 0.4) * 100}%`;

    // Animate text1 (outgoing)
    const fOut = 1 - f;
    this.morphText1.nativeElement.style.filter = `blur(${Math.min(8 / fOut - 8, 100)}px)`;
    this.morphText1.nativeElement.style.opacity = `${Math.pow(fOut, 0.4) * 100}%`;
  }

  private finishMorph(): void {
    if (!this.morphText1 || !this.morphText2) return;

    this.morphText2.nativeElement.style.filter = '';
    this.morphText2.nativeElement.style.opacity = '100%';
    this.morphText1.nativeElement.style.filter = '';
    this.morphText1.nativeElement.style.opacity = '0%';
  }

  animateMorph() {
    if (!this.isMorphing) return;
    const now = performance.now();
    const elapsed = (now - this.morphStart) / 1000;
    this.morphFraction = Math.min(elapsed / this.morphTime, 1);
    if (this.morphFraction < 1) {
      requestAnimationFrame(() => this.animateMorph());
    } else {
      this.morphFraction = 1;
      this.isMorphing = false;
      this.previousScore = this.currentScore;
    }
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
  }

  // Throttle function - matching reference
  private throttle(func: Function, delay: number) {
    return (...args: unknown[]) => {
      const now = performance.now();
      if (now - this.lastUpdateTime >= delay) {
        this.lastUpdateTime = now;
        func(...args);
      }
    };
  }

  // Throttled morphToScore - matching reference behavior
  private throttledMorphTo = this.throttle((targetScore: number) => {
    this.morphToScore(targetScore);
  }, this.throttleDelay);

  get isLowScore(): boolean {
    return this.currentScore <= 5;
  }

  get isHighScore(): boolean {
    return this.currentScore >= 6;
  }

  private initializeMorphText(): void {
    if (!this.morphText1 || !this.morphText2 || !this.morphText3) return;

    // Initialize all text elements with current score
    const scoreText = this.currentScore.toString();
    this.morphText1.nativeElement.textContent = scoreText;
    this.morphText2.nativeElement.textContent = scoreText;
    this.morphText3.nativeElement.textContent = scoreText;

    this.finishMorph();
  }
}
