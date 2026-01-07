import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenStatusComponent } from './screen-status.component';

describe('ScreenStatusComponent', () => {
  let component: ScreenStatusComponent;
  let fixture: ComponentFixture<ScreenStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
