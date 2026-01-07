import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSelectionComponent } from './screen-selection.component';

describe('ScreenSelectionComponent', () => {
  let component: ScreenSelectionComponent;
  let fixture: ComponentFixture<ScreenSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
