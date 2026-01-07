import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignEditorToolsComponent } from './design-editor-tools.component';

describe('DesignEditorToolsComponent', () => {
  let component: DesignEditorToolsComponent;
  let fixture: ComponentFixture<DesignEditorToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignEditorToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignEditorToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
