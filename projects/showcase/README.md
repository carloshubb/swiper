# Rating Swiper Showcase Application

This is the showcase and documentation application for the **Rating Swiper** Angular library. It demonstrates all components, features, and responsive behavior in a live, interactive environment.

## 🎯 Purpose

This showcase application serves multiple purposes:

1. **Live Documentation**: Interactive examples of all library components
2. **Testing Environment**: Development and testing playground
3. **Example Implementation**: Reference implementation for developers
4. **Visual Testing**: Responsive design verification across devices

## 🚀 Running the Showcase

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Angular CLI (v20+)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Development Server

```bash
# Start the showcase application
npm start

# Or explicitly
npm run start:showcase
```

The application will be available at `http://localhost:4200/`

### Building for Production

```bash
# Build the showcase application
npm run build

# Or explicitly
npm run build:showcase
```

The production build will be in `dist/showcase/`

## 📱 Mobile-First Design

The showcase demonstrates **mobile-first responsive design** principles:

### Responsive Navigation

- **Mobile (< 768px)**: Horizontal scrolling menu at the top
- **Tablet (768px - 1023px)**: Vertical sidebar navigation (200px width)
- **Desktop (1024px+)**: Enhanced sidebar navigation (250px width)

### Testing Responsive Behavior

1. **Browser DevTools**: 
   - Press F12
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test various device presets

2. **Real Devices**:
   - Use `ng serve --host 0.0.0.0` to test on local network
   - Access via `http://<your-ip>:4200`

3. **Responsive Breakpoints**:
   ```
   Mobile:           320px - 767px
   Tablet Portrait:  600px - 767px
   Tablet Landscape: 768px - 1023px
   Desktop:          1024px - 1439px
   Large Desktop:    1440px+
   ```

## 📚 Showcase Components

### 1. Profile Card Demo

**Route**: `/profile-card`

Demonstrates the profile card component with:
- Swipeable card interface
- Like/Dislike actions
- Progress tracking
- Responsive layout

**Features Shown**:
- Card swiping mechanics
- Action button interactions
- Progress bar updates
- Responsive text sizing
- Mobile-optimized touch targets

### 2. Swiper Showcase

**Route**: `/swiper-showcase`

Demonstrates advanced swiper features:
- Multiple swipe directions
- Custom animations
- Event handling
- Gesture detection

**Features Shown**:
- Horizontal/vertical swiping
- Swipe velocity detection
- Custom event handlers
- Smooth animations

### 3. Start Swiping

**Route**: `/start-swiping`

Interactive onboarding component:
- Tutorial flow
- User guidance
- Getting started experience

## 🎨 Styling Architecture

### Global Styles

Located in `src/styles.scss`:
```scss
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';
// ... more Ionic utilities
```

### Component Styles

Each component has its own scoped styles:
- `app.component.scss` - Main app layout
- Component-specific styles in library

### Responsive Design Patterns

```scss
// Mobile-first approach
.component {
  // Mobile styles (default)
  padding: 12px;
  
  // Tablet and up
  @media screen and (min-width: 768px) {
    padding: 20px;
  }
  
  // Desktop and up
  @media screen and (min-width: 1024px) {
    padding: 24px;
  }
}
```

## 🔧 Configuration Files

### angular.json

Defines two projects:
1. **rating-swiper** (library)
2. **showcase** (application)

Key configurations:
- Build targets
- Development/production settings
- Asset paths
- Style preprocessing

### tsconfig.json

TypeScript configuration with:
- ES2022 target
- Strict mode enabled
- Path mappings
- Module resolution

### package.json

Scripts available:
```json
{
  "start": "ng serve showcase --port 4200",
  "start:showcase": "ng serve showcase --port 4201",
  "build": "ng build showcase",
  "build:showcase": "ng build showcase",
  "build:lib": "ng build rating-swiper",
  "test": "ng test showcase"
}
```

## 📁 Project Structure

```
projects/
├── rating-swiper/           # Angular library
│   ├── src/
│   │   ├── lib/
│   │   │   ├── component/
│   │   │   │   ├── profile-card/
│   │   │   │   ├── implicit-swipes/
│   │   │   │   ├── start-swiping/
│   │   │   │   └── circular-progress/
│   │   │   ├── services/
│   │   │   └── interfaces/
│   │   └── public-api.ts
│   ├── README.md
│   └── package.json
│
└── showcase/                # Showcase application
    ├── public/
    ├── src/
    │   ├── app/
    │   │   ├── app.component.*
    │   │   ├── app-module.ts
    │   │   ├── app-routing-module.ts
    │   │   └── implicit-swipe/
    │   ├── styles.scss
    │   └── main.ts
    └── tsconfig.app.json
```

## 🧪 Testing

### Component Testing

```bash
npm test
```

Runs Jasmine/Karma tests for all components.

### Manual Testing Checklist

- [ ] Test on mobile devices (iOS/Android)
- [ ] Test on tablets (portrait/landscape)
- [ ] Test on desktop browsers
- [ ] Test touch interactions
- [ ] Test keyboard navigation
- [ ] Test responsive breakpoints
- [ ] Test in landscape orientation
- [ ] Verify smooth animations
- [ ] Check accessibility (ARIA labels)

## 🌐 Browser Testing

### Recommended Testing Matrix

| Browser | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Chrome  | ✓      | ✓      | ✓       |
| Safari  | ✓      | ✓      | ✓       |
| Firefox | -      | ✓      | ✓       |
| Edge    | -      | -      | ✓       |

## 🔍 Debugging

### Enable Source Maps

Development builds include source maps by default.

### Angular DevTools

Install [Angular DevTools](https://angular.io/guide/devtools) browser extension:
- Component inspector
- Profiler
- Router tree

### Console Logging

Key events are logged to console in development mode:
```typescript
if (!environment.production) {
  console.log('Event:', event);
}
```

## 📊 Performance

### Optimization Tips

1. **Lazy Loading**: Components are loaded on-demand
2. **Change Detection**: OnPush strategy for better performance
3. **Bundle Size**: Production builds are optimized
4. **Image Loading**: Lazy loading for images
5. **CSS**: Minimal unused CSS

### Build Optimization

Production builds include:
- Minification
- Tree-shaking
- Ahead-of-Time (AOT) compilation
- Dead code elimination

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The `dist/showcase` folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Azure Static Web Apps
- Any static hosting service

### Nginx Configuration

Example `nginx.conf` is provided in the project root:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 🔐 Environment Variables

Configure in `src/environments/`:
- `environment.ts` - Development
- `environment.prod.ts` - Production

## 📖 API Integration

The showcase connects to a backend API for data:

### Proxy Configuration

`proxy.conf.json` routes API calls:
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false
  }
}
```

### Backend Endpoints

- `GET /api/profiles` - Fetch profile data
- `POST /api/like` - Record like action
- `POST /api/dislike` - Record dislike action

## 🎓 Learning Resources

### Documentation

- [Angular Docs](https://angular.io/docs)
- [Ionic Docs](https://ionicframework.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Component Library

See `/projects/rating-swiper/README.md` for detailed library documentation.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4200
npx kill-port 4200

# Or use a different port
ng serve --port 4201
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Angular cache
rm -rf .angular/cache

# Rebuild
npm run build
```

## 📝 Best Practices

### Code Style

- Use Prettier for formatting
- Follow Angular style guide
- Meaningful component/variable names
- Add JSDoc comments for public APIs

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with meaningful messages
5. Create pull request

## 🆘 Support

For issues or questions:
- Check the library README
- Review showcase examples
- Check browser console for errors
- Verify responsive behavior in DevTools

---

**Happy Coding! 🚀**
