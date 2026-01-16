import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CardNavigationService } from '../../services/card-navigation.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swiper from 'swiper';
import { environment } from '../../../environments/environment';
import { InteractionService } from '../../services/interaction.service';
import { CheckpointVersionService } from '../../services/checkpoint-version.service';
import { IndexedDbService } from '../../services/indexed-db.service';

interface CardType {
  id: number;
  imageUrls: string[];
  name: string;
  age: number;
  tags: string[];
  scored?: boolean;
  score?: number;
}

interface PairType {
  left: CardType;
  right: CardType;
}

@Component({
  selector: 'app-profile-card',
  standalone: false,
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent implements OnInit, AfterViewInit {

  constructor(
    private cardNavigation: CardNavigationService,
    private router: Router,
    private http: HttpClient,
    private checkpointService: CheckpointVersionService,
    private interactionService: InteractionService,
    private indexedDb: IndexedDbService
  ) { }


  private apiUrl = environment.apiUrl;

  @ViewChild('swiperLEl', { static: true }) swiperLEl!: ElementRef<HTMLElement>;
  @ViewChild('swiperREl', { static: true }) swiperREl!: ElementRef<HTMLElement>;

  private swiperLInstance?: Swiper;
  private swiperRInstance?: Swiper;

  activeIndex = 0;
  draggingLeft = false;
  draggingRight = false;

  // Session & Experiment State
  sessionId: string = '';
  userId: string = 'anonymous';
  datasetVersion: string = 'v1.0.0';
  titleVariantId: string = 'default';
  currentTitle: string = 'Who is more attractive to you?';
  datasetConfig: any = null;

  // Hearted list
  heartedLists: (CardType | undefined)[] = [];

  // Pairs from service
  pairs: PairType[] = this.cardNavigation.getPairs();

  get progressBarWidth(): number {
    if (this.pairs.length === 0) return 0;
    return 100 / this.pairs.length;
  }

  get progressBarActiveWidth(): number {
    if (this.pairs.length === 0) return 0;
    return (this.activeIndex + 1) * this.progressBarWidth;
  }

  get activePair(): PairType | undefined {
    return this.pairs[this.activeIndex];
  }

  ngOnInit(): void {
    const storedUrl = localStorage.getItem('sw_api_url');
    if (storedUrl) {
      this.apiUrl = storedUrl;
      console.log('[ProfileCard] Using custom API URL:', this.apiUrl);
    }
    this.initSession();
    this.loadDatasetConfig();
  }

  // ... (ngAfterViewInit and others unchanged)

  // ============================================================
  // SESSION & CHECKPOINT LOGIC
  // ============================================================

  private initSession(): void {
    let storedSession = localStorage.getItem('sw_session_id');
    if (!storedSession) {
      storedSession = 'sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('sw_session_id', storedSession);
    }
    this.sessionId = storedSession;
    console.log('[Session] ID:', this.sessionId);
  }

  private loadDatasetConfig(): void {
    // 1. Try to load from new Versioning System
    const ckptName = localStorage.getItem('sw_checkpoint_name');
    const ckptVersion = localStorage.getItem('sw_checkpoint_version');

    if (ckptName) {
      this.checkpointService.getCheckpoint(ckptName, ckptVersion || undefined).subscribe({
        next: (ckpt) => {
          this.datasetVersion = ckpt.version;
          if (ckpt.swiper_title) {
            this.currentTitle = ckpt.swiper_title;
          }
          console.log('[Config] Loaded versioned checkpoint:', ckpt.title, ckpt.version);
          // Future: Load data.csv content if needed
          this.restoreCheckpoint();
        },
        error: (err) => {
          console.error('[Config] Failed to load versioned checkpoint', err);
          this.fallbackLoadConfig();
        }
      });
    } else {
      this.fallbackLoadConfig();
    }
  }

  private fallbackLoadConfig() {
    this.http.get<any>(`${this.apiUrl}/dataset/config`).subscribe({
      next: (config) => {
        this.datasetConfig = config;

        // Fallback to legacy key
        const userCheckpoint = localStorage.getItem('sw_checkpoint');
        if (userCheckpoint) {
          this.datasetVersion = userCheckpoint;
        } else {
          this.datasetVersion = config.version;
        }

        const manualTitle = localStorage.getItem('sw_checkpoint_title');

        // Title Experiment (A/B)
        // ... (A/B logic) ...
        const storedVariant = localStorage.getItem('sw_title_variant');
        let selectedVariant;
        if (storedVariant) {
          selectedVariant = config.title_variants.find((v: any) => v.variant_id === storedVariant);
        }
        if (!selectedVariant) {
          const idx = Math.floor(Math.random() * config.title_variants.length);
          selectedVariant = config.title_variants[idx];
          localStorage.setItem('sw_title_variant', selectedVariant.variant_id);
        }

        if (manualTitle && manualTitle.trim() !== "") {
          this.currentTitle = manualTitle;
        } else if (selectedVariant) {
          this.titleVariantId = selectedVariant.variant_id;
          this.currentTitle = selectedVariant.title_text;
        }
        this.restoreCheckpoint();
      },
      error: (err) => {
        console.error('[Config] Failed to load dataset config', err);
      }
    });
  }

  ngAfterViewInit(): void {
    const options = {
      direction: 'horizontal' as const,
      slidesPerView: 1,
      effect: 'cards' as const,
      spaceBetween: 12
    };

    const subOptions = {
      direction: 'vertical' as const,
      slidesPerView: 1.8,
      spaceBetween: 1,
      loop: true,
      loopAdditionalSlides: 1,
      freeMode: true,
      freeModeSticky: false
    };

    this.swiperLInstance = new Swiper(this.swiperLEl?.nativeElement, options);
    this.swiperRInstance = new Swiper(this.swiperREl?.nativeElement, options);

    setTimeout(() => {
      const subSwiperElements = document.querySelectorAll('.sub-swiper');
      subSwiperElements.forEach((element) => {
        new Swiper(element as HTMLElement, subOptions);
      });
    }, 0);

    this.activeIndex = this.swiperLInstance?.realIndex ?? 0;

    // Binding events
    this.swiperRInstance.on('touchStart', () => {
      this.draggingRight = true;
    });
    this.swiperLInstance.on('touchStart', () => {
      this.draggingLeft = true;
    });

    this.swiperRInstance.on('slideChange', () => {
      if (this.draggingLeft) {
        this.draggingLeft = false;
        return;
      }
      let rIndex = this.swiperRInstance?.realIndex ?? 0;
      if (this.draggingRight) {
        let dir = this.activeIndex <= rIndex && rIndex != 0;
        this.setHeart(dir ? 'right' : 'left');
      }
      if (!this.heartedLists[this.activeIndex]) this.heartedLists[this.activeIndex] = undefined;
      this.activeIndex = rIndex;
      this.swiperLInstance?.slideTo(this.activeIndex);
    });

    this.swiperLInstance.on('slideChange', () => {
      if (this.draggingRight) {
        this.draggingRight = false;
        return;
      }
      let lIndex = this.swiperLInstance?.realIndex ?? 0;
      if (this.draggingLeft) {
        let dir = this.activeIndex <= lIndex && lIndex != 0;
        this.setHeart(dir ? 'right' : 'left');
      }
      if (!this.heartedLists[this.activeIndex]) this.heartedLists[this.activeIndex] = undefined;
      this.activeIndex = lIndex;
      this.swiperRInstance?.slideTo(this.activeIndex);
    });
  }

  setHeart(side: 'left' | 'right'): void {
    let ap = this.activePair;
    if (!ap) return;
    let selectedCard = side === 'left' ? ap.left : ap.right;
    let otherCard = side === 'left' ? ap.right : ap.left;

    if (!this.heartedLists[this.activeIndex] || this.heartedLists[this.activeIndex]?.id != selectedCard.id) {
      this.heartedLists[this.activeIndex] = selectedCard;
    }

    // Log interactions
    this.logInteraction('like', selectedCard.id.toString());
    this.logInteraction('dislike', otherCard.id.toString());

    // Auto-save checkpoint
    this.saveCheckpoint(side);
  }

  private async logInteraction(action: 'like' | 'dislike', imageId: string): Promise<void> {
    // Store in IndexedDB for instant response (Method B - Live)
    try {
      await this.indexedDb.storeInteraction({
        user_id: this.userId,
        image_id: imageId,
        action: action,
        timestamp: new Date().toISOString(),
        dataset_version: this.datasetVersion,
        title_variant_id: this.titleVariantId
      });
      console.log(`[IndexedDB] ${action} stored locally for ${imageId}`);
    } catch (error) {
      console.error(`[IndexedDB] Failed to store ${action}`, error);
      // Fallback to direct API call if IndexedDB fails
      this.interactionService.logInteraction(
        action,
        imageId,
        this.userId
      ).subscribe({
        next: () => console.log(`[API Fallback] ${action} logged`),
        error: err => console.error(`[API Fallback] Failed`, err)
      });
    }
  }

  onHeart(side: 'left' | 'right'): void {
    this.setHeart(side);
    const isLastPair = this.activeIndex === this.pairs.length - 1;

    if (isLastPair) {
      console.log("completed", this.heartedLists);
      setTimeout(() => this.router.navigate(['/']), 600);
    } else {
      if (this.activeIndex < (this.pairs.length - 1)) {
        setTimeout(() => {
          this.activeIndex = this.activeIndex + 1;
          this.swiperRInstance?.slideTo(this.activeIndex);
          this.swiperLInstance?.slideTo(this.activeIndex);
        }, 600);
      }
    }
  }

  isHearted(index: number, id: number): boolean {
    if (!this.heartedLists[index]) return false;
    if (this.heartedLists[index]?.id !== id) return false;
    return true;
  }

  goToPrev(): void {
    if (this.activeIndex > 0) {
      setTimeout(() => {
        this.activeIndex = this.activeIndex - 1;
        this.swiperRInstance?.slideTo(this.activeIndex);
        this.swiperLInstance?.slideTo(this.activeIndex);
      }, 400);
    }
  }

  goToNext(): void {
    let isLastPair = this.activeIndex === this.pairs.length - 1;
    if (isLastPair) {
      console.log("completed", this.heartedLists);
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 600);
    }
    if (this.activeIndex < (this.pairs.length - 1)) {
      setTimeout(() => {
        this.activeIndex = this.activeIndex + 1;
        this.swiperRInstance?.slideTo(this.activeIndex);
        this.swiperLInstance?.slideTo(this.activeIndex);
      }, 400);
    }
  }

  // ============================================================
  // SESSION & CHECKPOINT LOGIC
  // ============================================================


  private restoreCheckpoint(): void {
    if (!this.sessionId) return;

    this.http.get<any>(`${this.apiUrl}/checkpoint/${this.sessionId}`).subscribe({
      next: (res) => {
        if (res.found && res.checkpoint) {
          const cp = res.checkpoint;
          console.log('[Checkpoint] Restoring progress:', cp);

          if (cp.current_pair_index && cp.current_pair_index < this.pairs.length) {
            // Advance to next index (since checkpoint saved after completion)
            const nextIndex = cp.current_pair_index + (cp.selected_side ? 1 : 0);
            if (nextIndex < this.pairs.length) {
              this.activeIndex = nextIndex;
              setTimeout(() => {
                this.swiperLInstance?.slideTo(this.activeIndex, 0);
                this.swiperRInstance?.slideTo(this.activeIndex, 0);
              }, 500);
            }
          }
        }
      },
      error: (err) => console.log('[Checkpoint] No valid checkpoint or error', err)
    });
  }

  private saveCheckpoint(selectedSide: string): void {
    const ap = this.activePair;
    if (!ap) return;

    const payload = {
      user_id: this.userId,
      session_id: this.sessionId,
      dataset_version: this.datasetVersion,
      title_variant_id: this.titleVariantId,
      title_text: this.currentTitle,
      current_pair_index: this.activeIndex,
      total_pairs: this.pairs.length,
      pair_left_id: ap.left.id.toString(),
      pair_left_name: ap.left.name,
      pair_right_id: ap.right.id.toString(),
      pair_right_name: ap.right.name,
      selected_side: selectedSide,
      completed: this.activeIndex >= this.pairs.length - 1
    };

    this.http.post(`${this.apiUrl}/checkpoint`, payload).subscribe({
      next: (res) => console.log('[Checkpoint] Saved'),
      error: (err) => console.error('[Checkpoint] Save failed', err)
    });
  }
}
