import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenMapComponent } from './screen-map.component';

describe('ScreenMapComponent', () => {
  let component: ScreenMapComponent;
  let fixture: ComponentFixture<ScreenMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
