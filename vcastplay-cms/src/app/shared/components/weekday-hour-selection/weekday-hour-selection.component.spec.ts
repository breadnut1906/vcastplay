import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekdayHourSelectionComponent } from './weekday-hour-selection.component';

describe('WeekdayHourSelectionComponent', () => {
  let component: WeekdayHourSelectionComponent;
  let fixture: ComponentFixture<WeekdayHourSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekdayHourSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekdayHourSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
