# Frontend - Auto Training API

[![Angular](https://img.shields.io/badge/Angular-20.0.0-red.svg)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-8.7.1-blue.svg)](https://ionicframework.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-blue.svg)](https://www.typescriptlang.org/)
[![Mobile First](https://img.shields.io/badge/Design-Mobile%20First-green.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)

Professional Angular workspace with a reusable component library and showcase application. Built with **mobile-first design** principles using **Angular 20** and **Ionic Framework**.

## 🏗️ Architecture

This workspace contains two projects:

### 1️⃣ rating-swiper (Library)

A reusable Angular library with swipeable UI components.

**Location**: `projects/rating-swiper/`

**Key Features**:
- Profile card component with swipe functionality
- Implicit swipes with gesture detection
- Progress indicators
- Mobile-first responsive design
- Full TypeScript support
- NPM-ready package

[📖 Library Documentation](./projects/rating-swiper/README.md)

### 2️⃣ showcase (Application)

Demo application showcasing the library components in action.

**Location**: `projects/showcase/`

**Purpose**:
- Live component demonstrations
- Development playground
- Visual testing environment
- API integration examples

[📖 Showcase Documentation](./projects/showcase/README.md)

## 📱 Mobile-First Design Philosophy

This project strictly follows **mobile-first design principles**:

```
1. Design for mobile FIRST (320px+)
2. Progressively enhance for larger screens
3. Use min-width media queries (not max-width)
4. Touch-friendly interactions
5. Performance-optimized for mobile networks
```

### Responsive Breakpoints

| Breakpoint | Device | Design Approach |
|------------|--------|-----------------|
| 320px+ | Small Mobile | **Base styles** (mobile-first) |
| 376px+ | Medium Mobile | Enhanced spacing |
| 600px+ | Tablet Portrait | Larger typography |
| 768px+ | Tablet Landscape | Multi-column layouts |
| 1024px+ | Desktop | Full desktop features |
| 1440px+ | Large Desktop | Max-width containers |

### Example: Mobile-First SCSS

```scss
// ✅ CORRECT: Mobile-first approach
.component {
  padding: 12px;           // Mobile default
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 20px;         // Tablet enhancement
    font-size: 16px;
  }
  
  @media (min-width: 1024px) {
    padding: 24px;         // Desktop enhancement
    font-size: 18px;
  }
}

// ❌ WRONG: Desktop-first (not used in this project)
.component {
  padding: 24px;
  
  @media (max-width: 1024px) {
    padding: 20px;
  }
}
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Angular CLI**: v20.0.0 or higher

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install
```

### Development

#### Run Showcase Application

```bash
# Start on port 4200 (default)
npm start

# Start on port 4201
npm run start:showcase
```

Open `http://localhost:4200` in your browser.

#### Build Library

```bash
# Build the rating-swiper library
npm run build:lib
```

Output: `dist/rating-swiper/`

#### Build Showcase

```bash
# Build the showcase application
npm run build

# Or explicitly
npm run build:showcase
```

Output: `dist/showcase/`

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test -- --code-coverage
```

## 📦 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `ng serve showcase --port 4200` | Serve showcase on port 4200 |
| `start:showcase` | `ng serve showcase --port 4201` | Serve showcase on port 4201 |
| `build` | `ng build showcase` | Build showcase application |
| `build:showcase` | `ng build showcase` | Build showcase explicitly |
| `build:lib` | `ng build rating-swiper` | Build library |
| `watch` | `ng build showcase --watch` | Watch mode for development |
| `test` | `ng test showcase` | Run unit tests |

## 📁 Project Structure

```
frontend/
├── projects/
│   ├── rating-swiper/              # 📚 Angular Library
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── component/      # Reusable components
│   │   │   │   │   ├── profile-card/
│   │   │   │   │   ├── implicit-swipes/
│   │   │   │   │   ├── start-swiping/
│   │   │   │   │   └── circular-progress/
│   │   │   │   ├── services/       # Shared services
│   │   │   │   └── interfaces/     # TypeScript interfaces
│   │   │   └── public-api.ts       # Public API exports
│   │   ├── README.md
│   │   ├── package.json
│   │   └── ng-package.json
│   │
│   └── showcase/                   # 🎨 Demo Application
│       ├── public/                 # Static assets
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.component.*
│       │   │   ├── app-module.ts
│       │   │   ├── app-routing-module.ts
│       │   │   └── implicit-swipe/
│       │   ├── styles.scss         # Global styles
│       │   └── main.ts
│       ├── README.md
│       └── tsconfig.app.json
│
├── angular.json                    # Angular workspace config
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── proxy.conf.json                 # API proxy config
└── README.md                       # This file
```

## 🎨 Styling System

### Ionic CSS Utilities

The project uses Ionic's comprehensive CSS utilities:

```scss
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';
@import '@ionic/angular/css/padding.css';
@import '@ionic/angular/css/float-elements.css';
@import '@ionic/angular/css/text-alignment.css';
@import '@ionic/angular/css/flex-utils.css';
```

### Custom SCSS

Component-specific styles use SCSS with:
- Nested selectors
- Variables
- Mixins
- Mobile-first media queries

## 🔧 Configuration Files

### angular.json

Workspace configuration defining:
- Project structure
- Build configurations
- Development/production settings
- Asset paths
- Style preprocessing

### tsconfig.json

TypeScript configuration with:
- `target: ES2022`
- Strict mode enabled
- Path mappings for imports
- Module resolution strategy

### package.json

Dependencies and scripts:
- **dependencies**: Runtime packages (Angular, Ionic, RxJS)
- **devDependencies**: Build tools and testing frameworks
- **scripts**: NPM commands for common tasks

### proxy.conf.json

API proxy for development:
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 📚 Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@angular/core` | ^20.0.0 | Angular framework |
| `@angular/common` | ^20.0.0 | Common Angular features |
| `@angular/forms` | ^20.0.0 | Form handling |
| `@angular/router` | ^20.0.0 | Routing |
| `@ionic/angular` | 8.7.1 | Ionic UI components |
| `rxjs` | ~7.8.0 | Reactive programming |
| `swiper` | ^11.2.8 | Swiper library |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@angular/cli` | ^20.0.0 | Angular CLI |
| `@angular-devkit/build-angular` | ^20.0.0 | Build tools |
| `ng-packagr` | ^20.0.0 | Library packaging |
| `typescript` | ~5.8.0 | TypeScript compiler |
| `jasmine-core` | ~5.8.0 | Testing framework |
| `karma` | ~6.4.0 | Test runner |

[View full package.json](./package.json)

## 🧪 Testing Strategy

### Unit Tests

- **Framework**: Jasmine + Karma
- **Coverage**: Component logic, services, utilities
- **Commands**:
  ```bash
  npm test                    # Run tests
  npm run test -- --watch     # Watch mode
  ```

### Manual Testing

Mobile-first testing checklist:
- [ ] Test on real mobile devices (iOS/Android)
- [ ] Test in Chrome DevTools responsive mode
- [ ] Test all breakpoints (320px, 375px, 768px, 1024px, 1440px)
- [ ] Test portrait and landscape orientations
- [ ] Test touch interactions
- [ ] Test keyboard navigation
- [ ] Verify smooth animations

### Browser Testing

Supported browsers:
- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 8+)

## 🚢 Building for Production

### Build Library

```bash
npm run build:lib
```

Creates production-ready library package in `dist/rating-swiper/`:
- AOT compiled
- Minified
- Tree-shakeable
- NPM-ready

### Build Showcase

```bash
npm run build
```

Creates optimized production build in `dist/showcase/`:
- Minified HTML, CSS, JS
- Optimized assets
- Source maps (optional)
- Compressed bundles

### Build Optimization

Production builds include:
- **Tree-shaking**: Remove unused code
- **Minification**: Compress code
- **AOT Compilation**: Pre-compile templates
- **Bundle optimization**: Smart chunking
- **CSS optimization**: Remove unused styles

## 🌐 Deployment

### Static Hosting

Deploy `dist/showcase/` to:
- **Netlify**: Drag & drop or Git integration
- **Vercel**: Zero-config deployment
- **GitHub Pages**: Free static hosting
- **AWS S3**: Scalable cloud hosting
- **Azure Static Web Apps**: Enterprise hosting

### Docker Deployment

Nginx configuration provided:
```bash
docker build -t frontend .
docker run -p 80:80 frontend
```

See `nginx.conf` and `nginx-prod.conf` for server configuration.

## 🔍 Performance Optimization

### Bundle Size

Monitor bundle size:
```bash
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/showcase/stats.json
```

### Lazy Loading

Routes are lazy-loaded for optimal performance:
```typescript
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module')
      .then(m => m.FeatureModule)
  }
];
```

### Change Detection

Components use OnPush strategy:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
npx kill-port 4200
# or use different port
ng serve --port 4201
```

**Node modules corrupted:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build cache issues:**
```bash
rm -rf .angular/cache
npm run build
```

### Debug Mode

Enable verbose logging:
```bash
ng serve --verbose
ng build --verbose
```

## 📖 Documentation

- [Angular Documentation](https://angular.io/docs)
- [Ionic Framework](https://ionicframework.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Library README](./projects/rating-swiper/README.md)
- [Showcase README](./projects/showcase/README.md)

## 🎓 Learning Resources

### Mobile-First Design

- [MDN: Mobile First](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)
- [Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)

### Angular

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Best Practices](https://angular.io/guide/best-practices)

### Ionic

- [Ionic Components](https://ionicframework.com/docs/components)
- [Ionic Layout](https://ionicframework.com/docs/layout/structure)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Follow mobile-first design principles
5. Test on multiple devices/breakpoints
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 Code Style

- **Formatter**: Prettier (configured in package.json)
- **Linter**: ESLint with Angular rules
- **Naming**: Follow Angular style guide
- **Comments**: JSDoc for public APIs

### Prettier Configuration

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.html",
      "options": { "parser": "angular" }
    }
  ]
}
```

## ✅ Production Checklist

Before deploying to production:

- [ ] Run `npm run build:lib` successfully
- [ ] Run `npm run build` successfully
- [ ] All tests pass (`npm test`)
- [ ] No console errors or warnings
- [ ] Tested on mobile devices
- [ ] Tested on all major browsers
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Accessibility verified (WCAG 2.1 AA)
- [ ] SEO meta tags configured
- [ ] Analytics integrated (if needed)

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or contributions:
- Check the documentation first
- Review showcase examples
- Check browser console for errors
- Verify responsive behavior in DevTools
- Create an issue with detailed information

---

**Built with ❤️ using Angular, Ionic, and Mobile-First Design Principles**
