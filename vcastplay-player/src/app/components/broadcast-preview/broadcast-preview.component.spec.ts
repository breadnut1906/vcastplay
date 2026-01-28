import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastPreviewComponent } from './broadcast-preview.component';

describe('BroadcastPreviewComponent', () => {
  let component: BroadcastPreviewComponent;
  let fixture: ComponentFixture<BroadcastPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
