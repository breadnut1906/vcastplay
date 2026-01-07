import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistItemContentComponent } from './playlist-item-content.component';

describe('PlaylistItemContentComponent', () => {
  let component: PlaylistItemContentComponent;
  let fixture: ComponentFixture<PlaylistItemContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistItemContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistItemContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
