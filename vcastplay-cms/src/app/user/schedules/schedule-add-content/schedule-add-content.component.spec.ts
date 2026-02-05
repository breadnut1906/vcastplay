import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAddContentComponent } from './schedule-add-content.component';

describe('ScheduleAddContentComponent', () => {
  let component: ScheduleAddContentComponent;
  let fixture: ComponentFixture<ScheduleAddContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleAddContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAddContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
