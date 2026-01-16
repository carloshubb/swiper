import { Injectable, ElementRef } from '@angular/core';

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  dragDistance: number;
  currentSegment: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class DragService {
  private dragState: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dragDistance: 0,
    currentSegment: null,
  };

  private eventHandlers: {
    mouseDown?: (e: MouseEvent) => void;
    mouseMove?: (e: MouseEvent) => void;
    mouseUp?: (e: MouseEvent) => void;
    touchStart?: (e: TouchEvent) => void;
    touchMove?: (e: TouchEvent) => void;
    touchEnd?: (e: TouchEvent) => void;
  } = {};

  getDragState(): DragState {
    return { ...this.dragState };
  }

  setupDragListeners(
    element: ElementRef,
    callbacks: {
      onDragStart: (state: DragState) => void;
      onDragMove: (state: DragState) => void;
      onDragEnd: (state: DragState) => void;
    }
  ) {
    if (!element?.nativeElement) return;

    const card = element.nativeElement;
    this.removeDragListeners();

    // Create event handlers
    this.eventHandlers.mouseDown = (e: MouseEvent) =>
      this.handleDragStart(e, callbacks.onDragStart);
    this.eventHandlers.mouseMove = (e: MouseEvent) => this.handleDragMove(e, callbacks.onDragMove);
    this.eventHandlers.mouseUp = (e: MouseEvent) => this.handleDragEnd(e, callbacks.onDragEnd);
    this.eventHandlers.touchStart = (e: TouchEvent) =>
      this.handleDragStart(e, callbacks.onDragStart);
    this.eventHandlers.touchMove = (e: TouchEvent) => this.handleDragMove(e, callbacks.onDragMove);
    this.eventHandlers.touchEnd = (e: TouchEvent) => this.handleDragEnd(e, callbacks.onDragEnd);

    // Add event listeners
    card.addEventListener('mousedown', this.eventHandlers.mouseDown);
    document.addEventListener('mousemove', this.eventHandlers.mouseMove);
    document.addEventListener('mouseup', this.eventHandlers.mouseUp);
    card.addEventListener('touchstart', this.eventHandlers.touchStart, { passive: false });
    document.addEventListener('touchmove', this.eventHandlers.touchMove, { passive: false });
    document.addEventListener('touchend', this.eventHandlers.touchEnd);
  }

  public removeDragListeners() {
    if (this.eventHandlers.mouseDown) {
      document.removeEventListener('mousedown', this.eventHandlers.mouseDown);
      document.removeEventListener('mousemove', this.eventHandlers.mouseMove!);
      document.removeEventListener('mouseup', this.eventHandlers.mouseUp!);
      document.removeEventListener('touchstart', this.eventHandlers.touchStart!);
      document.removeEventListener('touchmove', this.eventHandlers.touchMove!);
      document.removeEventListener('touchend', this.eventHandlers.touchEnd!);
    }
  }

  private handleDragStart(event: MouseEvent | TouchEvent, callback: (state: DragState) => void) {
    this.dragState.isDragging = true;
    this.dragState.currentSegment = null;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    this.dragState.startX = clientX;
    this.dragState.startY = clientY;
    this.dragState.currentX = clientX;
    this.dragState.currentY = clientY;
    this.dragState.dragDistance = 0;

    callback(this.dragState);
    event.preventDefault();
  }

  private handleDragMove(event: MouseEvent | TouchEvent, callback: (state: DragState) => void) {
    if (!this.dragState.isDragging) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    this.dragState.currentX = clientX;
    this.dragState.currentY = clientY;
    this.dragState.dragDistance = this.dragState.currentX - this.dragState.startX;

    // Calculate current segment
    this.dragState.currentSegment = this.getDragSegment(clientX, clientY);

    callback(this.dragState);
    event.preventDefault();
  }

  private handleDragEnd(event: MouseEvent | TouchEvent, callback: (state: DragState) => void) {
    if (!this.dragState.isDragging) return;

    this.dragState.isDragging = false;
    callback(this.dragState);
  }

  private getDragSegment(clientX: number, clientY: number): number | null {
    // Calculate relative position from drag start point
    const deltaX = clientX - this.dragState.startX;
    const deltaY = clientY - this.dragState.startY;

    // Calculate distance from drag start point
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // If too close to center, return null (no zone)
    if (distance < 60) return null;

    // Calculate angle in degrees (0 = top, clockwise)
    let angle = (Math.atan2(deltaX, -deltaY) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    // Map angle to segments (1-10, clockwise from top)
    if ((angle >= 342 && angle <= 360) || (angle >= 0 && angle < 18)) {
      return 1; // Top
    } else if (angle >= 18 && angle < 54) {
      return 10; // Top-right (green zone)
    } else if (angle >= 54 && angle < 90) {
      return 9; // Right-top (green zone)
    } else if (angle >= 90 && angle < 126) {
      return 8; // Right-bottom (green zone)
    } else if (angle >= 126 && angle < 162) {
      return 7; // Bottom-right (green zone)
    } else if (angle >= 162 && angle < 198) {
      return 6; // Bottom-left (green zone)
    } else if (angle >= 198 && angle < 234) {
      return 5; // Left-bottom (red zone)
    } else if (angle >= 234 && angle < 270) {
      return 4; // Left-top (red zone)
    } else if (angle >= 270 && angle < 306) {
      return 3; // Top-left (red zone)
    } else if (angle >= 306 && angle < 342) {
      return 2; // Left-top (red zone)
    }

    return 1; // Default fallback
  }

  // Helper methods for template
  isRedZone(segment: number | null): boolean {
    return segment !== null && segment >= 1 && segment <= 5;
  }

  isGreenZone(segment: number | null): boolean {
    return segment !== null && segment >= 6 && segment <= 10;
  }

  // Calculate positions for segment numbers in SVG coordinates
  getSegmentX(segment: number): number {
    const angle = (segment - 1) * 36 * (Math.PI / 180);
    const radius = 120;
    return 200 + Math.sin(angle) * radius;
  }

  getSegmentY(segment: number): number {
    const angle = (segment - 1) * 36 * (Math.PI / 180);
    const radius = 120;
    return 200 - Math.cos(angle) * radius + 5;
  }

  public resetDragState() {
    this.dragState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      dragDistance: 0,
      currentSegment: null,
    };
  }
}
