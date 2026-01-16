import { Component, Input } from '@angular/core';
import { ICardData } from '../../../../interfaces';

@Component({
  selector: 'app-profile-info',
  standalone: false,
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent {
  @Input() card: ICardData | null = null;
}
