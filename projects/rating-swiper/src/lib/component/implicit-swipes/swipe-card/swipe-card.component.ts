import { animate, keyframes, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Gesture, GestureConfig, GestureController, GestureDetail } from '@ionic/angular';
import { BehaviorSubject, Subject, distinctUntilChanged, takeUntil } from 'rxjs';
import { IconsType } from '../types/icon-type.type';
import { SwipeTypes } from '../enums/swipes.enum';
import { DummyProfile } from '../models/dummy_profile.model';

import * as kf from './keyframes';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'lib-swipe-card',
  templateUrl: './swipe-card.component.html',
  styleUrls: ['./swipe-card.component.scss'],
  standalone: false,
  animations: [
    trigger('cardAnimator', [
      transition('* => ' + SwipeTypes.swipeRight, animate(900, keyframes(kf.swiperight))),
      transition('* => ' + SwipeTypes.swipeLeft, animate(900, keyframes(kf.swipeleft))),
      transition('* => ' + SwipeTypes.reverseSwipeRight, animate(500, keyframes(kf.reverseSwipeRight))),
      transition('* => ' + SwipeTypes.reverseSwipeLeft, animate(500, keyframes(kf.reverseSwipeLeft))),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwipeCardComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('card') cardElement!: ElementRef<HTMLDivElement>;

  @Input() icons: IconsType['light'|'dark'] | null = null;
  @Input() profile: DummyProfile | undefined;
  @Input() swipingDecision: number | undefined;
  @Input() enableShuffleAnimation: boolean = false;
  @Input() swipeOnClickSubject: Subject<{ direction: string; index: number; swipingDecision: number | null; superLiked?: boolean }> = 
    new Subject<{ direction: string; index: number; swipingDecision: number | null; superLiked?: boolean }>();
  @Input() activeImageIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  @Output() swiped: EventEmitter<{ profile: DummyProfile; liked: boolean; superLiked: boolean }> = new EventEmitter();
  @Output() reversed: EventEmitter<{ profile: DummyProfile }> = new EventEmitter();
  @Output() dragStarted: EventEmitter<void> = new EventEmitter();
  @Output() dragEnded: EventEmitter<void> = new EventEmitter();


  public animationState: string | undefined;

  private gestureX: Gesture | undefined;
  private gestureY: Gesture | undefined;
  private style: CSSStyleDeclaration | undefined;
  private clickToSwitch: boolean = true;
  private componentDestroyed$: Subject<void> = new Subject();

  constructor(
    private gestureCtrl: GestureController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if(this.swipeOnClickSubject){
      this.swipeOnClickSubject.pipe(distinctUntilChanged(), takeUntil(this.componentDestroyed$)).subscribe((res) => {
        if (this.style && !this.animationState && this.profile) {
          if (
            (res.direction === SwipeTypes.swipeLeft || res.direction === SwipeTypes.swipeRight) && 
            res.index === this.profile?.index
          ) {
            this.animationState = res.direction;
            this.onEnd(res.direction, this.style, window.innerWidth, false, res.superLiked);
            this.cdr.detectChanges();
            return;
          }

          if ((res.direction === SwipeTypes.reverseSwipeLeft || res.direction === SwipeTypes.reverseSwipeRight) 
            && this.profile.index && res.index === this.profile?.index - 1) {
            this.animationState = res.direction;
            this.onEnd(res.direction, this.style, window.innerWidth, false, res.superLiked);
            this.cdr.detectChanges();
            return;
          }
        }
      });
    }
    
  }

  ngAfterViewInit(): void {
      this.initGesture();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['profile']){
      if (changes['profile'].currentValue?._id !== changes['profile'].previousValue?._id) {
      if (this.style) {
        this.style.transition = '';
        this.style.transform = '';
        this.style.opacity = '1';
        this.style.display = 'flex';
        this.initGesture();
      }
    }
    }
    
  }

  /**
   * Destroy gesture objects
   */
  ngOnDestroy(): void {
    if (this.gestureX && this.gestureY) {
      this.gestureX.destroy();
      this.gestureY.destroy();
    }
    window.ondragstart = (): boolean => false;
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  /**
   */
  public resetAnimationState(): void {
    this.animationState = '';
  }

  /**
   * Switching photos of a preference
   *
   * @param event
   */
  public handleSwitchImage(event: MouseEvent): void {
    // Check if there was a swipe attempt on card => A swipe attempt on card deactivates clickToSwitch
    if (!this.clickToSwitch) {
      this.clickToSwitch = true;
      return;
    }

    if(this.profile){
      if (!this.profile.profileImageIndex) this.profile.profileImageIndex = 0;

      if (event.x < window.innerWidth / 2 && this.profile.profileImageIndex > 0) {
        this.profile.profileImageIndex--;

      } else if(this.profile.images){
        if(
          event.x >= window.innerWidth / 2 && 
          this.profile.profileImageIndex < this.profile.images?.length - 1) {
            this.profile.profileImageIndex++;
        }

      } 

      if(this.activeImageIndex$){
        this.activeImageIndex$.next(this.profile.profileImageIndex);
      }
    }
    
  }

  /**
   * Initialization of gesture
   */
  private async initGesture(): Promise<void> {
    this.style = this.cardElement.nativeElement.style;

    const windowWidth = window.innerWidth;
    window.ondragstart = (): boolean => false;

    const options1: GestureConfig = {
      el: this.cardElement?.nativeElement,
      gestureName: 'profile-swiperX',
      direction: 'x',
      disableScroll: true,
      gesturePriority: 1,
      onStart: () => {
        if(this.style){
          this.style.transition = 'none';
        }
        this.dragStarted.emit();
      },
      onMove: (event) => this.style ? this.onMove(event, this.style): undefined,
      onEnd: (event) => {
        const direction = event.deltaX > windowWidth / 5 ? SwipeTypes.swipeRight : event.deltaX < -windowWidth / 4 ? SwipeTypes.swipeLeft : '';
        if(this.style){
          this.onEnd(direction, this.style, windowWidth);
        }
      },
    };
    
    const options2: GestureConfig = {
      el: this.cardElement.nativeElement,
      gestureName: 'profile-swiperY',
      direction: 'y',
      disableScroll: true,
      gesturePriority: 0,
      onStart: () => {
        if(this.style){
          this.style.transition = 'none';
          this.dragStarted.emit();
        }
      },
      onMove: (event) => this.style ? this.onMove(event, this.style) : undefined, 
      onEnd: (event) => {
        const direction = event.deltaX > windowWidth / 4 ? SwipeTypes.swipeRight : event.deltaX < -windowWidth / 2 ? SwipeTypes.swipeLeft : '';
        if(this.style){
          this.onEnd(direction, this.style, windowWidth);
        }
      },
    };

    this.gestureX = this.gestureCtrl.create(options1);
    this.gestureY = this.gestureCtrl.create(options2);
    this.gestureX.enable(true);
    this.gestureY.enable(true);
    
  }

  /**
   * @param event
   * @param style
   */
  private onMove(event: GestureDetail, style: CSSStyleDeclaration): void {
    this.clickToSwitch = false;

    if (event.deltaX > 0) {
      style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(-${event.deltaX / 10}deg) `;
    } else {
      style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${(-1 * event.deltaX) / 10}deg) `;
    }
  }

  /**
   * @param direction
   * @param style
   * @param windowWidth
   */
  private onEnd(direction: string, style: CSSStyleDeclaration, windowWidth: number, dragAction = true, superLiked = false): void {
    style.transition = '0.8s ease-out';
    if((this.style) && (!direction || direction == '')) {
      this.style.transition = '';
      this.style.transform = '';
      this.dragEnded.emit();
      return;
    } else if (dragAction) {
      if (this.enableShuffleAnimation) {
        this.updateCardStyles(direction, style, windowWidth, superLiked);
        return;
      } else {
        if (direction === SwipeTypes.swipeRight) {
          style.transform = `translateX(${windowWidth * 2}px)`;
        } else {
          style.transform = `translateX(-${windowWidth * 2}px)`;
        }
        style.opacity = '0';
        // To hide the dragged card and move it back to center of the screen
        
        setTimeout(() => {
          style.transform = ``;
          style.display = 'none';
        }, 150);
      }
    }
    // To let the card move out of the viewport
    setTimeout(() => {
      this.dragEnded.emit();
      this.updateCardStyles(direction, style, windowWidth, superLiked);
    }, 450);
  }

  private updateCardStyles(direction: string, style: CSSStyleDeclaration, windowWidth: number, superLiked: boolean): void {
    if (direction === SwipeTypes.reverseSwipeLeft || direction === SwipeTypes.reverseSwipeRight) {
      setTimeout(() => {
        if(this.profile){
          this.reversed.emit({ profile: this.profile });
        }
        
      }, 50);
    } else if (direction === SwipeTypes.swipeRight || direction === SwipeTypes.swipeLeft) {
      if(this.profile){
        this.swiped.emit({ profile: this.profile, liked: direction === SwipeTypes.swipeRight, superLiked: superLiked });
      }
    }
  }
}
