import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleListItemComponent } from './role-list-item.component';

describe('RoleListItemComponent', () => {
  let component: RoleListItemComponent;
  let fixture: ComponentFixture<RoleListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
