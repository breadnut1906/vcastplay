import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignLayoutListItemComponent } from './design-layout-list-item.component';

describe('DesignLayoutListItemComponent', () => {
  let component: DesignLayoutListItemComponent;
  let fixture: ComponentFixture<DesignLayoutListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignLayoutListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignLayoutListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
