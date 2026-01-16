# Rating Swiper Angular Library

[![Angular](https://img.shields.io/badge/Angular-20.0.0-red.svg)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-8.7.1-blue.svg)](https://ionicframework.com/)
[![NPM](https://img.shields.io/badge/npm-compatible-green.svg)](https://www.npmjs.com/)

A professional, mobile-first Angular library for creating swipeable rating interfaces with modern UI components. Built with **Angular 20** and **Ionic Framework**, this library provides a smooth, responsive experience across all devices.

## 📱 Mobile-First Design

This library follows **mobile-first design principles**, ensuring optimal performance and user experience on:
- 📱 Mobile devices (320px - 767px)
- 📲 Tablets (768px - 1023px)
- 💻 Desktops (1024px+)
- 🔄 Landscape and portrait orientations

## ✨ Features

- **Profile Card Component**: Swipeable card interface for rating/scoring content
- **Implicit Swipes**: Advanced swipe gestures with smooth animations
- **Start Swiping Component**: Interactive onboarding component
- **Circular Progress**: Visual progress indicators
- **Fully Responsive**: Mobile-first design with comprehensive media queries
- **TypeScript Support**: Full type safety and IntelliSense
- **Customizable**: Easy to style and extend
- **Production Ready**: Optimized builds with ng-packagr

## 📦 Installation

```bash
npm install rating-swiper
```

### Peer Dependencies

This library requires the following peer dependencies:

```json
{
  "@angular/common": "^17.3.12",
  "@angular/core": "^17.3.12",
  "@angular/router": "^17.3.12",
  "@ionic/angular": "^8.5.8"
}
```

Install peer dependencies:

```bash
npm install @angular/common @angular/core @angular/router @ionic/angular
```

## 🚀 Quick Start

### 1. Import the Module

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProfileCardModule } from 'rating-swiper';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ProfileCardModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Use in Your Component Template

```html
<lib-profile-card 
  [profiles]="profileData"
  (onSwipe)="handleSwipe($event)"
  (onRate)="handleRating($event)">
</lib-profile-card>
```

### 3. Component TypeScript

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  profileData = [
    // Your profile data
  ];

  handleSwipe(event: any) {
    console.log('Swipe event:', event);
  }

  handleRating(event: any) {
    console.log('Rating event:', event);
  }
}
```

## 📚 Components

### Profile Card Component

The main swipeable card interface for rating content.

**Import:**
```typescript
import { ProfileCardModule, ProfileCardComponent } from 'rating-swiper';
```

**Features:**
- Smooth swipe animations
- Like/Dislike actions
- Progress tracking
- Responsive design
- Custom styling support

### Implicit Swipes Component

Advanced swipe interface with gesture detection.

**Import:**
```typescript
import { ImplicitSwipesModule, ImplicitSwipesComponent } from 'rating-swiper';
```

**Features:**
- Multi-directional swipes
- Gesture animations
- Custom action handlers
- Mobile-optimized

### Start Swiping Component

Interactive component for onboarding users.

**Import:**
```typescript
import { StartSwipingComponent } from 'rating-swiper';
```

## 🎨 Styling & Customization

All components support custom styling through CSS/SCSS variables and class overrides.

### CSS Custom Properties

```css
:root {
  --card-background: #27242c;
  --card-text-color: #ffffff;
  --card-border-radius: 12px;
  --swipe-animation-duration: 300ms;
}
```

### Override Component Styles

```scss
lib-profile-card {
  ::ng-deep .card-meta {
    background-color: rgba(0, 0, 0, 0.7);
    padding: 16px;
  }
}
```

## 📱 Responsive Breakpoints

The library uses the following breakpoints:

| Device Type | Breakpoint | Layout |
|------------|------------|--------|
| Small Mobile | < 375px | Compact layout |
| Mobile | 376px - 599px | Standard mobile |
| Tablet Portrait | 600px - 767px | Enhanced spacing |
| Tablet Landscape | 768px - 1023px | Side-by-side views |
| Desktop | 1024px - 1439px | Full desktop layout |
| Large Desktop | 1440px+ | Max-width centered |

## 🔧 Services

### NavigationStateService

Manages navigation state across components.

```typescript
import { NavigationStateService } from 'rating-swiper';

constructor(private navState: NavigationStateService) {}
```

### CardNavigationService

Handles card navigation logic.

```typescript
import { CardNavigationService } from 'rating-swiper';

constructor(private cardNav: CardNavigationService) {}
```

### DragService

Manages drag interactions.

```typescript
import { DragService } from 'rating-swiper';

constructor(private drag: DragService) {}
```

## 🏗️ Building the Library

### Development Build

```bash
npm run build:lib
```

### Production Build

```bash
ng build rating-swiper --configuration production
```

The built library will be in `dist/rating-swiper/`.

## 🧪 Testing

```bash
npm test
```

## 📖 API Reference

### ProfileCardComponent

**Inputs:**
- `profiles: Profile[]` - Array of profile data
- `autoplay: boolean` - Enable automatic progression
- `loop: boolean` - Enable infinite loop

**Outputs:**
- `onSwipe: EventEmitter<SwipeEvent>` - Emits on swipe action
- `onRate: EventEmitter<RatingEvent>` - Emits on rating action
- `onComplete: EventEmitter<void>` - Emits when all cards completed

### ImplicitSwipesComponent

**Inputs:**
- `data: any[]` - Array of data items
- `swipeDirection: 'horizontal' | 'vertical'` - Swipe direction

**Outputs:**
- `onSwipeLeft: EventEmitter<any>` - Left swipe event
- `onSwipeRight: EventEmitter<any>` - Right swipe event
- `onSwipeUp: EventEmitter<any>` - Up swipe event
- `onSwipeDown: EventEmitter<any>` - Down swipe event

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 8+)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: See the showcase app for examples

## 🎯 Roadmap

- [ ] Additional component variants
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Animation customization options
- [ ] RTL (Right-to-Left) support
- [ ] Dark/Light theme toggle
- [ ] Storybook integration

## 🙏 Acknowledgments

Built with:
- [Angular](https://angular.io/)
- [Ionic Framework](https://ionicframework.com/)
- [Swiper.js](https://swiperjs.com/)

---

**Made with ❤️ using Angular and Ionic**
