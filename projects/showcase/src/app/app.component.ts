import { Component, OnInit, signal } from '@angular/core';
import { ISidebarItems } from './interfaces/sidebar-item.interface';
import { RoutePaths } from './enums/routes.enum';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('scoring-swiper');

  public activeUrl: string = '';

  public sidebarItems: ISidebarItems[] = [{
    route: RoutePaths.ProfileCardComponent,
    text: 'Profile Card'
  }, {
    route: RoutePaths.SwiperShowcaseComponent,
    text: 'Swiper Showcase'
  },
  {
    route: RoutePaths.StartSwipingComponent,
    text: 'Start Swiping'
  },
  {
    route: 'settings',
    text: 'Settings'
  }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        this.activeUrl = this.router.url.slice(1);
      });
  }

  onNavigate(route: string) {
    this.activeUrl = route;
    this.router.navigate([`/${route}`]);
  }
}
