import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenManagementListItemComponent } from './screen-management-list-item.component';

describe('ScreenManagementListItemComponent', () => {
  let component: ScreenManagementListItemComponent;
  let fixture: ComponentFixture<ScreenManagementListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenManagementListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenManagementListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
