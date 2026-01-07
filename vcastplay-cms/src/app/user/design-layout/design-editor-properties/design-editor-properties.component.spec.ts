import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignEditorPropertiesComponent } from './design-editor-properties.component';

describe('DesignEditorPropertiesComponent', () => {
  let component: DesignEditorPropertiesComponent;
  let fixture: ComponentFixture<DesignEditorPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignEditorPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignEditorPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
