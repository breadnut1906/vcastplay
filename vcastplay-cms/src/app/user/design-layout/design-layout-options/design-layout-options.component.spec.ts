import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignLayoutOptionsComponent } from './design-layout-options.component';

describe('DesignLayoutOptionsComponent', () => {
  let component: DesignLayoutOptionsComponent;
  let fixture: ComponentFixture<DesignLayoutOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignLayoutOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignLayoutOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
