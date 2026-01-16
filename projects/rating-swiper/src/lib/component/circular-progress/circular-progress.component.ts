import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CircularProgressComponent {
  @Input() percent = 0;
  private pathLength = 145;

  /**
   *
   * @returns Calculate progress
   */
  public calcProgress(): string {
    const value = this.pathLength - (this.pathLength * this.percent) / 100;
    return `${value} ${this.pathLength}`;
  }
}
