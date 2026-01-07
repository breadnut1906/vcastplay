import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetUploadResultComponent } from './asset-upload-result.component';

describe('AssetUploadResultComponent', () => {
  let component: AssetUploadResultComponent;
  let fixture: ComponentFixture<AssetUploadResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetUploadResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetUploadResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
