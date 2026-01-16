import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { ProfileCardComponent } from './profile-card.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { SkipModalComponent } from './components/skip-modal/skip-modal.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { ActionButtonsComponent } from './components/action-buttons/action-buttons.component';
import { IndexedDbService } from '../../services/indexed-db.service';
import { FrontendBradleyTerryService } from '../../services/frontend-bradley-terry.service';
import { SyncService } from '../../services/sync.service';

register();

@NgModule({
  declarations: [
    ProfileCardComponent,
    ProgressBarComponent,
    SkipModalComponent,
    ProfileInfoComponent,
    ActionButtonsComponent
  ],
  imports: [CommonModule],
  exports: [
    ProfileCardComponent,
    SkipModalComponent,
    ProgressBarComponent,
    ProfileInfoComponent,
    ActionButtonsComponent
  ],
  providers: [
    IndexedDbService,
    FrontendBradleyTerryService,
    SyncService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileCardModule { }
