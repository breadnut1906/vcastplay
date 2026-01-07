import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignLayoutPreviewComponent } from './design-layout-preview.component';

describe('DesignLayoutPreviewComponent', () => {
  let component: DesignLayoutPreviewComponent;
  let fixture: ComponentFixture<DesignLayoutPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignLayoutPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignLayoutPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
