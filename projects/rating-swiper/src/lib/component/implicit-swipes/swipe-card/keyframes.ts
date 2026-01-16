import { style } from '@angular/animations';

export const swiperight = [style({ opacity: 1 }), style({ transform: 'translate3d(200vw, 0, 0) rotate3d(0, 0, 1, -80deg)', opacity: 1 })];

export const swipeleft = [style({ opacity: 1 }), style({ transform: 'translate3d(-200vw, 0, 0) rotate3d(0, 0, 1, 80deg)', opacity: 1 })];

export const reverseSwipeRight = [
  style({ transform: 'translate3d(200vw, 0, 0) rotate3d(0, 0, 1, -80deg)', opacity: 1 }),
  style({ transform: 'translate3d(0%, 0, 0) rotate3d(0, 0, 0, 0deg)', opacity: 1 }),
];

export const reverseSwipeLeft = [
  style({ transform: 'translate3d(-200vw, 0, 0) rotate3d(0, 0, 1, 80deg)', opacity: 1 }),
  style({ transform: 'translate3d(0%, 0, 0) rotate3d(0, 0, 0, 0deg)', opacity: 1 }),
];
