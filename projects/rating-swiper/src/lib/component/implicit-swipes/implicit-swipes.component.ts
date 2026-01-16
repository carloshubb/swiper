import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { SwipeTypes } from './enums/swipes.enum';
import { UserRegistrationRoute } from './enums/user-registration-route.enum';
import { DummyProfile } from './models/dummy_profile.model';
import { environment } from '../../../environments/environment';
import { Unmatched } from './models/unmatched.model';
import { IconsType } from './types/icon-type.type';
import { DummyProfileResponse } from './interfaces/dummy_profile_response.model';
import { ImageModel } from './models/image.model';
import { InteractionResponse } from './interfaces/interaction-response.interface';
import { InteractionService } from '../../../lib/services/interaction.service';

@Component({
  selector: 'lib-implicit-swipes',
  templateUrl: './implicit-swipes.component.html',
  styleUrls: ['./implicit-swipes.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImplicitSwipesComponent implements OnInit, OnDestroy {

  @Input() userInfo!: Unmatched;
  @Input() icons: IconsType['light' | 'dark'] | null = null;
  @Input() profileDetails: DummyProfile[] | null = [];
  @Input() totalNumberOfFakeProfiles: number = 0;
  @Input() matchingProfileData: DummyProfileResponse | null = null;
  @Input() fakeProfilesPageSize?: number = 25;
  @Input() pageSizeThreshold?: number = 5;
  @Input() swiperTitle: string = '';

  @Output() onInit: EventEmitter<void> = new EventEmitter();
  @Output() hideFooter$: EventEmitter<boolean> = new EventEmitter();
  @Output() onSwiped$: EventEmitter<{ profile: DummyProfile; liked: boolean; superLiked?: boolean }> = new EventEmitter();
  @Output() updateLocalEntity$: EventEmitter<{ userInfo: Unmatched, reduce: boolean }> = new EventEmitter();

  public clientSettings: boolean = false;
  public swipesChanged: boolean = false;
  public swipableIndex: number = 0;
  public lastIndexReached = false;

  public profiles$: Subject<DummyProfile[]> = new Subject();
  public swipeOnClickSubject: Subject<{ direction: string; index: number; swipingDecision: number | null; superLiked?: boolean }> = new Subject();
  private componentDestroyed$: Subject<void> = new Subject();

  public firstCardSwipableIndex: number = 0;
  public secondCardSwipableIndex: number = 0;

  public superLikeCount: number = 1;
  public fakeProfilesSwipeHistory: string[] = [];
  private subscriptions: Subscription[] = [];

  public readonly superLikeCreditCount: number = 20;
  public showFooter: boolean = false;
  public initiateReverseSwipeIndex: 0 | 1 = 0;
  public selectedProfileActiveImageIndex$: BehaviorSubject<number> = new BehaviorSubject(0);

  public selectedProfile: DummyProfile | undefined;
  public animateProfileDetails: boolean = false;

  public placeholderProfilePics: ImageModel[] = [
    { fileName: '1', image: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=800', isDark: false },
    { fileName: '2', image: 'https://images.pexels.com/photos/1921168/pexels-photo-1921168.jpeg?auto=compress&cs=tinysrgb&w=800', isDark: false },
    { fileName: '3', image: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', isDark: false },
    { fileName: '4', image: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=800', isDark: false },
    { fileName: '5', image: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', isDark: false },
  ];

  private updatedUserInfo: Partial<Unmatched> | undefined;
  public minProfilesSwitched: number = 20;
  public maxProfilesSwitched: number = 100;
  public isProfileLoaded: Subject<boolean> = new Subject();

  get numberOfProfilesSwiped(): number {
    if (this.userInfo) {
      return this.userInfo.swipingDecisions?.length ?? 0;
    }
    return 0;
  }

  constructor(
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private interactionService: InteractionService
  ) { }

  private logInteraction(action: string, profile: DummyProfile) {
    this.interactionService.logInteraction(
      action as 'like' | 'dislike' | 'superlike',
      profile._id || 'unknown',
      this.userInfo?._id || 'anonymous'
    ).subscribe({
      next: (res: InteractionResponse) => console.log('Interaction logged via Service', res),
      error: (err) => console.error('Error logging interaction via Service', err)
    });
  }

  ngOnInit(): void {
    this.initSwiper();
  }

  async initSwiper(): Promise<void> {
    await this.initSwipesSettings();

    if (this.userInfo) {
      if (typeof this.userInfo.superLikeCount === 'number') this.superLikeCount = this.userInfo.superLikeCount;
      if (!this.userInfo.visitedSwipeIndexes) {
        this.userInfo.visitedSwipeIndexes = [];
      }
    }

    if (this.numberOfProfilesSwiped > 0) {
      this.swipableIndex = this.numberOfProfilesSwiped;
    } else if (this.numberOfProfilesSwiped == 0) {
      this.swipableIndex = 0;
    }

    this.updateProfileDetails();

    if (this.profileDetails?.length) {
      this.updateIndexes();
    }

    const profilesSwipedInDynamicRoutes = this.getOccurrence(this.fakeProfilesSwipeHistory, UserRegistrationRoute['swipe']);
    if (this.numberOfProfilesSwiped > profilesSwipedInDynamicRoutes) {
      this.fakeProfilesSwipeHistory.push(...Array(this.numberOfProfilesSwiped - profilesSwipedInDynamicRoutes).fill(UserRegistrationRoute['swipe']));
      if (this.userInfo) {
        this.userInfo.fakeProfilesSwipeHistory = this.fakeProfilesSwipeHistory;
        this.updateLocalEntity$.emit({ userInfo: this.userInfo, reduce: true });
      }
    }
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  public hasUnsavedChanges(): boolean {
    return this.swipesChanged;
  }

  public onDislike(): void {
    this.animateProfileDetails = true;
    this.swipeOnClickSubject.next({
      direction: SwipeTypes.swipeLeft,
      index: this.swipableIndex,
      swipingDecision: this.getSwipingDecision()
    });
  }

  public onLike(): void {
    this.animateProfileDetails = true;
    this.swipeOnClickSubject.next({
      direction: SwipeTypes.swipeRight,
      index: this.swipableIndex,
      swipingDecision: this.getSwipingDecision()
    });
  }

  public onSuperLike(): void {
    this.animateProfileDetails = true;
    this.swipeOnClickSubject.next({
      direction: SwipeTypes.swipeRight,
      index: this.swipableIndex,
      swipingDecision: this.getSwipingDecision(),
      superLiked: true
    });
  }

  public onSwiped(event: { profile: DummyProfile; liked: boolean; superLiked?: boolean }, firstCardSwiped: boolean): void {
    const action = event.superLiked ? 'superlike' : (event.liked ? 'like' : 'dislike');
    this.logInteraction(action, event.profile);

    if (this.totalNumberOfFakeProfiles > this.swipableIndex) {
      this.isProfileLoaded.next(false);
      this.cdr.detectChanges();

      this.onSwiped$.emit(event);

      if (this.userInfo) {
        this.userInfo.swipingDecisions = this.userInfo.swipingDecisions || [];

        if (!this.userInfo.swipingDecisions) {
          this.userInfo.swipingDecisions = [];
        }

        if (event.superLiked) {
          this.superLikeCount--;
          this.userInfo.swipingDecisions[this.swipableIndex] = {
            id: event?.profile?._id ? event?.profile?._id : '',
            decision: 2
          };
        } else {
          this.userInfo.swipingDecisions[this.swipableIndex] = {
            id: event?.profile?._id ? event?.profile?._id : '',
            decision: event.liked === true ? 1 : 0
          };
        }

        this.swipableIndex += 1;
        this.updateLocalEntity(false);

        if (this.userInfo.visitedSwipeIndexes) {
          if (this.swipableIndex % this.superLikeCreditCount === 0 &&
            this.userInfo.visitedSwipeIndexes.indexOf(this.swipableIndex) < 0) {
            this.superLikeCount += 1;
            this.userInfo.visitedSwipeIndexes.push(this.swipableIndex);
          }
        }
      }
    } else {
      this.lastIndexReached = true;
    }

    this.updateIndexes(firstCardSwiped);
    this.swipesChanged = true;
    this.animateProfileDetails = false;
    this.isProfileLoaded.next(true);
    this.cdr.detectChanges();
  }

  public onReversed(event: { profile: DummyProfile }, firstCardSwiped: boolean): void {
    setTimeout(() => {
      this.initiateReverseSwipeIndex = 0;
      this.updateIndexes();
      this.updateLocalEntity(true);
    }, 50);
  }

  public onOk(): void {
    this.clearSubscriptions();
  }

  public onBack(): void {
    if (this.swipableIndex >= 1 && this.initiateReverseSwipeIndex === 0) {
      this.initiateReverseSwipeIndex = 1;
      this.swipableIndex -= 1;

      if (this.userInfo && this.userInfo.swipingDecisions) {
        const previousSwipingDecision = this.userInfo.swipingDecisions[this.swipableIndex]?.decision >= 1 ?
          SwipeTypes.reverseSwipeRight : SwipeTypes.reverseSwipeLeft;

        if (this.userInfo.swipingDecisions[this.swipableIndex]?.decision === 2) this.superLikeCount++;

        this.updateLocalEntity(false);

        this.swipeOnClickSubject.next({
          direction: previousSwipingDecision,
          index: this.swipableIndex,
          swipingDecision: this.getSwipingDecision()
        });
      }
    }
  }

  public onContinue(): boolean {
    return true;
  }

  public switchProfilePic(index: number): void {
    if (this.selectedProfile) {
      this.selectedProfile.profileImageIndex = index;
      this.selectedProfileActiveImageIndex$.next(index);
    }
  }

  public onDragStarted(): void {
    this.animateProfileDetails = true;
    this.cdr.detectChanges();
  }

  public onDragEnded(): void {
    this.animateProfileDetails = false;
    this.cdr.detectChanges();
  }

  private getSwipingDecision(): number | null {
    if (this.userInfo && this.userInfo.swipingDecisions) {
      if (this.userInfo.swipingDecisions?.length - 1 >= this.swipableIndex) {
        return this.userInfo.swipingDecisions[this.swipableIndex]?.decision;
      }
    }
    return null;
  }

  private updateProfileDetails() {
    this.updatePlaceholderProfileImages();
    if (this.profileDetails) {
      this.profiles$.next(this.profileDetails);
      this.isProfileLoaded.next(true);
    }
  }

  private updateIndexes(firstCardSwiped?: boolean) {
    if (firstCardSwiped) {
      this.firstCardSwipableIndex = this.swipableIndex + 1;
    } else if (firstCardSwiped === undefined) {
      this.firstCardSwipableIndex = this.swipableIndex;
      this.secondCardSwipableIndex = this.swipableIndex + 1;
    } else {
      this.firstCardSwipableIndex = this.swipableIndex;
      this.secondCardSwipableIndex = this.swipableIndex + 1;
    }

    if (this.profileDetails) {
      this.selectedProfile = this.profileDetails[this.swipableIndex];
      this.selectedProfileActiveImageIndex$.next(this.selectedProfile?.profileImageIndex ?? 0);
      this.cdr.detectChanges();
    }
  }

  private updateLocalEntity(reduce: boolean): void {
    if (this.userInfo) {
      this.updateLocalEntity$.next({
        userInfo: this.userInfo, reduce
      });
    }
  }

  private getLikedProfiles(): number {
    if (this.userInfo && this.userInfo.swipingDecisions) {
      return this.userInfo.swipingDecisions.filter((swipingDecision) => swipingDecision.decision >= 0.5)?.length;
    }
    return 0;
  }

  private getOccurrence(array: string[], value: string): number {
    return array.filter((v) => v === value).length;
  }

  private initSwipes(): void {
    this.fakeProfilesSwipeHistory = this.userInfo?.fakeProfilesSwipeHistory ?? [];
    const shouldUpdateIndexes: boolean = !this.profileDetails?.length;

    if (shouldUpdateIndexes) this.updateIndexes();

    this.updateProfileDetails();
    this.cdr.detectChanges();
  }

  private initSwipesSettings(): void {
    this.initSwipes();
    this.onInit.emit();

    if (this.activeRoute.snapshot.routeConfig?.data && this.activeRoute.snapshot.routeConfig?.data['clientSettings']) {
      this.clientSettings = this.activeRoute.snapshot.routeConfig?.data['clientSettings'];

      if (this.clientSettings) {
        this.hideFooter$.emit(true);
      }
    }
  }

  public updatePlaceholderProfileImages(): void {
    if (this.profileDetails) {
      this.profileDetails.forEach((profileDetail) => {
        profileDetail.images = Array.from(this.placeholderProfilePics);
        profileDetail.images.unshift({ fileName: 'main', image: profileDetail.imageUrl ? profileDetail.imageUrl : '', isDark: false });
        profileDetail.profileImageIndex = 0;
      });
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
