import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulesContentListComponent } from './schedules-content-list.component';

describe('SchedulesContentListComponent', () => {
  let component: SchedulesContentListComponent;
  let fixture: ComponentFixture<SchedulesContentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesContentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulesContentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
