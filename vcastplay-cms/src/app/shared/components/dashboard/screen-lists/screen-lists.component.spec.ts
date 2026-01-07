import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenListsComponent } from './screen-lists.component';

describe('ScreenListsComponent', () => {
  let component: ScreenListsComponent;
  let fixture: ComponentFixture<ScreenListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
