import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetToPlaylistComponent } from './asset-to-playlist.component';

describe('AssetToPlaylistComponent', () => {
  let component: AssetToPlaylistComponent;
  let fixture: ComponentFixture<AssetToPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetToPlaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetToPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
