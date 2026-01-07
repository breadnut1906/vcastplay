import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenOtherInfoComponent } from './screen-other-info.component';

describe('ScreenOtherInfoComponent', () => {
  let component: ScreenOtherInfoComponent;
  let fixture: ComponentFixture<ScreenOtherInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenOtherInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenOtherInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
