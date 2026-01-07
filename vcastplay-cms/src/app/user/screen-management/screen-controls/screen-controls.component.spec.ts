import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenControlsComponent } from './screen-controls.component';

describe('ScreenControlsComponent', () => {
  let component: ScreenControlsComponent;
  let fixture: ComponentFixture<ScreenControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
