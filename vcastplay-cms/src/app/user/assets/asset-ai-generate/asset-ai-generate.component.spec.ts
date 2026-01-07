import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetAiGenerateComponent } from './asset-ai-generate.component';

describe('AssetAiGenerateComponent', () => {
  let component: AssetAiGenerateComponent;
  let fixture: ComponentFixture<AssetAiGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetAiGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetAiGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
