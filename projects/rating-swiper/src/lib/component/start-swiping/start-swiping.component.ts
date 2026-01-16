import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NavigationStateService } from '../../services/navigation-state.service';

@Component({
  selector: 'app-start-swiping',
  standalone: true,
  imports:[RouterOutlet, RouterModule],
  templateUrl: './start-swiping.component.html',
  styleUrl: './start-swiping.component.scss',
})
export class StartSwipingComponent {
  constructor(private router: Router, private navigationState: NavigationStateService) {}

  onBackButtonClick() {
    // Only navigate to profile-card if user has completed at least one full loop
    if (this.navigationState.hasCompletedLoop()) {
      console.log('Navigating back to last swiped card');
      // Set flag to indicate this is back navigation
      this.navigationState.isBackNavigation.set(true);
      this.router.navigate(['/profile-card']);
    } else {
      console.log('Back button clicked but no loop completed yet');
      // Optionally, you could add some feedback to the user here
      // or simply do nothing as per requirements
    }
  }

  onStartSwipingClick() {
    console.log('Start Swiping button clicked - fresh start');
    // Set flag to indicate this is fresh navigation (not back navigation)
    this.navigationState.isBackNavigation.set(false);
    // Navigate to profile-card for fresh start
    this.router.navigate(['/profile-card']);
  }
}
