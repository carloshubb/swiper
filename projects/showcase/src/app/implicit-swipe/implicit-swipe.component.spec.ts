import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplicitSwipeComponent } from './implicit-swipe.component';

describe('ImplicitSwipeComponent', () => {
  let component: ImplicitSwipeComponent;
  let fixture: ComponentFixture<ImplicitSwipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImplicitSwipeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImplicitSwipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
