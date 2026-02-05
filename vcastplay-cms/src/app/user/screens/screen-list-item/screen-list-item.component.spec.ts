import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenListItemComponent } from './screen-list-item.component';

describe('ScreenListItemComponent', () => {
  let component: ScreenListItemComponent;
  let fixture: ComponentFixture<ScreenListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
