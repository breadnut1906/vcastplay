import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenHealthStatusComponent } from './screen-health-status.component';

describe('ScreenHealthStatusComponent', () => {
  let component: ScreenHealthStatusComponent;
  let fixture: ComponentFixture<ScreenHealthStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenHealthStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenHealthStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
