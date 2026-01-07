import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignLayoutListComponent } from './design-layout-list.component';

describe('DesignLayoutListComponent', () => {
  let component: DesignLayoutListComponent;
  let fixture: ComponentFixture<DesignLayoutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignLayoutListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignLayoutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
