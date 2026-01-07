import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenDownloadComponent } from './screen-download.component';

describe('ScreenDownloadComponent', () => {
  let component: ScreenDownloadComponent;
  let fixture: ComponentFixture<ScreenDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenDownloadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
