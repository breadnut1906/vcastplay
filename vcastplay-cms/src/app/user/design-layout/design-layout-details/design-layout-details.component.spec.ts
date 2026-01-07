import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignLayoutDetailsComponent } from './design-layout-details.component';

describe('DesignLayoutDetailsComponent', () => {
  let component: DesignLayoutDetailsComponent;
  let fixture: ComponentFixture<DesignLayoutDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignLayoutDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignLayoutDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
