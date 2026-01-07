import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignLayoutToolsComponent } from './design-layout-tools.component';

describe('DesignLayoutToolsComponent', () => {
  let component: DesignLayoutToolsComponent;
  let fixture: ComponentFixture<DesignLayoutToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignLayoutToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignLayoutToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
