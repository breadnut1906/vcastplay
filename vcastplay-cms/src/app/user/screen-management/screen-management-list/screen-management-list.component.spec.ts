import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenManagementListComponent } from './screen-management-list.component';

describe('ScreenManagementListComponent', () => {
  let component: ScreenManagementListComponent;
  let fixture: ComponentFixture<ScreenManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenManagementListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
