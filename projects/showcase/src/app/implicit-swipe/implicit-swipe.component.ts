import { Component, OnInit } from '@angular/core';
import { DummyProfile, DummyProfileResponse, IconsType, ImplicitSwipesModule } from 'projects/rating-swiper/src/public-api';
import { userInfoData } from './dummydata/swiped-user-info.data';
import { matchingProfileResponse } from './dummydata/matchingProfile.data';
import { Unmatched } from 'projects/rating-swiper/src/lib/component/implicit-swipes/models/unmatched.model';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { icons } from './dummydata/icons.data';

@Component({
  selector: 'app-implicit-swipe',
  standalone: true,
  imports: [ImplicitSwipesModule, AsyncPipe],
  templateUrl: './implicit-swipe.component.html',
  styleUrl: './implicit-swipe.component.css'
})
export class ImplicitSwipeComponent implements OnInit {
  public userInfo: Unmatched = userInfoData;
  public matchingProfile: BehaviorSubject<DummyProfile[]> = new BehaviorSubject<DummyProfile[]>([]);
  public totalNumberOfFakeProfile: number = 0;
  public icons: IconsType['light'] | null = null;
  public swiperTitle: string = '';

  ngOnInit(): void {
    console.log("this.userInfo:", this.userInfo);
    this.icons = icons;
    this.swiperTitle = localStorage.getItem('sw_checkpoint_title') || '';

    if (matchingProfileResponse) {
      if (matchingProfileResponse.docs) {
        this.matchingProfile.next(matchingProfileResponse.docs);
      }

      if (matchingProfileResponse.meta) {
        this.totalNumberOfFakeProfile = matchingProfileResponse.meta.totalDocs;
      }
    }

  }
}
