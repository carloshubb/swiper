// import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
// import { SharedComponentsModule } from '../../shared/components/shared-components.module';
// import { SharedTranslationModule } from '../../shared/modules/shared-translation/shared-translation.module';
// import { RegistrationModule } from '../../shared/registration/registration.module';
import { CircularProgressComponent } from '../circular-progress/circular-progress.component';
import { ImplicitSwipesComponent } from './implicit-swipes.component';
import { SwipeCardComponent } from './swipe-card/swipe-card.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    ImplicitSwipesComponent,
    SwipeCardComponent
  ],
  imports: [
    CommonModule,
    AsyncPipe,
    IonicModule,
    HttpClientModule,
    // SharedTranslationModule,
    ReactiveFormsModule,
    // ScrollingModule,
    // SharedComponentsModule,
    // RegistrationModule,
    CircularProgressComponent,
  ],
  exports: [ImplicitSwipesComponent, SwipeCardComponent],
})
export class ImplicitSwipesModule { }
