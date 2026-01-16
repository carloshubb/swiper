import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartSwipingComponent } from '../../../rating-swiper/src/public-api';
import { ProfileCardComponent } from '../../../rating-swiper/src/public-api';
import { ImplicitSwipeComponent } from './implicit-swipe/implicit-swipe.component';
import { RoutePaths } from './enums/routes.enum';

const routes: Routes = [
  {
    path: RoutePaths.ProfileCardComponent,
    component: ProfileCardComponent
  },
  {
    path: RoutePaths.SwiperShowcaseComponent,
    component: ImplicitSwipeComponent
  },
  {
    path: RoutePaths.StartSwipingComponent,
    component: StartSwipingComponent
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
  },
  { path: `**`, redirectTo: RoutePaths.StartSwipingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
