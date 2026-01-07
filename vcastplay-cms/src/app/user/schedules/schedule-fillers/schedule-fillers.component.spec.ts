import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFillersComponent } from './schedule-fillers.component';

describe('ScheduleFillersComponent', () => {
  let component: ScheduleFillersComponent;
  let fixture: ComponentFixture<ScheduleFillersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleFillersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleFillersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
