import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSelectContentsComponent } from './playlist-select-contents.component';

describe('PlaylistSelectContentsComponent', () => {
  let component: PlaylistSelectContentsComponent;
  let fixture: ComponentFixture<PlaylistSelectContentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistSelectContentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistSelectContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
