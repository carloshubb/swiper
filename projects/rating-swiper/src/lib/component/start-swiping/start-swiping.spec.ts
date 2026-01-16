import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartSwipingComponent } from './start-swiping.component';

describe('StartSwipingComponent', () => {
  let component: StartSwipingComponent;
  let fixture: ComponentFixture<StartSwipingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StartSwipingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartSwipingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
