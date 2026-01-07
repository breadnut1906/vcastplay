import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleHourListComponent } from './schedule-hour-list.component';

describe('ScheduleHourListComponent', () => {
  let component: ScheduleHourListComponent;
  let fixture: ComponentFixture<ScheduleHourListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleHourListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleHourListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
