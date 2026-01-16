import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { StartSwipingComponent, ModeToggleComponent } from '../../../rating-swiper/src/public-api';
import { ProfileCardModule } from '../../../rating-swiper/src/public-api';

// Register Swiper custom elements
register();

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterOutlet,
    RouterModule,
    AppRoutingModule,
    ProfileCardModule,
    HttpClientModule,
    ModeToggleComponent  // Import standalone component
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [provideAnimations()],
  bootstrap: [AppComponent],
})
export class AppModule { }
