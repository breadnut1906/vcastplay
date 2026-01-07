import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenFilterComponent } from './screen-filter.component';

describe('ScreenFilterComponent', () => {
  let component: ScreenFilterComponent;
  let fixture: ComponentFixture<ScreenFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
