import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetUploadFileComponent } from './asset-upload-file.component';

describe('AssetUploadFileComponent', () => {
  let component: AssetUploadFileComponent;
  let fixture: ComponentFixture<AssetUploadFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetUploadFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetUploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
