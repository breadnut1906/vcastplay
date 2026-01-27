import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSettingsComponent } from './screen-settings.component';

describe('ScreenSettingsComponent', () => {
  let component: ScreenSettingsComponent;
  let fixture: ComponentFixture<ScreenSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
